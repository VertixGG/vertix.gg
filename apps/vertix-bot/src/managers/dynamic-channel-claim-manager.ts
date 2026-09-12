import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { InitializeBase } from "@vertix.gg/base/src/bases/index";

import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";

import { MasterChannelDataManager } from "@vertix.gg/data/src/managers/master-channel-data-manager";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { TClaimTimings } from "@vertix.gg/definitions/src/guild-timings-definitions";

import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

import type { UIDefinitionLoader } from "@vertix.gg/gui/src/runtime/ui-definition-loader";

import type { ChannelExtended } from "@vertix.gg/data/src/models/channel/channel-client-extend";

import type { IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type { IVoteDefaultComponentInteraction } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

// import { TopGGManager } from "@vertix.gg/bot/src/managers/top-gg-manager";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

import type { TAdapterMapping, UIService } from "@vertix.gg/gui/src/ui-service";

import type { Client, Guild, GuildChannel, GuildMember, Message, VoiceBasedChannel, VoiceChannel } from "discord.js";

interface TDynamicChannelClaimAdapters {
    claimStartAdapter(): TAdapterMapping[ "base" ];
    claimVoteAdapter(): TAdapterMapping[ "execution" ];
    claimResultAdapter(): TAdapterMapping[ "execution" ];
}

interface TDynamicChannelClaimFallbacks {
    claimResultSteps?: Record<string, string>;
    claimVoteSteps?: Record<string, string>;
    claimVoteStepInEntity?: string;
    claimVoteAddEntity?: string;
}

interface TDynamicChannelClaimManagerRegisterArgs {
    adapters: TDynamicChannelClaimAdapters;

    dynamicChannelClaimButtonId: string;

    definitionLoader?: UIDefinitionLoader;
    fallbacks?: TDynamicChannelClaimFallbacks;
}

export class DynamicChannelClaimManager extends InitializeBase {
    private readonly debugger: Debugger = new Debugger( this, "", isDebugEnabled( "MANAGER", this.getName() ) );

    private static instances: Map<string, DynamicChannelClaimManager> = new Map();

    private uiService: UIService;

    private dynamicChannelService: DynamicChannelService;

    private readonly definitionLoader?: UIDefinitionLoader;
    private claimFlowsReady: Promise<void> | null = null;
    private claimResultStateSteps?: Map<string, string>;
    private claimVoteTransitionSteps?: Map<string, string>;
    private claimVoteStepInEntity?: string;
    private claimVoteAddEntity?: string;
    private readonly fallbackClaimResultSteps: Record<string, string>;
    private readonly fallbackClaimVoteSteps: Record<string, string>;
    private readonly fallbackClaimVoteStepInEntity: string;
    private readonly fallbackClaimVoteAddEntity: string;
    private static readonly CLAIM_RESULT_FLOW_NAME = "VertixBot/UI-V3/ClaimResultFlow";
    private static readonly CLAIM_RESULT_STATES = {
        OwnerStop: "VertixBot/UI-V3/ClaimResultFlow/States/OwnerStop",
        AddedSuccessfully: "VertixBot/UI-V3/ClaimResultFlow/States/AddedSuccessfully",
        AlreadyAdded: "VertixBot/UI-V3/ClaimResultFlow/States/AlreadyAdded",
        VoteAlreadySelf: "VertixBot/UI-V3/ClaimResultFlow/States/VoteAlreadySelf",
        VoteSuccess: "VertixBot/UI-V3/ClaimResultFlow/States/VoteSuccess",
        VoteSameChoice: "VertixBot/UI-V3/ClaimResultFlow/States/VoteSameChoice",
        VoteUpdated: "VertixBot/UI-V3/ClaimResultFlow/States/VoteUpdated"
    } as const;
    private static readonly DEFAULT_CLAIM_RESULT_STEP_FALLBACKS: Record<string, string> = {
        [ DynamicChannelClaimManager.CLAIM_RESULT_STATES.OwnerStop ]: "VertixBot/UI-V3/ClaimResultOwnerStop",
        [ DynamicChannelClaimManager.CLAIM_RESULT_STATES.AddedSuccessfully ]:
            "VertixBot/UI-V3/ClaimResultAddedSuccessfully",
        [ DynamicChannelClaimManager.CLAIM_RESULT_STATES.AlreadyAdded ]: "VertixBot/UI-V3/ClaimResultAlreadyAdded",
        [ DynamicChannelClaimManager.CLAIM_RESULT_STATES.VoteAlreadySelf ]:
            "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted",
        [ DynamicChannelClaimManager.CLAIM_RESULT_STATES.VoteSuccess ]: "VertixBot/UI-V3/ClaimResultVotedSuccessfully",
        [ DynamicChannelClaimManager.CLAIM_RESULT_STATES.VoteSameChoice ]:
            "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame",
        [ DynamicChannelClaimManager.CLAIM_RESULT_STATES.VoteUpdated ]:
            "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully"
    };
    private static readonly CLAIM_VOTE_TRANSITIONS = {
        StartVote: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/StartVote",
        AddCandidate: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/AddCandidate",
        VoteSelf: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSelf",
        VoteSuccess: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSuccess",
        VoteSame: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteSame",
        VoteUpdated: "VertixBot/UI-V3/ClaimVoteFlow/Transitions/VoteUpdated"
    } as const;
    private static readonly DEFAULT_CLAIM_VOTE_STEP_FALLBACKS: Record<string, string> = {
        [ DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.StartVote ]: "VertixBot/UI-V3/ClaimResultAddedSuccessfully",
        [ DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.AddCandidate ]: "VertixBot/UI-V3/ClaimResultAlreadyAdded",
        [ DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.VoteSelf ]:
            "VertixBot/UI-V3/ClaimResultVoteAlreadySelfVoted",
        [ DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.VoteSuccess ]:
            "VertixBot/UI-V3/ClaimResultVotedSuccessfully",
        [ DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.VoteSame ]:
            "VertixBot/UI-V3/ClaimResultVoteAlreadyVotedSame",
        [ DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.VoteUpdated ]:
            "VertixBot/UI-V3/ClaimResultVoteUpdatedSuccessfully"
    };
    private static readonly DEFAULT_CLAIM_VOTE_STEP_IN_ENTITY = "VertixBot/UI-V3/ClaimVoteStepInButton";
    private static readonly DEFAULT_CLAIM_VOTE_ADD_ENTITY = "VertixBot/UI-V3/ClaimVoteAddButton";

    /**
     * A sweep per guild, each on the interval that guild chose.
     *
     * A guild's timer lives exactly as long as it has a channel being tracked - it is raised by the
     * first one and cleared with the last, so a guild nobody abandoned a channel in costs nothing.
     */
    private readonly guildTimers: Map<string, { interval: NodeJS.Timeout; timings: TClaimTimings }> = new Map();

    /**
     * Whether anything has been swept yet, which is what makes the first sweep clear the stale
     * "Claim Channel" buttons a previous run left behind.
     */
    private hasHandledAbandonedChannels = false;

    private trackedChannels: {
        [channelId: string]: {
            timestamp: number;
            channel: VoiceBasedChannel;
            owner: GuildMember;
        };
    } = {};

    private claimableChannels: {
        [channelId: string]: VoiceBasedChannel;
    } = {};

    public static getName() {
        return "VertixBot/Managers/DynamicChannelClaimManager";
    }

    public static register( instanceName: string, args: TDynamicChannelClaimManagerRegisterArgs ) {
        // Check if instance already exists.
        if ( DynamicChannelClaimManager.instances.has( instanceName ) ) {
            throw new Error(
                `Error in '${ DynamicChannelClaimManager.getName() }', Instance '${ instanceName }' already exists.`
            );
        }

        const instance = new DynamicChannelClaimManager(
            args.adapters,
            args.dynamicChannelClaimButtonId,
            args.definitionLoader,
            args.fallbacks
        );

        DynamicChannelClaimManager.instances.set( instanceName, instance );

        return instance;
    }

    /**
     * Function refreshGuildTimers() :: Puts every registered manager back on a guild's timings.
     *
     * The interface that changes them has no business knowing which UI versions happen to be
     * registered, and in headless mode none of them are.
     */
    public static async refreshGuildTimers( guildId: string ) {
        await Promise.all(
            Array.from( DynamicChannelClaimManager.instances.values() ).map( ( instance ) =>
                instance.refreshGuild( guildId )
            )
        );
    }

    public static get( instanceName: string ) {
        if ( !DynamicChannelClaimManager.instances.has( instanceName ) ) {
            throw new Error(
                `Error in '${ DynamicChannelClaimManager.getName() }', Instance '${ instanceName }' does not exist.`
            );
        }

        return DynamicChannelClaimManager.instances.get( instanceName )!;
    }

    protected constructor(
        private adapters: TDynamicChannelClaimAdapters,
        private dynamicChannelClaimButtonId: string,
        definitionLoader?: UIDefinitionLoader,
        fallbacks?: TDynamicChannelClaimFallbacks
    ) {
        super();

        EventBus.$.on( "VertixBot/Services/App", "onReady", this.onBotReady.bind( this ) );

        EventBus.$.on(
            "VertixBot/Services/DynamicChannel",
            "onOwnerJoinDynamicChannel",
            this.onOwnerJoinDynamicChannel.bind( this )
        );

        EventBus.$.on(
            "VertixBot/Services/DynamicChannel",
            "onOwnerLeaveDynamicChannel",
            this.onOwnerLeaveDynamicChannel.bind( this )
        );

        EventBus.$.on(
            "VertixBot/Services/DynamicChannel",
            "onLeaveDynamicChannelEmpty",
            this.onLeaveDynamicChannelEmpty.bind( this )
        );

        EventBus.$.on(
            "VertixBot/Services/DynamicChannel",
            "updateChannelOwnership",
            this.onUpdateChannelOwnership.bind( this )
        );

        this.uiService = ServiceLocator.$.get( "VertixGUI/UIService" );
        this.dynamicChannelService = ServiceLocator.$.get( "VertixBot/Services/DynamicChannel" );
        this.definitionLoader = definitionLoader;
        this.fallbackClaimResultSteps = {
            ...DynamicChannelClaimManager.DEFAULT_CLAIM_RESULT_STEP_FALLBACKS,
            ...( fallbacks?.claimResultSteps ?? {} )
        };
        this.fallbackClaimVoteSteps = {
            ...DynamicChannelClaimManager.DEFAULT_CLAIM_VOTE_STEP_FALLBACKS,
            ...( fallbacks?.claimVoteSteps ?? {} )
        };
        this.fallbackClaimVoteStepInEntity =
            fallbacks?.claimVoteStepInEntity ?? DynamicChannelClaimManager.DEFAULT_CLAIM_VOTE_STEP_IN_ENTITY;
        this.fallbackClaimVoteAddEntity =
            fallbacks?.claimVoteAddEntity ?? DynamicChannelClaimManager.DEFAULT_CLAIM_VOTE_ADD_ENTITY;

        if ( this.definitionLoader ) {
            this.claimFlowsReady = this.initializeFlowMetadata();
        }
    }

    private async initializeFlowMetadata(): Promise<void> {
        if ( !this.definitionLoader ) {
            return;
        }

        const loadFlowSafely = async( name: string ) => {
            try {
                return await this.definitionLoader!.loadFlow( name );
            } catch( error ) {
                this.logger.warn(
                    this.initializeFlowMetadata,
                    `Unable to load flow '${ name }' from exported definitions`,
                    error
                );
                return undefined;
            }
        };

        const loadAdapterSafely = async( name: string ) => {
            try {
                return await this.definitionLoader!.loadAdapter( name );
            } catch( error ) {
                this.logger.warn(
                    this.initializeFlowMetadata,
                    `Unable to load adapter '${ name }' from exported definitions`,
                    error
                );
                return undefined;
            }
        };

        const claimResultFlow = await loadFlowSafely( DynamicChannelClaimManager.CLAIM_RESULT_FLOW_NAME );

        if ( claimResultFlow ) {
            this.claimResultStateSteps = new Map();

            for ( const state of claimResultFlow.states ) {
                const executionStep = state.definition.options?.executionStep;

                if ( typeof executionStep === "string" && executionStep.length ) {
                    this.claimResultStateSteps.set( state.definition.key, executionStep );
                }
            }
        }

        const claimVoteAdapter = await loadAdapterSafely( "VertixBot/UI-V3/ClaimVoteAdapter" );

        if ( claimVoteAdapter ) {
            this.claimVoteTransitionSteps = new Map();

            for ( const binding of claimVoteAdapter.bindings ) {
                const triggers = binding.definition.flowTriggers ?? [];

                for ( const trigger of triggers ) {
                    if ( trigger.navigation?.executionStep ) {
                        this.claimVoteTransitionSteps.set( trigger.transition, trigger.navigation.executionStep );
                    }

                    if ( trigger.transition === DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.StartVote ) {
                        this.claimVoteStepInEntity = binding.definition.entity;
                    }

                    if ( trigger.transition === DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.VoteSuccess ) {
                        this.claimVoteAddEntity = binding.definition.entity;
                    }
                }
            }
        }
    }

    private async resolveClaimResultStep( stateKey: string ): Promise<string> {
        if ( this.claimFlowsReady ) {
            await this.claimFlowsReady;
        }

        const fallback = this.fallbackClaimResultSteps[ stateKey ];

        return this.claimResultStateSteps?.get( stateKey ) ?? fallback ?? stateKey;
    }

    private async resolveClaimVoteTriggerStep( transition: string ): Promise<string> {
        if ( this.claimFlowsReady ) {
            await this.claimFlowsReady;
        }

        const fallback = this.fallbackClaimVoteSteps[ transition ];

        return this.claimVoteTransitionSteps?.get( transition ) ?? fallback ?? transition;
    }

    private getClaimVoteStepInEntity(): string {
        return this.claimVoteStepInEntity ?? this.fallbackClaimVoteStepInEntity;
    }

    private getClaimVoteAddEntity(): string {
        return this.claimVoteAddEntity ?? this.fallbackClaimVoteAddEntity;
    }

    // TODO: Base timer.
    public destroy() {
        this.guildTimers.forEach( ( timer ) => clearInterval( timer.interval ) );

        this.guildTimers.clear();
    }

    public async getChannelOwnershipTimeout( guildId: string ) {
        return ( await this.resolveGuildTimings( guildId ) ).claimOwnershipTimeout;
    }

    /**
     * Function refreshGuild() :: Puts a guild back on the timings it now holds.
     *
     * A guild with nothing tracked has no timer to rebuild - the next channel it abandons raises
     * one, and reads the timings then.
     */
    public async refreshGuild( guildId: string ) {
        const timer = this.guildTimers.get( guildId );

        if ( !timer ) {
            return;
        }

        const timings = await this.resolveGuildTimings( guildId );

        // The timeout is read on every sweep, so holding it is enough - the interval is what the
        // running timer was built with, and only a change there is worth rebuilding for.
        if ( timings.claimOwnershipTimerInterval === timer.timings.claimOwnershipTimerInterval ) {
            timer.timings = timings;

            return;
        }

        this.clearGuildTimer( guildId );

        await this.ensureGuildTimer( guildId );
    }

    public async addChannelTracking( owner: GuildMember, channel: VoiceBasedChannel ) {
        // Check if channel supports "Claim Channel".
        const trackingData = {
            owner,
            channel,
            timestamp: Date.now()
        };

        this.logger.info(
            this.addChannelTracking,
            `Channel id: '${ channel.id }' - Adding owner id: '${ owner.id }' to tracking list`
        );

        this.trackedChannels[ channel.id ] = trackingData;

        await this.ensureGuildTimer( channel.guildId );
    }

    public removeChannelOwnerTracking( ownerId: string, channelId?: string ) {
        if ( !channelId?.length ) {
            this.logger.log(
                this.removeChannelOwnerTracking,
                `Channel id is not provided! - Removing all owners with id: '${ ownerId }' from tracking.`
            );

            const affectedGuildIds = new Set<string>();

            Object.keys( this.trackedChannels ).forEach( ( _channelId ) => {
                const channelData = this.trackedChannels[ _channelId ];

                if ( channelData.owner.id === ownerId ) {
                    this.debugger.log(
                        this.removeChannelOwnerTracking,
                        `Channel id: '${ _channelId }' owner id: '${ ownerId }' - Removing channel from tracking according to ownerId.`
                    );

                    affectedGuildIds.add( channelData.channel.guildId );

                    delete this.trackedChannels[ _channelId ];
                }
            } );

            affectedGuildIds.forEach( ( guildId ) => this.clearGuildTimerWhenEmpty( guildId ) );

            return;
        }

        this.removeChannelTracking( channelId );
    }

    public removeChannelTracking( channelId: string ) {
        const channel = this.trackedChannels[ channelId ]?.channel;

        if ( !channel ) {
            this.logger.log( this.removeChannelTracking, `Channel: '${ channelId }' is not tracked!` );
            return;
        }

        this.logger.info( this.removeChannelTracking, `Channel id: '${ channel.id }' - Removing channel from tracking.` );

        delete this.trackedChannels[ channelId ];

        this.clearGuildTimerWhenEmpty( channel.guildId );
    }

    public markChannelAsClaimable( channel: VoiceBasedChannel ) {
        this.debugger.log(
            this.markChannelAsClaimable,
            `Guild Id: '${ channel.guildId }', channel id: '${ channel.id }' - Marking channel as claimable.`
        );

        this.claimableChannels[ channel.id ] = channel;
    }

    public unmarkChannelAsClaimable( channel: VoiceBasedChannel ) {
        this.debugger.log(
            this.unmarkChannelAsClaimable,
            `Guild Id: '${ channel.guildId }', channel id: '${ channel.id }' - Unmarking channel as claimable.`
        );

        delete this.claimableChannels[ channel.id ];
    }

    public isOwnerTracked( ownerId: string ) {
        return !!this.trackedChannels[ ownerId ];
    }

    public isChannelClaimable( channelId: string ) {
        return !!this.claimableChannels[ channelId ];
    }

    /**
     * Function handleAbandonedChannels() :: Ensures that all abandoned added to abandon list,
     * so timer can handle them later, the function is called on bot start.
     */
    public async handleAbandonedChannels(
        client: Client,
        specificChannels?: VoiceChannel[],
        specificChannelsDB?: ChannelExtended[]
    ) {
        await this.uiService.waitForAdapter( this.adapters.claimStartAdapter().getName() );

        this.debugger.dumpDown( this.handleAbandonedChannels, {
            specificChannels,
            specificChannelsDB
        } );

        const handleChannels = async( dynamicChannels: ChannelExtended[] ) => {
            for ( const channelDB of dynamicChannels ) {
                const guild = client.guilds.cache.get( channelDB.guildId );

                if ( !guild ) {
                    this.logger.error(
                        this.handleAbandonedChannels,
                        `Guild id: '${ channelDB.guildId }' - Guild is not found!`
                    );
                    continue;
                }

                if ( !channelDB.userOwnerId ) {
                    this.logger.error(
                        this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Channel has no owner!`
                    );
                    continue;
                }

                const channel = guild.channels.cache.get( channelDB.channelId );

                if ( !channel || !channel.isVoiceBased() ) {
                    this.logger.error(
                        this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Channel is not found!`
                    );
                    continue;
                }

                // If it startup process, remove old "Claim Channel" button.
                // TODO: Not good place for this.
                if ( !this.hasHandledAbandonedChannels ) {
                    // Remove old "Claim Channel" button.
                    await this.adapters.claimStartAdapter().deleteRelatedComponentMessagesInternal( channel );
                }

                if ( !( await this.isClaimButtonEnabled( channel ) ) ) {
                    continue;
                }

                // Check if channel vote is idle.
                const state = DynamicChannelVoteManager.$.getState( channel.id );

                if ( state !== "idle" ) {
                    this.logger.log(
                        this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Vote is not idle: '${ state }'`
                    );
                    continue;
                }

                // Check if member is in channel.
                const member = ( channel as GuildChannel ).members.get( channelDB.userOwnerId );

                if ( member ) {
                    this.logger.log(
                        this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Owner id: '${ channelDB.userOwnerId }' is not abandoned!`
                    );
                    continue;
                }

                // Get member from guild.
                const owner = await guild.members.fetch( channelDB.userOwnerId );

                if ( !owner ) {
                    this.logger.error(
                        this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Owner id: '${ channelDB.userOwnerId }' is not found!`
                    );
                    continue;
                }

                await this.addChannelTracking( owner, channel as VoiceBasedChannel );
            }
        };

        if ( specificChannelsDB?.length ) {
            await handleChannels( specificChannelsDB );
        } else if ( !specificChannels?.length ) {
            for ( const guild of client.guilds.cache.values() ) {
                const dynamicChannels = await ChannelModel.$.getDynamics( guild.id );

                await handleChannels( dynamicChannels );
            }
        } else {
            const dynamicChannels = await Promise.all(
                specificChannels.map(
                    async( channel ) => ( await ChannelModel.$.getByChannelId( channel.id ) ) as ChannelExtended
                )
            );

            await handleChannels( dynamicChannels );
        }

        this.hasHandledAbandonedChannels = true;
    }

    public async handleVoteRequest( interaction: IVoteDefaultComponentInteraction, forceMessage?: Message<true> ) {
        // if ( ! await TopGGManager.$.isVoted( interaction.user.id ) ) {
        //     return await TopGGManager.$.sendVoteEmbed( interaction );
        // }

        const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

        switch ( state ) {
            default:
            case "idle":
                const { dynamicChannelService } = this;

                const { claimStartAdapter, claimResultAdapter } = this.adapters;

                this.logger.admin(
                    this.handleVoteRequest,
                    `😈  Claim start button clicked by: "${ interaction.member.displayName }" - "${ interaction.channel.name }" (${ interaction.channel.guild.name }) (${ interaction.guild.memberCount })`
                );

                // On owner, stop vote session.
                if ( await dynamicChannelService.isChannelOwner( interaction.user.id, interaction.channelId ) ) {
                    this.logger.admin(
                        this.handleVoteRequest,
                        `😈  Owner: "${ interaction.member.displayName }" reclaim his channel - "${ interaction.channel.name }" (${ interaction.channel.guild.name }) (${ interaction.guild.memberCount })`
                    );

                    await claimStartAdapter().deletedStartedMessagesInternal( interaction.channel );

                    this.unmarkChannelAsClaimable( interaction.channel );

                    dynamicChannelService.editPrimaryMessageDebounce( interaction.channel as VoiceChannel );

                    const ownerStopStep = await this.resolveClaimResultStep(
                        DynamicChannelClaimManager.CLAIM_RESULT_STATES.OwnerStop
                    );

                    await claimResultAdapter().ephemeralWithStep( interaction, ownerStopStep );

                    return this.addChannelTracking( interaction.member, interaction.channel );
                }

                return this.handleVoteRequestIdleState( interaction, forceMessage );

            case "active":
                return this.handleVoteRequestActiveState( interaction );
        }
    }

    /**
     * Function handleVoteIdleState() :: Handles vote request/start the vote session.
     */
    private async handleVoteRequestIdleState(
        interaction: IVoteDefaultComponentInteraction,
        forceMessage?: Message<true>
    ) {
        this.debugger.log( this.handleVoteRequestIdleState, "customId:", interaction.customId );

        const channelDB = await ChannelModel.$.getByChannelId( interaction.channelId );
        if ( !channelDB ) {
            this.logger.error(
                this.handleVoteRequestIdleState,
                `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Channel is not found in database`
            );
            return;
        }

        this.removeChannelOwnerTracking( channelDB.userOwnerId, interaction.channelId );

        const timings = await GuildDataManager.$.getTimings( interaction.guildId );

        DynamicChannelVoteManager.$.start(
            interaction.channel,
            ( channel, state ) =>
                this.voteTimer( channel, state, {
                    interaction,
                    message: forceMessage || interaction.message
                } ), // TODO Remove object.
            interaction,
            timings
        );

        this.dynamicChannelService.editPrimaryMessageDebounce( interaction.channel, 100 );

        DynamicChannelVoteManager.$.addCandidate( interaction );
    }

    /**
     * Function resolveCustomId() :: A custom id as the entities behind it are named.
     *
     * Every UI module hashes its custom ids part by part, so what arrives on an interaction reads
     * `<hash>:<hash>:<hash>` - measuring that against an entity's own name matches nothing, which
     * left every click on a running vote unanswered. An id that was never hashed comes back
     * untouched, so this is safe whichever strategy the module chose.
     */
    private resolveCustomId( customId: string ) {
        return ServiceLocator.$.get<UIHashService>( "VertixGUI/UIHashService" ).getIdSilent( customId );
    }

    private async handleVoteRequestActiveState( interaction: IVoteDefaultComponentInteraction ) {
        this.debugger.log( this.handleVoteRequestActiveState, "customId:", interaction.customId );

        const customIdParts = this.resolveCustomId( interaction.customId ).split( UI_CUSTOM_ID_SEPARATOR, 3 );

        switch ( customIdParts[ 1 ] ) {
            case this.getClaimVoteStepInEntity():
                this.logger.admin(
                    this.handleVoteRequest,
                    `😈  Claim step-In button clicked by: "${ interaction.member.displayName }" - "${ interaction.channel.name }" (${ interaction.channel.guild.name }) (${ interaction.guild.memberCount })`
                );
                return this.handleVoteStepIn( interaction );

            case this.getClaimVoteAddEntity():
                this.logger.admin(
                    this.handleVoteRequest,
                    `😈  Claim vote button clicked by: "${ interaction.member.displayName }" - "${ interaction.channel.name }" (${ interaction.channel.guild.name }) (${ interaction.guild.memberCount })`
                );
                return this.handleVoteAdd( interaction, customIdParts[ 2 ] );
        }

        this.logger.error(
            this.handleVoteRequestActiveState,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Unhandled case`,
            interaction.customId
        );
    }

    private async handleVoteStepIn( interaction: IVoteDefaultComponentInteraction ) {
        this.debugger.log( this.handleVoteStepIn, "customId:", interaction.customId );

        const { claimResultAdapter } = this.adapters;

        switch ( DynamicChannelVoteManager.$.addCandidate( interaction ) ) {
            case "success": {
                const addedStep = await this.resolveClaimVoteTriggerStep(
                    DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.StartVote
                );
                return claimResultAdapter().ephemeralWithStep( interaction, addedStep );
            }

            case "already": {
                const alreadyStep = await this.resolveClaimVoteTriggerStep(
                    DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.AddCandidate
                );
                return claimResultAdapter().ephemeralWithStep( interaction, alreadyStep );
            }
        }

        this.logger.error(
            this.handleVoteStepIn,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Unhandled case`
        );
    }

    private async handleVoteAdd( interaction: IVoteDefaultComponentInteraction, targetId: string ) {
        const state = DynamicChannelVoteManager.$.addVote( interaction, targetId );

        this.debugger.log(
            this.handleVoteAdd,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - State: '${ state }'`
        );

        const { claimResultAdapter } = this.adapters;

        switch ( state ) {
            case "self-manage": {
                const step = await this.resolveClaimVoteTriggerStep(
                    DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.VoteSelf
                );
                return claimResultAdapter().ephemeralWithStep( interaction, step );
            }

            case "success": {
                const step = await this.resolveClaimVoteTriggerStep(
                    DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.VoteSuccess
                );
                return claimResultAdapter().ephemeralWithStep( interaction, step, { targetId } );
            }

            case "already":
                const previousVoteTargetId = DynamicChannelVoteManager.$.getVotedFor( interaction );

                if ( previousVoteTargetId === targetId ) {
                    const step = await this.resolveClaimVoteTriggerStep(
                        DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.VoteSame
                    );
                    return claimResultAdapter().ephemeralWithStep( interaction, step, { targetId } );
                }

                const removed = DynamicChannelVoteManager.$.removeVote( interaction ).toString(),
                    added = DynamicChannelVoteManager.$.addVote( interaction, targetId ).toString();

                if ( previousVoteTargetId && [ removed, added ].every( ( i ) => "success" === i ) ) {
                    const step = await this.resolveClaimVoteTriggerStep(
                        DynamicChannelClaimManager.CLAIM_VOTE_TRANSITIONS.VoteUpdated
                    );
                    return claimResultAdapter().ephemeralWithStep( interaction, step, {
                        prevUserId: previousVoteTargetId,
                        currentUserId: targetId
                    } );
                }

                this.logger.error(
                    this.handleVoteAdd,
                    `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Already voted issue with with`,
                    {
                        previousVoteTargetId,
                        removed,
                        added
                    }
                );

                return;
        }

        this.logger.error(
            this.handleVoteAdd,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Unhandled case`
        );
    }

    private async voteTimer(
        channel: VoiceChannel,
        state: string,
        {
            message,
            interaction
        }: {
            interaction: IVoteDefaultComponentInteraction;
            message: Message<true>;
        }
    ) {
        this.debugger.log(
            this.voteTimer,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - State: '${ state }'`
        );

        if ( !message.channel ) {
            this.logger.error(
                this.voteTimer,
                `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Channel not found`
            );
            return;
        }

        // noinspection FallThroughInSwitchStatementJS
        switch ( state ) {
            case "done":

            case "starting":
            // Block control panel.
            // await DynamicChannelManager.$.setPrimaryMessageState( channel, false );
            case "active": // TODO: Update only when needed.
                // TODO: It will not works without empty args.... remove '{}' from `editReply` method.

                // TODO: Remove catch.
                await this.adapters.claimVoteAdapter().editMessage( message, {} );
        }
    }

    private async trackedChannelsTimer( guildId: string ) {
        const timer = this.guildTimers.get( guildId );

        if ( !timer ) {
            return;
        }

        const trackedChannelIds = this.getTrackedChannelIds( guildId );

        if ( trackedChannelIds.length ) {
            this.logger.log(
                this.trackedChannelsTimer,
                "Timer activated",
                trackedChannelIds
                    .map( ( channelId ) => {
                        const { channel, owner, timestamp } = this.trackedChannels[ channelId ];

                        return `Guild id: '${ guildId }', channel: '${ channel.name }', channelId: '${ channel.id }' - Owner id: '${ owner.id }', timestamp: '${ timestamp }'`;
                    } )
                    .join( "\n" )
            );
        }

        for ( const channelId of trackedChannelIds ) {
            const data = this.trackedChannels[ channelId ];

            if ( !data ) {
                continue;
            }

            const { channel, owner, timestamp } = data;

            if ( Date.now() - timestamp < timer.timings.claimOwnershipTimeout ) {
                continue;
            }

            this.logger.info(
                this.trackedChannelsTimer,
                `Guild id: '${ channel.guild.id }', owner id: '${ owner.id }' - Abandon the channel: '${ channel.name }'`
            );

            if ( !channel.guild.channels.cache.has( channel.id ) ) {
                this.logger.warn(
                    this.trackedChannelsTimer,
                    `Guild id: '${ channel.guild.id }' Channel id: '${ channel.id }', owner id: '${ owner.id }' ` +
                        `- Channel: '${ channel.name }' deleted while, skip abandon`
                );

                this.removeChannelTracking( channel.id );

                continue;
            }

            const state = DynamicChannelVoteManager.$.getState( channel.id );

            this.debugger.log(
                this.trackedChannelsTimer,
                `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }', owner id: '${ owner.id }' ` +
                    `- Channel: '${ channel.name }' vote state: '${ state }'`
            );

            // Skip if vote is not idle.
            if ( state !== "idle" ) {
                this.logger.warn(
                    this.trackedChannelsTimer,
                    `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }', owner id: '${ owner.id }' ` +
                        `- Channel: '${ channel.name }' has active vote, skip abandon`
                );

                continue;
            }

            // Send claim message.
            this.markChannelAsClaimable( channel );

            this.dynamicChannelService.editPrimaryMessageDebounce( channel as VoiceChannel );

            await this.adapters.claimStartAdapter().send( channel, {} );

            // Remove from abandon list.
            this.removeChannelOwnerTracking( owner.id, channel.id );
        }

        this.clearGuildTimerWhenEmpty( guildId );
    }

    private async resolveGuildTimings( guildId: string ): Promise<TClaimTimings> {
        const { claimOwnershipTimeout, claimOwnershipTimerInterval } = await GuildDataManager.$.getTimings( guildId );

        return { claimOwnershipTimeout, claimOwnershipTimerInterval };
    }

    private async ensureGuildTimer( guildId: string ) {
        if ( this.guildTimers.has( guildId ) ) {
            return;
        }

        const timings = await this.resolveGuildTimings( guildId );

        // Another channel of the same guild could have raised it while these were being read.
        if ( this.guildTimers.has( guildId ) ) {
            return;
        }

        this.logger.info(
            this.ensureGuildTimer,
            `Guild id: '${ guildId }' - Setting up timer with interval: ` +
                `'${ ( timings.claimOwnershipTimerInterval / 60000 ).toFixed( 1 ) } minute(s)'`
        );

        this.guildTimers.set( guildId, {
            timings,
            interval: setInterval( this.trackedChannelsTimer.bind( this, guildId ), timings.claimOwnershipTimerInterval )
        } );
    }

    private clearGuildTimerWhenEmpty( guildId: string ) {
        if ( this.getTrackedChannelIds( guildId ).length ) {
            return;
        }

        this.clearGuildTimer( guildId );
    }

    private clearGuildTimer( guildId: string ) {
        const timer = this.guildTimers.get( guildId );

        if ( !timer ) {
            return;
        }

        clearInterval( timer.interval );

        this.guildTimers.delete( guildId );

        this.logger.info( this.clearGuildTimer, `Guild id: '${ guildId }' - Timer stopped` );
    }

    private getTrackedChannelIds( guildId: string ) {
        return Object.keys( this.trackedChannels ).filter(
            ( channelId ) => this.trackedChannels[ channelId ].channel.guildId === guildId
        );
    }

    public async isClaimButtonEnabled( channel: VoiceBasedChannel ) {
        // TODO: Add dedicated method for this.
        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

        if ( !masterChannelDB ) {
            this.logger.error(
                this.isClaimButtonEnabled,
                `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }' - Master channel not found.`
            );
            return false;
        }

        const enabledButtons = await MasterChannelDataManager.$.getChannelButtonsTemplate( masterChannelDB, false );

        if ( !enabledButtons?.length ) {
            this.logger.error(
                this.isClaimButtonEnabled,
                `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }' - Enabled buttons not found.`
            );
            return false;
        }

        const claimChannelButtonId = this.dynamicChannelClaimButtonId;

        // Check if claim button is enabled.
        if ( !claimChannelButtonId || claimChannelButtonId in enabledButtons ) {
            return true;
        }

        this.logger.log(
            this.isClaimButtonEnabled,
            `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }' - Claim button is disabled.`
        );

        return false;
    }

    private async onBotReady( _client: Client ) {
        // await this.handleAbandonedChannels(client);
    }

    private async onOwnerJoinDynamicChannel( owner: GuildMember, channel: VoiceBasedChannel ) {
        const state = DynamicChannelVoteManager.$.getState( channel.id );

        if ( "idle" === state ) {
            this.removeChannelOwnerTracking( owner.id, channel.id );

            await this.adapters.claimStartAdapter().deletedStartedMessagesInternal( channel );
        }
    }

    private async onOwnerLeaveDynamicChannel( owner: GuildMember, channel: VoiceBasedChannel ) {
        if ( await this.isClaimButtonEnabled( channel ) ) {
            await this.addChannelTracking( owner, channel );
        }
    }

    private async onLeaveDynamicChannelEmpty(
        channel: VoiceBasedChannel,
        _channelDB: null | ChannelExtended,
        _guild: Guild,
        _args: IChannelLeaveGenericArgs
    ) {
        this.removeChannelOwnerTracking( channel.id );
    }

    private async onUpdateChannelOwnership(
        channel: VoiceChannel,
        _previousOwnerId: string,
        _newOwnerId: string,
        _from: "claim" | "transfer"
    ) {
        if ( await this.isClaimButtonEnabled( channel ) ) {
            await this.handleAbandonedChannels( channel.client, [ channel ] );
        }
    }
}
