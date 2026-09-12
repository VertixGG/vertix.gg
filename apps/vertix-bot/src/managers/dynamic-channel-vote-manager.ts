import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { GuildTimingsConfig } from "@vertix.gg/data/src/config/guild-timings-config";

import type { TVoteTimings } from "@vertix.gg/definitions/src/guild-timings-definitions";

import type { GuildChannel, MessageComponentInteraction, VoiceChannel } from "discord.js";

export interface IVoteDefaultComponentInteraction extends MessageComponentInteraction<"cached"> {
    channel: VoiceChannel;
}

interface IVoteEvent<TInteraction, TChannel> {
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

    initiatorInteraction?: TInteraction;
}

interface IVoterData<TInteraction> {
    [memberId: string]: {
        interaction: TInteraction;
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

// TODO: What happens when bot restarts? should it be saved in the database?
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
                [targetId: string]: IVoterData<TInteraction>;
            };
        };
    } = {};

    private events: {
        [channelId: string]: IVoteEvent<TInteraction, TChannel>;
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
        initiatorInteraction?: TInteraction,
        timings?: TVoteTimings
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

        // TODO: Remove `initiatorInteraction` its not needed.
        if ( initiatorInteraction ) {
            this.events[ channel.id ].initiatorInteraction = initiatorInteraction;
        }

        if ( timings ) {
            this.events[ channel.id ].timings = timings;
        }

        const eventTimings = this.events[ channel.id ].timings;

        this.events[ channel.id ].state = "active";
        this.events[ channel.id ].startTime = Date.now();
        this.events[ channel.id ].endTime = Date.now() + eventTimings.voteTimeout;

        this.timer( channel, callback ).then( () => {
            this.events[ channel.id ].intervalHandler = setInterval(
                this.timer.bind( this, channel, callback ),
                eventTimings.voteTimerInterval
            );

            this.logger.info( this.start, `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Vote started` );
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
        const initiatorId = this.events[ channelId ]?.initiatorInteraction?.user.id || "";

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

    public getEvents(): { [channelId: string]: IVoteEvent<TInteraction, TChannel> } {
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
        return this.events[ channelId ]?.initiatorInteraction?.user.id || "";
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

        delete this.voteMembers[ channelId ];
        delete this.voteKeeper[ channelId ];

        this.setInitialEventState( this.events[ channelId ].channel as TChannel );
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
                interaction,
                candidateOnly: true
            };

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

        channel.votes[ targetId ][ interaction.user.id ] = { interaction };

        this.logger.log(
            this.addInternal,
            `Guild id: '${ interaction.guildId }', channel id: '${ channelId }', user id: '${ interaction.user.id }' - Vote added`
        );

        return VoteManagerResult.Success;
    }

    private async timer( channel: TChannel, callback: VoteEventCallback<TChannel> ) {
        const channelId = channel.id as string,
            state = this.getState( channelId );

        await callback( channel, state );

        this.events[ channelId ].isInitialInterval = false;

        // Check if endTime passed.
        if ( this.isTimeExpired( channelId ) ) {
            await this.stop( channel, callback );
        }
    }
}
