import process from "process";

import { Client, GuildChannel, GuildMember, Message, VoiceBasedChannel, VoiceChannel } from "discord.js";

import { ChannelResult } from "@vertix/models/channel-model";

import {
    DynamicChannelVoteManager,
    IVoteDefaultComponentInteraction
} from "@vertix/managers/dynamic-channel-vote-manager";
import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";
import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";
import { TopGGManager } from "@vertix/managers/top-gg-manager";

import { ChannelModel } from "@vertix/models";

import { UI_GENERIC_SEPARATOR } from "@vertix/ui-v2/_base/ui-definitions";

import { InitializeBase } from "@internal/bases/initialize-base";

import { Debugger } from "@internal/modules/debugger";

const FALLBACK_OWNERSHIP_WORKER_INTERVAL = 30 * 1000, // Half minute.
    FALLBACK_OWNERSHIP_TIMEOUT = 10 * 60 * 1000; // 10 minutes.

export class DynamicChannelClaimManager extends InitializeBase {
    private static instance: DynamicChannelClaimManager;

    private readonly debugger: Debugger = new Debugger( this );

    private readonly ownershipTimeout: number;
    private readonly ownershipWorkerTimeInterval: number;

    private readonly workerIntervals: NodeJS.Timeout[] = [];

    private ownerShipWorkerInterval: NodeJS.Timeout | null = null;

    private trackedChannels: {
        [ channelId: string ]: {
            timestamp: number,
            channel: VoiceBasedChannel,
            owner: GuildMember,
        }
    } = {};

    private claimableChannels: {
        [ channelId: string ]: VoiceBasedChannel,
    } = {};

    public static getName() {
        return "Vertix/Managers/DynamicChannelClaim";
    }

    public static getInstance() {
        if ( ! this.instance ) {
            this.instance = new DynamicChannelClaimManager();
        }

        return this.instance;
    }

    public static get $() {
        return this.getInstance();
    }

    public constructor(
        ownershipTimeout = process.env.DYNAMIC_CHANNEL_CLAIM_OWNERSHIP_TIMEOUT || FALLBACK_OWNERSHIP_TIMEOUT,
        ownershipWorkerTimeInterval = process.env.DYNAMIC_CHANNEL_CLAIM_OWNERSHIP_WORKER_INTERVAL || FALLBACK_OWNERSHIP_WORKER_INTERVAL
    ) {
        super();

        this.ownershipTimeout = Number( ownershipTimeout );
        this.ownershipWorkerTimeInterval = Number( ownershipWorkerTimeInterval );
    }

    // TODO: Base worker.
    public destroy() {
        this.workerIntervals.forEach( interval => clearInterval( interval ) );
    }

    public getChannelOwnershipTimeout() {
        return this.ownershipTimeout;
    }

    public addChannelTracking( owner: GuildMember, channel: VoiceBasedChannel ) {
        // Check if channel supports "Claim Channel".
        const trackingData = {
            owner,
            channel,
            timestamp: Date.now()
        };

        this.logger.info( this.addChannelTracking, `Channel id: '${ channel.id }' - Adding owner id: '${ owner.id }' to tracking list` );

        this.trackedChannels[ channel.id ] = trackingData;
    }

    public removeChannelOwnerTracking( ownerId: string, channelId?: string ) {
        if ( ! channelId?.length ) {
            this.logger.log( this.removeChannelOwnerTracking,
                `Channel id is not provided! - Removing all owners with id: '${ ownerId }' from tracking.`
            );

            Object.keys( this.trackedChannels ).forEach( ( _channelId ) => {
                const channelData = this.trackedChannels[ _channelId ];

                if ( channelData.owner.id === ownerId ) {
                    this.debugger.log( this.removeChannelOwnerTracking, `Channel id: '${ _channelId }' owner id: '${ ownerId }' - Removing channel from tracking according to ownerId.` );

                    delete this.trackedChannels[ _channelId ];
                }
            } );

            return;
        }

        this.removeChannelTracking( channelId );
    }

    public removeChannelTracking( channelId: string ) {
        const channel = this.trackedChannels[ channelId ]?.channel;

        if ( ! channel ) {
            this.logger.log( this.removeChannelTracking,
                `Channel: '${ channelId }' is not tracked!`
            );
            return;
        }

        this.logger.info( this.removeChannelTracking, `Channel id: '${ channel.id }' - Removing channel from tracking.` );

        delete this.trackedChannels[ channelId ];
    }

    public markChannelAsClaimable( channel: VoiceBasedChannel ) {
        this.debugger.log( this.markChannelAsClaimable, `Guild Id: '${ channel.guildId }', channel id: '${ channel.id }' - Marking channel as claimable.` );

        this.claimableChannels[ channel.id ] = channel;
    }

