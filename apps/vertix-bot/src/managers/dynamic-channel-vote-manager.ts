import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { GuildTimingsConfig } from "@vertix.gg/data/src/config/guild-timings-config";

import type { IDynamicChannelVoteStoredState } from "@vertix.gg/data/src/interfaces/dynamic-channel-vote";

import type { TVoteTimings } from "@vertix.gg/definitions/src/guild-timings-definitions";

import type { GuildChannel, MessageComponentInteraction, VoiceChannel } from "discord.js";

export interface IVoteDefaultComponentInteraction extends MessageComponentInteraction<"cached"> {
    channel: VoiceChannel;
}

/**
 * Told that a vote has changed, and handed what it now is - or nothing at all, when it is over.
 *
 * The manager knows what a vote is made of and nothing about where it might be written down, so it
 * says what happened and leaves the writing to whoever opened the vote. That also keeps it free of
 * a database it would otherwise need mocking away in every test.
 */
export type TVoteChangedCallback = ( channelId: string, state: IDynamicChannelVoteStoredState | null ) => void;

interface IVoteEvent<TChannel> {
    state: VoteEventState;

    channel: TChannel;

    startTime?: number;
    endTime?: number;

    isInitialInterval: boolean;
    isInitialCandidate: boolean;

    /**
     * The timings this vote runs on, settled when it starts.
     *
     * Held per event rather than per manager so a guild that chose its own is honoured without the
     * manager having to know what a guild is - whoever starts the vote resolves them and hands
     * them over.
     */
    timings: TVoteTimings;

    intervalHandler?: NodeJS.Timeout;

    /**
     * Who opened the vote, and the message it is drawn on.
     *
     * Ids rather than the interaction and message objects they came from: those cannot outlive the
     * process, and the only thing ever asked of the interaction was the id of whoever it belonged
     * to. Holding the id instead is what lets a vote be written down and picked back up.
     */
    initiatorId?: string;
    messageId?: string;

    onChanged?: TVoteChangedCallback;
}

interface IVoterData {
    [memberId: string]: {
        candidateOnly?: boolean;
    };
}

enum VoteManagerResult {
    Fail = 0,
    Success = "success",
    Already = "already",
    SelfManage = "self-manage",
    NoChannelId = "no-channel-id",
    NotRunning = "not-running"
}

type VoteEventCallback<TChannel> = ( channel: TChannel, state: VoteEventState, args?: any ) => Promise<void>;
type VoteEventState = "idle" | "starting" | "active" | "done";

// TODO: convert to object oriented.
export class DynamicChannelVoteManager<
    TInteraction extends IVoteDefaultComponentInteraction = IVoteDefaultComponentInteraction,
    TChannel extends VoiceChannel | GuildChannel = VoiceChannel