    public unmarkChannelAsClaimable( channel: VoiceBasedChannel ) {
        this.debugger.log( this.unmarkChannelAsClaimable, `Guild Id: '${ channel.guildId }', channel id: '${ channel.id }' - Unmarking channel as claimable.` );

        delete this.claimableChannels[ channel.id ];
    }

    public isOwnerTracked( ownerId: string ) {
        return !! this.trackedChannels[ ownerId ];
    }

    public isChannelClaimable( channelId: string ) {
        return !! this.claimableChannels[ channelId ];
    }

    /**
     * Function handleAbandonedChannels() :: Ensures that all abandoned added to abandon list,
     * so worker can handle them later, the function is called on bot start.
     */
    public async handleAbandonedChannels( client: Client, specificChannels?: VoiceChannel[], specificChannelsDB?: ChannelResult[] ) {
        this.debugger.dumpDown( this.handleAbandonedChannels, {
            specificChannels,
            specificChannelsDB
        } );

        const handleChannels = async ( dynamicChannels: ChannelResult[] ) => {
            for ( const channelDB of dynamicChannels ) {
                const guild = client.guilds.cache.get( channelDB.guildId );

                if ( ! guild ) {
                    this.logger.error( this.handleAbandonedChannels,
                        `Guild id: '${ channelDB.guildId }' - Guild is not found!`
                    );
                    continue;
                }

                if ( ! channelDB.userOwnerId ) {
                    this.logger.error( this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Channel has no owner!`
                    );
                    continue;
                }

                const channel = guild.channels.cache.get( channelDB.channelId );

                if ( ! channel || ! channel.isVoiceBased() ) {
                    this.logger.error( this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Channel is not found!`
                    );
                    continue;
                }

                // If it startup process, remove old "Claim Channel" button.
                // TODO: Not good place for this.
                if ( ! this.ownerShipWorkerInterval ) {
                    // Remove old "Claim Channel" button.
                    await UIAdapterManager.$.get( "Vertix/UI-V2/ClaimStartAdapter" )?.deleteRelatedComponentMessagesInternal( channel );
                }

                if ( ! await DynamicChannelManager.$.isClaimButtonEnabled( channel ) ) {
                    continue;
                }

                // Check if channel vote is idle.
                const state = DynamicChannelVoteManager.$.getState( channel.id );

                if ( state !== "idle" ) {
                    this.logger.log( this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Vote is not idle: '${ state }'`
                    );
                    continue;
                }

                // Check if member is in channel.
                const member = ( channel as GuildChannel ).members.get( channelDB.userOwnerId );

                if ( member ) {
                    this.logger.log( this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Owner id: '${ channelDB.userOwnerId }' is not abandoned!`
                    );
                    continue;
                }

                // Get member from guild.
                const owner = await guild.members.fetch( channelDB.userOwnerId );

                if ( ! owner ) {
                    this.logger.error( this.handleAbandonedChannels,
                        `Guild id: '${ guild.id }', channel id: '${ channelDB.channelId }' - Owner id: '${ channelDB.userOwnerId }' is not found!`
                    );
                    continue;
                }

                this.addChannelTracking( owner, channel as VoiceBasedChannel );
            }
        };

        if ( specificChannelsDB?.length ) {
            await handleChannels( specificChannelsDB );
        } else if ( ! specificChannels?.length ) {
            for ( const guild of client.guilds.cache.values() ) {
                const dynamicChannels = await ChannelModel.$.getDynamics( guild.id );

                await handleChannels( dynamicChannels );
            }
        } else {
            const dynamicChannels = ( await Promise.all( specificChannels.map( async ( channel ) =>
                await ChannelModel.$.getByChannelId( channel.id ) as ChannelResult
            ) ) );

            await handleChannels( dynamicChannels );
        }

        if ( ! this.ownerShipWorkerInterval ) {
            const workerInterval = this.ownershipWorkerTimeInterval;

            this.logger.info( this.handleAbandonedChannels,
                `Setting up worker with interval: '${ ( workerInterval / 60000 ).toFixed( 1 ) } minute(s)'`
            );

            this.ownerShipWorkerInterval = setInterval( this.trackedChannelsWorker.bind( this ), workerInterval );

            this.workerIntervals.push( this.ownerShipWorkerInterval );
        }
    }

    public async handleVoteRequest( interaction: IVoteDefaultComponentInteraction, forceMessage?: Message<true> ) {
        if ( ! await TopGGManager.$.isVoted( interaction.user.id ) ) {
            return await TopGGManager.$.sendVoteEmbed( interaction );
        }

        const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

        switch ( state ) {
            default:
            case "idle":
                this.logger.admin( this.handleVoteRequest,
                    `😈  Claim start button clicked by: "${ interaction.member.displayName }" - "${ interaction.channel.name }" (${ interaction.channel.guild.name }) (${ interaction.guild.memberCount })`
                );

                // On owner, stop vote session.
                if ( await DynamicChannelManager.$.isChannelOwner( interaction.user.id, interaction.channelId ) ) {
                    this.logger.admin( this.handleVoteRequest,
                        `😈  Owner: "${ interaction.member.displayName }" reclaim his channel - "${ interaction.channel.name }" (${ interaction.channel.guild.name }) (${ interaction.guild.memberCount })`
                    );

                    await UIAdapterManager.$.get( "Vertix/UI-V2/ClaimStartAdapter" )?.deletedStartedMessagesInternal( interaction.channel );

                    await DynamicChannelClaimManager.$.unmarkChannelAsClaimable( interaction.channel );

                    DynamicChannelManager.$.editPrimaryMessageDebounce( interaction.channel as VoiceChannel );

                    await UIAdapterManager.$.get( "Vertix/UI-V2/ClaimResultAdapter" )?.ephemeralWithStep(
                        interaction,
                        "Vertix/UI-V2/ClaimResultOwnerStop",
                    );

                    return DynamicChannelClaimManager.$.addChannelTracking( interaction.member, interaction.channel );
                }

                return this.handleVoteRequestIdleState( interaction, forceMessage );

            case "active":
                return this.handleVoteRequestActiveState( interaction );
        }
    }

    /**
     * Function handleVoteIdleState() :: Handles vote request/start the vote session.
     */
    private async handleVoteRequestIdleState( interaction: IVoteDefaultComponentInteraction, forceMessage?: Message<true> ) {
        this.debugger.log( this.handleVoteRequestIdleState, "customId:", interaction.customId );

        const channelDB = await ChannelModel.$.getByChannelId( interaction.channelId );
        if ( ! channelDB ) {
            this.logger.error( this.handleVoteRequestIdleState,
                `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Channel is not found in database`
            );
            return;
        }

        // TODO: Maybe it can cause some issues.
        await interaction.deferUpdate();

        this.removeChannelOwnerTracking( channelDB.userOwnerId, interaction.channelId );

        DynamicChannelVoteManager.$.start(
            interaction.channel,
            ( channel, state ) => this.voteWorker( channel, state, {
                interaction,
                message: forceMessage || interaction.message
            } ), // TODO Remove object.
            interaction
        );

        DynamicChannelManager.$.editPrimaryMessageDebounce( interaction.channel, 100 );

        DynamicChannelVoteManager.$.addCandidate( interaction );
    }

    private async handleVoteRequestActiveState( interaction: IVoteDefaultComponentInteraction ) {
        this.debugger.log( this.handleVoteRequestActiveState, "customId:", interaction.customId );

        const customIdParts = interaction.customId.split( UI_GENERIC_SEPARATOR, 3 );

        switch ( customIdParts[ 1 ] ) {
            case "Vertix/UI-V2/ClaimVoteStepInButton":
                this.logger.admin( this.handleVoteRequest,
                    `😈  Claim step-In button clicked by: "${ interaction.member.displayName }" - "${ interaction.channel.name }" (${ interaction.channel.guild.name }) (${ interaction.guild.memberCount })`
                );
                return this.handleVoteStepIn( interaction );

            case "Vertix/UI-V2/ClaimVoteAddButton":
                this.logger.admin( this.handleVoteRequest,
                    `😈  Claim vote button clicked by: "${ interaction.member.displayName }" - "${ interaction.channel.name }" (${ interaction.channel.guild.name }) (${ interaction.guild.memberCount })`
                );
                return this.handleVoteAdd( interaction, customIdParts[ 2 ] );
        }

        this.logger.error( this.handleVoteRequestActiveState,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Unhandled case`,
            interaction.customId
        );
    }

    private async handleVoteStepIn( interaction: IVoteDefaultComponentInteraction ) {
        this.debugger.log( this.handleVoteStepIn, "customId:", interaction.customId );

        switch ( DynamicChannelVoteManager.$.addCandidate( interaction ) ) {
            case "success":
                return UIAdapterManager.$.get( "Vertix/UI-V2/ClaimResultAdapter" )
                    ?.ephemeralWithStep( interaction, "Vertix/UI-V2/ClaimResultAddedSuccessfully" );

            case "already":
                return UIAdapterManager.$.get( "Vertix/UI-V2/ClaimResultAdapter" )
                    ?.ephemeralWithStep( interaction, "Vertix/UI-V2/ClaimResultAlreadyAdded" );
        }

        this.logger.error( this.handleVoteStepIn,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Unhandled case`
        );
    }