> extends InitializeBase {
    private static instance: DynamicChannelVoteManager;

    private debugger: Debugger = new Debugger( this );

    private readonly voteRunTime: number;
    private readonly voteAddTime: number;
    private readonly voteTimerIntervalTime: number;

    // Used to keep track of who voted for what.
    private voteKeeper: {
        [channelId: string]: {
            [memberId: string]: string; // targetId
        };
    } = {};

    /**
     * @example voteMembers[ channel.id ].votes[ targetMemberId ][ userWhoVotedId ] = content;
     */
    private voteMembers: {
        [channelId: string]: {
            channel: TChannel;

            votes: {
                [targetId: string]: IVoterData;
            };
        };
    } = {};

    private events: {
        [channelId: string]: IVoteEvent<TChannel>;
    } = {};

    public static getName() {
        return "VertixBot/Managers/ChannelVote";
    }

    public static getInstance() {
        if ( !this.instance ) {
            this.instance = new DynamicChannelVoteManager();
        }

        return this.instance;
    }

    public static get $() {
        return DynamicChannelVoteManager.getInstance();
    }

    public constructor( runTime?: number, addTime?: number, timerInterval?: number ) {
        super();

        const defaults = GuildTimingsConfig.$.getDefaults();

        this.voteRunTime = runTime ?? defaults.voteTimeout;
        this.voteAddTime = addTime ?? defaults.voteAddTime;
        this.voteTimerIntervalTime = timerInterval ?? defaults.voteTimerInterval;

        this.logger.info( this.constructor.name, "Initialized with time settings:", this.getTimeSettings() );
    }

    // TODO: Base timer.
    public destroy() {
        Object.entries( this.events ).forEach( ( [ , event ] ) => {
            clearInterval( event.intervalHandler );
        } );
    }

    /**
     * Function `start()` - Opens a vote on a channel.
     *
     * `timings` is what the guild runs on, resolved by the caller - left out, the vote runs on the
     * manager's own. Stays synchronous on purpose: whoever starts a vote adds the first candidate
     * immediately afterwards, which only works while the state is already active by the time this
     * returns.
     */
    public start(
        channel: TChannel,
        callback: VoteEventCallback<TChannel>,
        args: {
            initiatorId?: string;
            messageId?: string;
            timings?: TVoteTimings;
            onChanged?: TVoteChangedCallback;
        } = {}
    ) {
        if ( !this.events[ channel.id ] ) {
            this.setInitialEventState( channel );
        }

        if ( "active" === this.events[ channel.id ].state ) {
            this.logger.error(
                this.start,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Channel already running`
            );

            return;
        }

        const event = this.events[ channel.id ];

        if ( args.initiatorId ) {
            event.initiatorId = args.initiatorId;
        }

        if ( args.messageId ) {
            event.messageId = args.messageId;
        }

        if ( args.timings ) {
            event.timings = args.timings;
        }

        event.onChanged = args.onChanged;

        event.state = "active";
        event.startTime = Date.now();
        event.endTime = Date.now() + event.timings.voteTimeout;

        this.notifyChanged( channel.id );

        this.arm( channel, callback );

        this.logger.info( this.start, `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Vote started` );
    }

    /**
     * Function restore() :: Picks a vote back up exactly where the last run left it.
     *
     * The deadline comes back as it was written rather than counted again from now, so a vote whose
     * time ran out during the outage is seen to have run out: the first tick closes it, announces
     * the winner it already had and hands the room over, which is what it would have done had
     * nothing stopped.
     */
    public restore(
        channel: TChannel,
        stored: IDynamicChannelVoteStoredState,
        callback: VoteEventCallback<TChannel>,
        onChanged?: TVoteChangedCallback
    ) {
        this.setInitialEventState( channel );

        const event = this.events[ channel.id ];

        event.state = "active";
        event.startTime = stored.startedAt;
        event.endTime = stored.endsAt;
        event.isInitialInterval = stored.isInitialInterval;
        event.isInitialCandidate = stored.isInitialCandidate;
        event.timings = stored.timings;
        event.initiatorId = stored.initiatorId;
        event.messageId = stored.messageId;
        event.onChanged = onChanged;

        this.voteMembers[ channel.id ] = { channel, votes: {} };
        this.voteKeeper[ channel.id ] = { ... stored.votes };

        const votes = this.voteMembers[ channel.id ].votes;

        stored.candidateIds.forEach( ( candidateId ) => {
            votes[ candidateId ] = { [ candidateId ]: { candidateOnly: true } };
        } );

        Object.entries( stored.votes ).forEach( ( [ voterId, targetId ] ) => {
            if ( !votes[ targetId ] ) {
                votes[ targetId ] = {};
            }

            votes[ targetId ][ voterId ] = {};
        } );

        this.logger.info(
            this.restore,
            `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Vote restored, ` +
                `candidates: '${ stored.candidateIds.length }', votes: '${ Object.keys( stored.votes ).length }'`
        );

        this.arm( channel, callback );
    }

    /**
     * Function arm() :: Ticks once, then keeps ticking while there is still a vote to tick for.
     *
     * The guard is what makes a restored vote safe to arm at all: a vote whose deadline has already
     * passed is stopped by that first tick, and an interval set afterwards would belong to nothing
     * and go on firing for the rest of the process.
     */
    private arm( channel: TChannel, callback: VoteEventCallback<TChannel> ) {
        void this.timer( channel, callback ).then( () => {
            const event = this.events[ channel.id ];

            if ( "active" !== event?.state ) {
                return;
            }

            event.intervalHandler = setInterval(
                this.timer.bind( this, channel, callback ),
                event.timings.voteTimerInterval
            );
        } );
    }

    public stop( channel: TChannel, callback: VoteEventCallback<TChannel> ) {
        if ( "active" !== this.events[ channel.id ]?.state ) {
            this.logger.error(
                this.stop,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Channel not running`
            );

            return;
        }

        const intervalHandler = this.events[ channel.id ].intervalHandler;

        intervalHandler && clearInterval( intervalHandler );

        this.events[ channel.id ].state = "done";

        this.logger.info(
            this.stop,
            `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Channel stopped in ${ Date.now() - this.getStartTime( channel.id ) }ms`
        );

        this.logger.debug(
            this.stop,
            `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Votes:`,
            this.getResults( channel.id )
        );

        callback( channel, this.events[ channel.id ].state ).then( () => {
            this.clear( channel.id );
        } );
    }

    public addVote( interaction: TInteraction, targetId: string ): VoteManagerResult {
        return this.addInternal( interaction, { targetId } );
    }

    public addCandidate( interaction: TInteraction ): VoteManagerResult {
        return this.addInternal( interaction, { isCandidate: true } );
    }

    public removeVote( interaction: TInteraction ): VoteManagerResult {
        const channelId = interaction.channelId;

        if ( !channelId ) {
            this.logger.error(
                this.removeVote,
                `Guild id: '${ interaction.guildId }', user id: '${ interaction.user.id }' - Interaction has no channelId`
            );
            return VoteManagerResult.NoChannelId;
        }

        if ( "active" !== this.events[ channelId ]?.state ) {
            this.logger.error(
                this.addVote,
                `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Channel not running`
            );
            return VoteManagerResult.NotRunning;
        }

        if ( !this.voteMembers[ channelId ] ) {
            this.logger.warn(
                this.removeVote,
                `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Interaction has no channel in membersVote`
            );
            return VoteManagerResult.Fail;
        }

        const channel = this.voteMembers[ channelId ],
            targetId = this.voteKeeper[ channelId ][ interaction.user.id ];

        if ( !channel.votes[ targetId ] ) {
            return VoteManagerResult.Fail;
        }

        delete channel.votes[ targetId ][ interaction.user.id ];

        // Remove who voted for what.
        delete this.voteKeeper[ channelId ][ interaction.user.id ];

        this.logger.log(
            this.removeVote,
            `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Vote removed`
        );

        this.notifyChanged( channelId );

        return VoteManagerResult.Success;
    }

    public getCandidatesCount( channelId: string ): number {
        const memberVotes = this.voteMembers[ channelId ]?.votes;
        if ( !memberVotes ) {
            return 0;
        }

        return Object.keys( memberVotes ).length;
    }

    // TODO: I dont like this.
    public getResults( channelId: string ): { [targetId: string]: number } {
        const memberVotes = this.voteMembers[ channelId ];
        if ( !memberVotes ) {
            return {};
        }

        const voteResult: { [targetId: string]: number } = {};

        for ( const targetId in memberVotes.votes ) {
            if ( memberVotes.votes.hasOwnProperty( targetId ) ) {
                const votes = memberVotes.votes[ targetId ];

                for ( const [ , value ] of Object.entries( votes ) ) {
                    if ( !value.candidateOnly ) {
                        if ( !voteResult[ targetId ] ) {
                            voteResult[ targetId ] = 0;
                        }

                        voteResult[ targetId ]++;
                    } else {
                        // Add candidate.
                        voteResult[ targetId ] = 0;
                    }
                }
            }
        }

        // this.logger.debug( this.getResults,
        //     `Guild id: '${ memberVotes.channel?.guildId }', channel id: '${ channelId }' - Vote results:`,
        //     voteResult
        // );

        return voteResult;
    }

    public getWinnerId( channelId: string ): string {
        const initiatorId = this.events[ channelId ]?.initiatorId || "";

        // In case of tie, the initiator wins.
        const results = this.getResults( channelId );
        let winnerId = initiatorId;

        for ( const targetId in results ) {
            if ( results.hasOwnProperty( targetId ) ) {
                if ( results[ targetId ] > results[ winnerId ] ) {
                    winnerId = targetId;
                }
            }
        }

        return winnerId;
    }

    public getEvents(): { [channelId: string]: IVoteEvent<TChannel> } {
        return this.events;
    }

    public getState( channelId: string ): VoteEventState {
        const state = this.events[ channelId ]?.state;

        if ( state === "active" && this.events[ channelId ].isInitialInterval ) {
            return "starting";
        }

        return this.events[ channelId ]?.state || "idle";
    }

    public getInitiatorId( channelId: string ): string {
        return this.events[ channelId ]?.initiatorId || "";
    }

    public getStartTime( channelId: string ): number {
        return this.events[ channelId ]?.startTime || 0;
    }

    public getEndTime( channelId: string ): number {
        return this.events[ channelId ]?.endTime || 0;
    }

    public isTimeExpired( channelId: string ): boolean {
        // TODO: Check why it happens.
        const updateTime = this.events[ channelId ]?.endTime as number;

        if ( !updateTime ) {
            this.logger.error( this.isTimeExpired, `Channel id: '${ channelId }' - No endTime` );
            return false;
        }

        return Date.now() > updateTime;
    }

    public getTimeSettings() {
        return {
            runTime: this.voteRunTime,
            addTime: this.voteAddTime,
            timerIntervalTime: this.voteTimerIntervalTime
        };
    }

    public getVotedFor( interaction: TInteraction ): string {
        const channelId = interaction.channelId;
        if ( !channelId ) {
            this.logger.error(
                this.getVotedFor,
                `Guild id: '${ interaction.guildId }', user id: '${ interaction.user.id }' - Interaction has no channelId`
            );
            return "";
        }

        const memberVotes = this.voteKeeper[ channelId ];
        if ( !memberVotes ) {
            this.logger.warn(
                this.getVotedFor,
                `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Interaction has no channel in votes`
            );
            return "";
        }

        return memberVotes[ interaction.user.id ];
    }

    public getMemberVotes( channelId: string ): { [userId: string]: string } {
        const memberVotes = this.voteKeeper[ channelId ];

        if ( !memberVotes ) {
            this.logger.warn( this.getMemberVotes, `Channel id: '${ channelId }' - No member votes found` );
            return {};
        }

        return memberVotes;
    }

    public hasVoted( interaction: TInteraction ): boolean {
        const channelId = interaction.channelId;
        if ( !channelId ) {
            this.logger.error(
                this.hasVoted,
                `Guild id: '${ interaction.guildId }', user id: '${ interaction.user.id }' - Interaction has no channelId`
            );
            return false;
        }

        const memberVotes = this.voteKeeper[ channelId ];
        if ( !memberVotes ) {
            this.logger.warn(
                this.hasVoted,
                `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Interaction has no channel in votes`
            );
            return false;
        }

        return !!memberVotes[ interaction.user.id ];
    }

    public clear( channelId: string ) {
        this.logger.debug( this.clear, `Channel id: '${ channelId }' - Clearing votes` );

        // Read before the reset, because the reset is what drops it - and the news that this vote
        // is over is the last thing whoever was writing it down needs to hear.
        const onChanged = this.events[ channelId ]?.onChanged;

        delete this.voteMembers[ channelId ];
        delete this.voteKeeper[ channelId ];

        this.setInitialEventState( this.events[ channelId ].channel as TChannel );

        onChanged?.( channelId, null );
    }

    private setInitialEventState( channel: TChannel ) {
        this.events[ channel.id ] = {
            channel,
            state: "idle",
            isInitialInterval: true,
            isInitialCandidate: true,
            timings: this.getTimings()
        };
    }

    private getTimings(): TVoteTimings {
        return {
            voteTimeout: this.voteRunTime,
            voteAddTime: this.voteAddTime,
            voteTimerInterval: this.voteTimerIntervalTime
        };
    }

    private addTime( channelId: string, baseTime = this.events[ channelId ].endTime ) {
        this.events[ channelId ].endTime = ( baseTime || 0 ) + this.events[ channelId ].timings.voteAddTime;
    }

    /**
     * Function snapshot() :: The vote as something that can be written down.
     *
     * Built from the same objects the vote is run out of rather than kept alongside them, so there
     * is nothing to fall out of step - and it is only ever the plain facts, because everything else
     * the manager holds is either a timer or a channel this process happens to have.
     */
    private snapshot( channelId: string ): IDynamicChannelVoteStoredState | null {
        const event = this.events[ channelId ];

        if ( !event?.messageId || "active" !== event.state ) {
            return null;
        }

        const votes = this.voteMembers[ channelId ]?.votes ?? {};

        return {
            channelId,
            messageId: event.messageId,
            initiatorId: event.initiatorId ?? "",
            startedAt: event.startTime ?? 0,
            endsAt: event.endTime ?? 0,
            isInitialInterval: event.isInitialInterval,
            isInitialCandidate: event.isInitialCandidate,
            timings: event.timings,
            candidateIds: Object.keys( votes ).filter( ( targetId ) => votes[ targetId ][ targetId ]?.candidateOnly ),
            votes: { ... ( this.voteKeeper[ channelId ] ?? {} ) }
        };
    }

    /**
     * Function notifyChanged() :: Says what the vote now is, when there is a vote to describe.
     *
     * Silent rather than saying "nothing" when there is no snapshot to build - nothing is what
     * `clear()` says, and it means the vote is over. A vote that cannot be described yet is not a
     * vote that has ended, and reporting it as one would rub out the record of a live one.
     */
    private notifyChanged( channelId: string ) {
        const onChanged = this.events[ channelId ]?.onChanged;

        if ( !onChanged ) {
            return;
        }

        const snapshot = this.snapshot( channelId );

        if ( !snapshot ) {
            return;
        }

        onChanged( channelId, snapshot );
    }

    private addInternal( interaction: TInteraction, args: any ): VoteManagerResult {
        // TODO: Add type for args.
        function initChannel( this: any, channelId: string, targetId: string ) {
            if ( !this.voteMembers[ channelId ] ) {
                this.voteMembers[ channelId ] = {
                    channel: interaction.channel,
                    votes: {}
                };
            }

            const channel = this.voteMembers[ channelId ];

            if ( !channel.votes[ targetId ] ) {
                channel.votes[ targetId ] = {};
            }

            return channel;
        }

        const channelId = interaction.channelId;

        this.debugger.dumpDown( this.addInternal, {
            channelId,
            args
        } );

        if ( !channelId ) {
            this.logger.error(
                this.addInternal,
                `Guild id: '${ interaction.guildId }', user id: '${ interaction.user.id }' - Interaction has no channelId`
            );

            return VoteManagerResult.NoChannelId;
        }

        if ( "active" !== this.events[ channelId ]?.state ) {
            this.logger.error(
                this.addInternal,
                `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Channel not running`
            );

            return VoteManagerResult.NotRunning;
        }

        if ( args.isCandidate ) {
            const channel = initChannel.call( this, channelId, interaction.user.id );

            this.logger.info(
                this.addInternal,
                `Guild id: '${ interaction.guildId }', channel id: '${ channelId }' - User id: '${ interaction.user.id }'`
            );

            // Check if the candidate is already in the list.
            if ( channel.votes[ interaction.user.id ][ interaction.user.id ] ) {
                return VoteManagerResult.Already;
            }

            // TODO: Test.
            if ( !this.events[ channelId ].isInitialCandidate ) {
                this.addTime( channelId );
            }

            this.events[ channelId ].isInitialCandidate = false;

            channel.votes[ interaction.user.id ][ interaction.user.id ] = {
                candidateOnly: true
            };

            this.notifyChanged( channelId );

            return VoteManagerResult.Success;
        }

        const targetId = args.targetId;

        this.logger.info(
            this.addInternal,
            `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Target id: '${ targetId }'`
        );

        // Self votes does not counted.
        if ( interaction.user.id === targetId ) {
            this.logger.debug(
                this.addInternal,
                `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Trying self vote`
            );
            return VoteManagerResult.SelfManage;
        }

        if ( !this.voteKeeper[ channelId ] ) {
            this.voteKeeper[ channelId ] = {};
        }

        // If vote already exists.
        if ( this.voteKeeper[ channelId ][ interaction.user.id ] ) {
            return VoteManagerResult.Already;
        }

        // Save whom voted for what.
        this.voteKeeper[ channelId ][ interaction.user.id ] = targetId;

        const channel = initChannel.call( this, channelId, targetId );

        channel.votes[ targetId ][ interaction.user.id ] = {};

        this.logger.log(
            this.addInternal,
            `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Vote added`
        );

        this.notifyChanged( channelId );

        return VoteManagerResult.Success;
    }

    private async timer( channel: TChannel, callback: VoteEventCallback<TChannel> ) {
        const channelId = channel.id as string,
            state = this.getState( channelId );

        await callback( channel, state );

        // Written down only as it turns over, rather than on every tick: it says whether the vote
        // is still drawing its opening screen, which it stops being once and never becomes again.
        const wasInitialInterval = this.events[ channelId ].isInitialInterval;

        this.events[ channelId ].isInitialInterval = false;

        if ( wasInitialInterval ) {
            this.notifyChanged( channelId );
        }

        // Check if endTime passed.
        if ( this.isTimeExpired( channelId ) ) {
            await this.stop( channel, callback );
        }
    }
}