    private async handleVoteAdd( interaction: IVoteDefaultComponentInteraction, targetId: string ) {
        const state = DynamicChannelVoteManager.$.addVote( interaction, targetId );

        this.debugger.log( this.handleVoteAdd,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - State: '${ state }'` );

        switch ( state ) {
            case "self-manage":
                return UIAdapterManager.$.get( "Vertix/UI-V2/ClaimResultAdapter" )
                    ?.ephemeralWithStep( interaction, "Vertix/UI-V2/ClaimResultVoteAlreadySelfVoted" );

            case "success":
                return UIAdapterManager.$.get( "Vertix/UI-V2/ClaimResultAdapter" )
                    ?.ephemeralWithStep( interaction, "Vertix/UI-V2/ClaimResultVotedSuccessfully", { targetId } );

            case "already":
                const previousVoteTargetId = DynamicChannelVoteManager.$.getVotedFor( interaction );

                if ( previousVoteTargetId === targetId ) {
                    return UIAdapterManager.$.get( "Vertix/UI-V2/ClaimResultAdapter" )
                        ?.ephemeralWithStep( interaction, "Vertix/UI-V2/ClaimResultVoteAlreadyVotedSame", { targetId } );
                }

                const removed = DynamicChannelVoteManager.$.removeVote( interaction ).toString(),
                    added = DynamicChannelVoteManager.$.addVote( interaction, targetId ).toString();

                if ( previousVoteTargetId && [ removed, added ].every( i => "success" === i ) ) {
                    return UIAdapterManager.$.get( "Vertix/UI-V2/ClaimResultAdapter" )
                        ?.ephemeralWithStep( interaction, "Vertix/UI-V2/ClaimResultVoteUpdatedSuccessfully", {
                            prevUserId: previousVoteTargetId,
                            currentUserId: targetId,
                        } );
                }

                this.logger.error(
                    this.handleVoteAdd,
                    `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Already voted issue with with`, {
                        previousVoteTargetId,
                        removed,
                        added
                    } );

                return;
        }

        this.logger.error( this.handleVoteAdd,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Unhandled case`
        );
    }

    private async voteWorker( channel: VoiceChannel, state: string, { message, interaction }: {
        interaction: IVoteDefaultComponentInteraction,
        message: Message<true>
    } ) {
        this.debugger.log( this.voteWorker,
            `Guild id: '${ interaction.guildId }', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - State: '${ state }'` );

        if ( ! message.channel ) {
            this.logger.error( this.voteWorker,
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
                await UIAdapterManager.$.get( "Vertix/UI-V2/ClaimVoteAdapter" )?.editMessage( message, {} );
        }
    }

    private async trackedChannelsWorker() {
        if ( this.trackedChannels.length ) {
            this.logger.log( this.trackedChannelsWorker, "Worker activated", Object.entries( this.trackedChannels ).map( ( [ ownerId, data ] ) => {
                const { channel } = data,
                    { guildId } = channel;

                return `Guild id: '${ guildId }', channel: '${ channel.name }', channelId: '${ channel.id }' - Owner id: '${ ownerId }', timestamp: '${ data.timestamp }'`;
            } ).join( "\n" ) );
        }

        for ( const [ ownerId, data ] of Object.entries( this.trackedChannels ) ) {
            const { channel, timestamp } = data;

            if ( Date.now() - timestamp < this.getChannelOwnershipTimeout() ) {
                continue;
            }

            this.logger.info( this.trackedChannelsWorker,
                `Guild id: '${ channel.guild.id }', owner id: '${ ownerId }' - Abandon the channel: '${ channel.name }'`
            );

            if ( ! channel.guild.channels.cache.has( channel.id ) ) {
                this.logger.warn( this.trackedChannelsWorker,
                    `Guild id: '${ channel.guild.id }' Channel id: '${ channel.id }', owner id: '${ ownerId }' ` +
                    `- Channel: '${ channel.name }' deleted while, skip abandon`
                );

                this.removeChannelOwnerTracking( ownerId );

                continue;
            }

            const state = DynamicChannelVoteManager.$.getState( channel.id );

            this.debugger.log( this.trackedChannelsWorker,
                `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }', owner id: '${ ownerId }' ` +
                `- Channel: '${ channel.name }' vote state: '${ state }'` );

            // Skip if vote is not idle.
            if ( state !== "idle" ) {
                this.logger.warn( this.trackedChannelsWorker,
                    `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }', owner id: '${ ownerId }' ` +
                    `- Channel: '${ channel.name }' has active vote, skip abandon`
                );

                continue;
            }

            // Send claim message.
            DynamicChannelClaimManager.$.markChannelAsClaimable( channel );

            DynamicChannelManager.$.editPrimaryMessageDebounce( channel as VoiceChannel );

            await UIAdapterManager.$.get( "Vertix/UI-V2/ClaimStartAdapter" )?.send( channel, {} );

            // Remove from abandon list.
            this.removeChannelOwnerTracking( ownerId, channel.id );
        }
    }
}
