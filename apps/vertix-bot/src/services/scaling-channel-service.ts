import "@vertix.gg/prisma/bot-client";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ScalingChannelDataModel } from "@vertix.gg/base/src/models/master-channel/scaling-channel-data-model";

import { varsReplaceIndexPlaceholder, varsHasIndexPlaceholder } from "@vertix.gg/base/src/utils/vars-utils";

import { ChannelType } from "discord.js";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";
import { VERSION_SCALING_CHANNEL_UI_V1 } from "@vertix.gg/bot/src/config/scaling-channel-config";
import { ChannelUtils } from "@vertix.gg/bot/src/utils/channel-utils";

import type { IPCDiscordChannelInfo } from "@vertix.gg/definitions/src/ipc-definitions";

import type {
    GetScalingChannelInfoResponse,
    CreateScalingSetupPayload,
    UpdateScalingSettingsPayload,
    TriggerReindexPayload,
    TriggerCleanupPayload,
    DeleteScalingSetupPayload
} from "@vertix.gg/definitions/src/scaling-channel-ipc-definitions";

import type { ScalingChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { CategoryChannel, Guild, VoiceChannel } from "discord.js";

import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { ChannelCleanupService } from "@vertix.gg/bot/src/services/channel-cleanup-service";

export class ScalingChannelService extends ServiceWithDependenciesBase<{
    appService: AppService;
    channelService: ChannelService;
    channelCleanupService: ChannelCleanupService;
}> {
    private readonly debugger: Debugger;
    private reindexInterval?: NodeJS.Timeout;

    public static getName() {
        return "VertixBot/Services/ScalingChannel";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", ScalingChannelService.getName() ) );

        EventBus.$.on( "VertixBot/Services/Channel", "onJoin", this.onJoin.bind( this ) );
        EventBus.$.on( "VertixBot/Services/Channel", "onLeave", this.onLeave.bind( this ) );
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            channelService: "VertixBot/Services/Channel",
            channelCleanupService: "VertixBot/Services/ChannelCleanup"
        };
    }

    protected async initialize() {
        await super.initialize();

        this.services.appService.onceReady( async() => {
            try {
                this.logger.log( this.initialize, "App service ready, checking existing scaling channels" );

                const scalingConfigs = await ScalingChannelDataModel.$.getAllScalingSettings();

                for ( const { masterChannel, settings } of scalingConfigs ) {
                    try {
                        const guild = this.services.appService.getClient().guilds.cache.get( masterChannel.guildId );

                        if ( !guild ) {
                            continue;
                        }

                        await this.ensureScalingChannelsForMaster( guild, masterChannel as ChannelExtended, settings );
                    } catch( error ) {
                        this.logger.error(
                            this.initialize,
                            `Failed to ensure scaling channels for master '${ masterChannel.id }' in guild '${ masterChannel.guildId }'`,
                            error
                        );
                    }
                }

                this.scheduleScalingReindex();
            } catch( error ) {
                this.logger.error( this.initialize, "Failed to ensure scaling channels", error );
            }
        } );
    }

    /**
     * Get scaling channel info for IPC request (called by ManagementIPCService)
     */
    public async getScalingChannelInfo(
        guildId: string,
        masterChannelId: string,
        scalingChannelIds: string[]
    ): Promise<GetScalingChannelInfoResponse> {
        const result: GetScalingChannelInfoResponse = {
            masterChannel: null,
            category: null,
            scalingChannels: []
        };

        const guild = this.services.appService.getClient().guilds.cache.get( guildId );

        if ( !guild ) {
            this.logger.warn( this.getScalingChannelInfo, `Guild not found: ${ guildId }` );
            return result;
        }

        // Get master channel info
        const masterChannel = guild.channels.cache.get( masterChannelId );

        if ( masterChannel && masterChannel.isVoiceBased() ) {
            result.masterChannel = this.getChannelInfo( masterChannel as VoiceChannel );

            // Get category info
            if ( masterChannel.parent ) {
                result.category = {
                    id: masterChannel.parent.id,
                    name: masterChannel.parent.name,
                    memberCount: 0,
                    position: masterChannel.parent.position
                };
            }
        }

        // Get scaling channels info
        for ( const channelId of scalingChannelIds ) {
            const channel = guild.channels.cache.get( channelId );

            if ( channel && channel.isVoiceBased() ) {
                result.scalingChannels.push( this.getChannelInfo( channel as VoiceChannel ) );
            }
        }

        return result;
    }

    private getChannelInfo( channel: VoiceChannel ): IPCDiscordChannelInfo {
        return {
            id: channel.id,
            name: channel.name,
            memberCount: channel.members.size,
            position: channel.position
        };
    }

    /**
     * Handle create scaling setup IPC action (called by ManagementIPCService)
     */
    public async handleCreateScalingSetup( data: CreateScalingSetupPayload ) {
        const { guildId, userOwnerId, prefix, maxMembers } = data;

        this.logger.log(
            this.handleCreateScalingSetup,
            `Creating scaling setup for guild ${ guildId }`
        );

        const result = await this.createScalingMasterChannel( {
            guildId,
            userOwnerId,
            prefix,
            maxMembers
        } );

        if ( !result.success ) {
            this.logger.error( this.handleCreateScalingSetup, `Failed to create scaling setup: ${ result.error }` );
        } else {
            this.logger.log( this.handleCreateScalingSetup, `Successfully created scaling setup for guild ${ guildId }` );
        }
    }

    /**
     * Handle update scaling settings IPC action (called by ManagementIPCService)
     */
    public async handleUpdateScalingSettings( data: UpdateScalingSettingsPayload ) {
        const { guildId, masterChannelId, settings } = data;

        this.logger.log(
            this.handleUpdateScalingSettings,
            `Updating scaling settings for master ${ masterChannelId } in guild ${ guildId }`
        );

        const guild = await ChannelUtils.cacheOrFetchGuild( guildId );

        if ( !guild ) {
            this.logger.error( this.handleUpdateScalingSettings, `Guild not found: ${ guildId }` );
            return;
        }

        await this.updateScalingSettings( {
            guild,
            masterChannelId,
            prefix: settings.scalingChannelPrefix || "",
            maxMembers: settings.scalingChannelMaxMembersPerChannel || 0
        } );
    }

    /**
     * Handle trigger reindex IPC action (called by ManagementIPCService)
     */
    public async handleTriggerReindex( data: TriggerReindexPayload ) {
        const { guildId, masterChannelId } = data;

        this.logger.log(
            this.handleTriggerReindex,
            `Triggering reindex for master ${ masterChannelId } in guild ${ guildId }`
        );

        const guild = await ChannelUtils.cacheOrFetchGuild( guildId );

        if ( !guild ) {
            this.logger.error( this.handleTriggerReindex, `Guild not found: ${ guildId }` );
            return;
        }

        const settings = await ScalingChannelDataModel.$.getScalingSettings( masterChannelId );

        if ( !settings?.scalingChannelPrefix ) {
            this.logger.error( this.handleTriggerReindex, `No prefix configured for master ${ masterChannelId }` );
            return;
        }

        await this.reindexScalingChannelsForMaster( guild, masterChannelId, settings.scalingChannelPrefix );
    }

    /**
     * Handle trigger cleanup IPC action (called by ManagementIPCService)
     */
    public async handleTriggerCleanup( data: TriggerCleanupPayload ) {
        const { guildId, masterChannelId } = data;

        this.logger.log(
            this.handleTriggerCleanup,
            `Triggering cleanup for master ${ masterChannelId } in guild ${ guildId }`
        );

        const guild = await ChannelUtils.cacheOrFetchGuild( guildId );

        if ( !guild ) {
            this.logger.error( this.handleTriggerCleanup, `Guild not found: ${ guildId }` );
            return;
        }

        const scalingChannels = await this.findScalingChannels( guild, masterChannelId );

        await this.cleanupExcessEmptyChannels( scalingChannels );
    }

    /**
     * Handle delete scaling setup IPC action (called by ManagementIPCService)
     */
    public async handleDeleteScalingSetup( data: DeleteScalingSetupPayload ) {
        const { guildId, masterChannelId } = data;

        this.logger.log(
            this.handleDeleteScalingSetup,
            `Deleting scaling setup for master ${ masterChannelId } in guild ${ guildId }`
        );

        await this.services.channelCleanupService.deleteScalingMasterChannelWithCleanup( { guildId, masterChannelId } );
    }

    public async ensureScalingChannelsForMaster(
        guild: Guild,
        master: ChannelExtended,
        settings: ScalingChannelConfigInterface[ "data" ][ "settings" ]
    ) {
        const { scalingChannelCategoryId, scalingChannelPrefix, scalingChannelMaxMembersPerChannel } = settings;

        if ( !scalingChannelCategoryId || !scalingChannelPrefix || !scalingChannelMaxMembersPerChannel ) {
            return;
        }

        const category = guild.channels.cache.get( scalingChannelCategoryId ) as CategoryChannel | undefined;

        if ( !category ) {
            this.debugger.log(
                this.ensureScalingChannelsForMaster,
                `Category ${ scalingChannelCategoryId } not found for master ${ master.id }`
            );
            return;
        }

        const scalingChannels = await this.findScalingChannels( guild, master.id );

        if ( scalingChannels.length === 0 ) {
            this.logger.log(
                this.ensureScalingChannelsForMaster,
                `No scaling channels found for master ${ master.id }, creating initial channel`
            );
            await this.createScaledChannel(
                guild,
                category,
                master,
                scalingChannelPrefix,
                scalingChannelMaxMembersPerChannel,
                1
            );
        }
    }

    public async createScaledChannel(
        guild: Guild,
        category: CategoryChannel,
        master: ChannelExtended,
        prefix: string,
        maxMembers: number,
        index: number
    ) {
        const name = this.assembleScalingChannelName( prefix, index );

        this.logger.log( this.createScaledChannel, `Creating new scaling channel: ${ name } (limit: ${ maxMembers }) in guild ${ guild.name }` );

        try {
            const result = await this.services.channelService.create( {
                guild,
                parent: category,
                name,
                userLimit: maxMembers,
                userOwnerId: master.userOwnerId,
                ownerChannelId: master.id,
                internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.SCALING_CHANNEL,
                version: VERSION_SCALING_CHANNEL_UI_V1,
                type: ChannelType.GuildVoice
            } );

            this.logger.log( this.createScaledChannel, `Successfully created scaling channel: ${ name }` );

            return result;
        } catch( error ) {
            this.logger.error( this.createScaledChannel, `Failed to create scaling channel ${ name }`, error );
            throw error;
        }
    }

    private assembleScalingChannelName( prefix: string, index: number ) {
        return varsReplaceIndexPlaceholder( prefix, index );
    }

    private scheduleScalingReindex() {
        if ( this.reindexInterval ) {
            return;
        }

        const intervalMs = 5 * 60 * 1000;

        this.reindexInterval = setInterval( () => {
            this.reindexScalingChannels().catch( ( error ) => {
                this.logger.error( this.scheduleScalingReindex, "Failed to reindex scaling channels", error );
            } );
        }, intervalMs );

        this.reindexScalingChannels().catch( ( error ) => {
            this.logger.error( this.scheduleScalingReindex, "Failed to reindex scaling channels", error );
        } );
    }

    private async reindexScalingChannels() {
        const scalingConfigs = await ScalingChannelDataModel.$.getAllScalingSettings();

        this.debugger.log(
            this.reindexScalingChannels,
            `Starting reindex pass for ${ scalingConfigs.length } scaling configurations`
        );

        for ( const { masterChannel } of scalingConfigs ) {
            const guild = await ChannelUtils.cacheOrFetchGuild( masterChannel.guildId );

            if ( !guild ) {
                this.debugger.log(
                    this.reindexScalingChannels,
                    `Guild ${ masterChannel.guildId } not found, skipping master ${ masterChannel.id }`
                );
                continue;
            }

            const settings = await ScalingChannelDataModel.$.getScalingSettings( masterChannel.id );

            if ( !settings?.scalingChannelPrefix ) {
                this.debugger.log(
                    this.reindexScalingChannels,
                    `No prefix configured for master ${ masterChannel.id }, skipping`
                );
                continue;
            }

            if ( !varsHasIndexPlaceholder( settings.scalingChannelPrefix ) ) {
                this.debugger.log(
                    this.reindexScalingChannels,
                    `Prefix "${ settings.scalingChannelPrefix }" does not use index placeholder for master ${ masterChannel.id }, skipping`
                );
                continue;
            }

            this.debugger.log(
                this.reindexScalingChannels,
                `Reindexing scaling channels for master ${ masterChannel.id } in guild ${ guild.name } with prefix "${ settings.scalingChannelPrefix }"`
            );

            await this.reindexScalingChannelsForMaster( guild, masterChannel.id, settings.scalingChannelPrefix );
        }

        this.debugger.log( this.reindexScalingChannels, "Reindex pass completed" );
    }

    private async reindexScalingChannelsForMaster(
        guild: Guild,
        masterChannelId: string,
        prefix: string
    ) {
        const scalingChannelsDB = await ChannelModel.$.getScalingChannelsByMasterId( guild.id, masterChannelId );

        if ( !scalingChannelsDB.length ) {
            this.debugger.log(
                this.reindexScalingChannelsForMaster,
                `No scaling channels found in DB for master ${ masterChannelId }`
            );
            return;
        }

        this.debugger.log(
            this.reindexScalingChannelsForMaster,
            `Found ${ scalingChannelsDB.length } scaling channels in DB for master ${ masterChannelId }`
        );

        const scalingChannels: VoiceChannel[] = [];

        for ( const channelDB of scalingChannelsDB ) {
            const channel = guild.channels.cache.get( channelDB.channelId );

            if ( channel && channel.isVoiceBased() ) {
                scalingChannels.push( channel as VoiceChannel );
            } else {
                this.debugger.log(
                    this.reindexScalingChannelsForMaster,
                    `Channel ${ channelDB.channelId } not found in cache or not voice-based`
                );
            }
        }

        if ( !scalingChannels.length ) {
            this.debugger.log(
                this.reindexScalingChannelsForMaster,
                `No valid scaling channels found in Discord cache for master ${ masterChannelId }`
            );
            return;
        }

        const sorted = [ ...scalingChannels ].sort( ( a, b ) => a.createdTimestamp - b.createdTimestamp );

        this.debugger.log(
            this.reindexScalingChannelsForMaster,
            `Processing ${ sorted.length } scaling channels for reindex`
        );

        let renamedCount = 0;

        for ( let i = 0; i < sorted.length; ++i ) {
            const channel = sorted[ i ];
            const expectedName = this.assembleScalingChannelName( prefix, i + 1 );

            if ( channel.name === expectedName ) {
                this.debugger.log(
                    this.reindexScalingChannelsForMaster,
                    `Channel ${ channel.id } already has correct name "${ expectedName }"`
                );
                continue;
            }

            this.logger.log(
                this.reindexScalingChannelsForMaster,
                `Renaming channel ${ channel.id } from "${ channel.name }" to "${ expectedName }"`
            );

            await channel.edit( { name: expectedName } )
                .then( () => {
                    ++renamedCount;
                    this.debugger.log(
                        this.reindexScalingChannelsForMaster,
                        `Successfully renamed channel ${ channel.id } to "${ expectedName }"`
                    );
                } )
                .catch( ( error ) => this.logger.error( this.reindexScalingChannelsForMaster, `Failed to reindex channel ${ channel.id }`, error ) );
        }

        if ( renamedCount > 0 ) {
            this.logger.log(
                this.reindexScalingChannelsForMaster,
                `Reindex complete for master ${ masterChannelId }: renamed ${ renamedCount } channels`
            );
        }
    }

    public async getOrCreateAvailableChannel( args: {
        guild: Guild;
        masterChannel: ChannelExtended;
    } ): Promise<VoiceChannel | null> {
        const { guild, masterChannel } = args;

        const config = await ScalingChannelDataModel.$.getScalingSettings( masterChannel.id );

        if ( !config ) {
            return null;
        }

        const { scalingChannelCategoryId, scalingChannelPrefix, scalingChannelMaxMembersPerChannel } = config;

        if ( !scalingChannelCategoryId || !scalingChannelPrefix || scalingChannelMaxMembersPerChannel == null ) {
            return null;
        }

        const category = guild.channels.cache.get( scalingChannelCategoryId ) as CategoryChannel | undefined;

        if ( !category ) {
            return null;
        }

        let scalingChannels = await this.findScalingChannels( guild, masterChannel.id );

        if ( scalingChannels.length === 0 ) {
            const created = await this.createScaledChannel(
                guild,
                category,
                masterChannel,
                scalingChannelPrefix,
                scalingChannelMaxMembersPerChannel,
                1
            );

            if ( created?.channel && created.channel.isVoiceBased() ) {
                return created.channel as VoiceChannel;
            }

            return null;
        }

        scalingChannels = [ ...scalingChannels ].sort( ( a, b ) => a.createdTimestamp - b.createdTimestamp );

        const isUnlimited = scalingChannelMaxMembersPerChannel <= 0;
        const available = scalingChannels.find( ( channel ) =>
            isUnlimited ? true : channel.members.size < scalingChannelMaxMembersPerChannel
        );

        if ( available ) {
            return available;
        }

        const nextIndex = scalingChannels.length + 1;
        const created = await this.createScaledChannel(
            guild,
            category,
            masterChannel,
            scalingChannelPrefix,
            scalingChannelMaxMembersPerChannel,
            nextIndex
        );

        if ( created?.channel && created.channel.isVoiceBased() ) {
            return created.channel as VoiceChannel;
        }

        return null;
    }

    public async updateScalingSettings( args: {
        guild: Guild;
        masterChannelId: string;
        prefix: string;
        maxMembers: number;
    } ) {
        const { guild, masterChannelId, prefix, maxMembers } = args;

        this.logger.log(
            this.updateScalingSettings,
            `Updating scaling settings for master ${ masterChannelId } in guild ${ guild.name }: prefix="${ prefix }", maxMembers=${ maxMembers }`
        );

        await ScalingChannelDataModel.$.setAllSettings( masterChannelId, {
            scalingChannelPrefix: prefix,
            scalingChannelMaxMembersPerChannel: maxMembers
        } );

        this.debugger.log(
            this.updateScalingSettings,
            `Settings saved to database for master ${ masterChannelId }`
        );

        const scalingChannelsDB = await ChannelModel.$.getScalingChannelsByMasterId( guild.id, masterChannelId );

        if ( !scalingChannelsDB.length ) {
            this.debugger.log(
                this.updateScalingSettings,
                `No scaling channels found in DB for master ${ masterChannelId }, nothing to update`
            );
            return;
        }

        this.debugger.log(
            this.updateScalingSettings,
            `Found ${ scalingChannelsDB.length } scaling channels in DB for master ${ masterChannelId }`
        );

        const scalingChannels: VoiceChannel[] = [];

        for ( const channelDB of scalingChannelsDB ) {
            const channel = guild.channels.cache.get( channelDB.channelId );

            if ( channel && channel.isVoiceBased() ) {
                scalingChannels.push( channel as VoiceChannel );
            } else {
                this.debugger.log(
                    this.updateScalingSettings,
                    `Channel ${ channelDB.channelId } not found in cache or not voice-based`
                );
            }
        }

        if ( !scalingChannels.length ) {
            this.debugger.log(
                this.updateScalingSettings,
                `No valid scaling channels found in Discord cache for master ${ masterChannelId }`
            );
            return;
        }

        const sorted = [ ...scalingChannels ].sort( ( a, b ) => a.createdTimestamp - b.createdTimestamp );

        this.logger.log(
            this.updateScalingSettings,
            `Applying settings to ${ sorted.length } scaling channels for master ${ masterChannelId }`
        );

        let updatedCount = 0;

        for ( let i = 0; i < sorted.length; ++i ) {
            const channel = sorted[ i ];
            const name = this.assembleScalingChannelName( prefix, i + 1 );

            this.debugger.log(
                this.updateScalingSettings,
                `Updating channel ${ channel.id }: name="${ name }", userLimit=${ maxMembers }`
            );

            await channel
                .edit( { name, userLimit: maxMembers } )
                .then( () => {
                    ++updatedCount;
                    this.debugger.log(
                        this.updateScalingSettings,
                        `Successfully updated channel ${ channel.id }`
                    );
                } )
                .catch( ( error ) => this.logger.error( this.updateScalingSettings, `Failed to update channel ${ channel.id }`, error ) );
        }

        this.logger.log(
            this.updateScalingSettings,
            `Settings update complete for master ${ masterChannelId }: updated ${ updatedCount }/${ sorted.length } channels`
        );
    }

    public async createScalingMasterChannel( args: {
        guildId: string;
        userOwnerId: string;
        prefix?: string;
        maxMembers?: number;
    } ) {
        const { guildId, userOwnerId, prefix, maxMembers } = args;

        const guild = await ChannelUtils.cacheOrFetchGuild( guildId );

        if ( !guild ) {
            this.logger.error( this.createScalingMasterChannel, `Guild not found: ${ guildId }` );
            return { success: false, error: "Guild not found" };
        }

        this.logger.info( this.createScalingMasterChannel, `Creating scaling master channel for guild ${ guild.name } (${ guildId })` );

        const config = ConfigManager.$.get<ScalingChannelConfigInterface>( "Vertix/Config/ScalingChannel", VERSION_SCALING_CHANNEL_UI_V1 );
        const { constants, settings } = config.data;

        const effectivePrefix = prefix || settings.scalingChannelPrefix;
        const effectiveMaxMembers = maxMembers || settings.scalingChannelMaxMembersPerChannel;

        const category = await CategoryManager.$.create( {
            guild,
            name: constants.scalingChannelCategoryName
        } ).catch( ( error: Error ) => {
            this.logger.error( this.createScalingMasterChannel, "Failed to create category", error );
            return null;
        } );

        if ( !category ) {
            return { success: false, error: "Failed to create category" };
        }

        const masterResult = await this.services.channelService.create( {
            guild,
            parent: category,
            name: constants.masterChannelName,
            userOwnerId,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_SCALING_CHANNEL,
            version: VERSION_SCALING_CHANNEL_UI_V1,
            type: ChannelType.GuildVoice
        } ).catch( ( error: Error ) => {
            this.logger.error( this.createScalingMasterChannel, "Failed to create master channel", error );
            return null;
        } );

        if ( !masterResult ) {
            await category.delete( "Failed to create master channel" );
            return { success: false, error: "Failed to create master channel" };
        }

        const masterDb = await masterResult.db;

        await ScalingChannelDataModel.$.setAllSettings( masterDb.id, {
            scalingChannelPrefix: effectivePrefix,
            scalingChannelMaxMembersPerChannel: effectiveMaxMembers,
            scalingChannelCategoryId: category.id
        } );

        const initialChannel = await this.createScaledChannel(
            guild,
            category,
            masterDb,
            effectivePrefix,
            effectiveMaxMembers,
            1
        );

        this.logger.info( this.createScalingMasterChannel, `Successfully created scaling master channel setup for guild ${ guild.name } (prefix: ${ effectivePrefix }, max: ${ effectiveMaxMembers })` );

        return {
            success: true,
            category,
            masterChannel: masterResult.channel,
            masterDb,
            initialScalingChannel: initialChannel
        };
    }

    private async onJoin( args: IChannelEnterGenericArgs ) {
        const { newState } = args;

        if ( !newState.channelId ) {
            return;
        }

        const isScalingMaster = await ChannelModel.$.isScalingMaster( newState.channelId );

        if ( isScalingMaster ) {
            this.debugger.log( this.onJoin, `Channel ${ newState.channelId } is scaling master, routing user` );
            await this.handleJoinScalingMaster( args );
            return;
        }

        const isScaling = await ChannelModel.$.isScaling( newState.channelId );

        this.debugger.log( this.onJoin, `Channel ${ newState.channelId } is scaling: ${ isScaling }` );

        if ( isScaling ) {
            await this.handleJoinScaling( args );
        }
    }

    private async handleJoinScalingMaster( args: IChannelEnterGenericArgs ) {
        const { newState } = args;
        const guild = newState.guild;
        const member = newState.member;
        const masterChannelId = newState.channelId!;

        if ( !member ) {
            return;
        }

        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannelId );

        if ( !masterChannelDB ) {
            this.logger.error( this.handleJoinScalingMaster, `Master channel DB not found: ${ masterChannelId }` );
            return;
        }

        const availableChannel = await this.getOrCreateAvailableChannel( {
            guild,
            masterChannel: masterChannelDB
        } );

        if ( !availableChannel ) {
            this.logger.error(
                this.handleJoinScalingMaster,
                `Guild id: '${ guild.id }' - Failed to find available scaling channel for master '${ masterChannelDB.id }'`
            );
            return;
        }

        this.logger.log(
            this.handleJoinScalingMaster,
            `Guild id: '${ guild.id }' - Moving user '${ member.displayName }' to scaling channel '${ availableChannel.name }'`
        );

        await member.voice.setChannel( availableChannel ).catch( ( error: Error ) => {
            this.logger.error( this.handleJoinScalingMaster, `Failed to move member to scaling channel: ${ error.message }` );
        } );
    }

    private async onLeave( args: IChannelLeaveGenericArgs ) {
        const { oldState } = args;

        if ( !oldState.channelId ) {
            return;
        }

        const isScaling = await ChannelModel.$.isScaling( oldState.channelId );

        this.debugger.log( this.onLeave, `Channel ${ oldState.channelId } is scaling: ${ isScaling }` );

        if ( isScaling ) {
            await this.handleLeaveScaling( args );
        }
    }

    private async handleJoinScaling( args: IChannelEnterGenericArgs ) {
        const { newState } = args;
        const guild = newState.guild;
        const channelId = newState.channelId!;

        const channelDB = await ChannelModel.$.getByChannelId( channelId );

        if ( !channelDB || !channelDB.ownerChannelId ) {
            return;
        }

        const masterChannelId = channelDB.ownerChannelId;
        const config = await ScalingChannelDataModel.$.getScalingSettings( masterChannelId );

        if ( !config ) {
            return;
        }

        const { scalingChannelCategoryId, scalingChannelPrefix, scalingChannelMaxMembersPerChannel } = config;

        if ( !scalingChannelCategoryId || !scalingChannelPrefix || !scalingChannelMaxMembersPerChannel ) {
            return;
        }

        const category = guild.channels.cache.get( scalingChannelCategoryId ) as CategoryChannel | undefined;

        if ( !category ) {
            return;
        }

        const scalingChannels = await this.findScalingChannels( guild, masterChannelId );
        const availableChannelsCount = this.computeAvailableChannelsCount( scalingChannels, scalingChannelMaxMembersPerChannel );
        const totalAvailableSlots = this.computeTotalAvailableSlots( scalingChannels, scalingChannelMaxMembersPerChannel );
        const minAvailableChannels = config.scalingChannelMinAvailableChannels ?? 1;

        this.logger.log( this.handleJoinScaling, `Scaling evaluation for master ${ masterChannelId }: ` +
            `Available rooms: ${ availableChannelsCount } (min: ${ minAvailableChannels }), ` +
            `Total slots: ${ totalAvailableSlots }` );

        if ( availableChannelsCount <= minAvailableChannels || totalAvailableSlots <= 1 ) {
            const masterDB = await ChannelModel.$.getById( masterChannelId );

            if ( !masterDB ) {
                this.logger.error( this.handleJoinScaling, `Master channel DB entry not found for ID: ${ masterChannelId }` );
                return;
            }

            const nextIndex = scalingChannels.length + 1;

            this.logger.log( this.handleJoinScaling, `Scaling trigger hit for master ${ masterChannelId }, creating new scaling channel #${ nextIndex }` );

            await this.createScaledChannel( guild, category, masterDB, scalingChannelPrefix, scalingChannelMaxMembersPerChannel, nextIndex );
        }
    }

    private async handleLeaveScaling( args: IChannelLeaveGenericArgs ) {
        const { oldState } = args;
        const guild = oldState.guild;
        const channelId = oldState.channelId!;

        const channelDB = await ChannelModel.$.getByChannelId( channelId );

        if ( !channelDB || !channelDB.ownerChannelId ) {
            return;
        }

        const masterChannelId = channelDB.ownerChannelId;
        const scalingChannels = await this.findScalingChannels( guild, masterChannelId );

        await this.cleanupExcessEmptyChannels( scalingChannels );
    }

    private async findScalingChannels( guild: Guild, masterChannelId: string ): Promise<VoiceChannel[]> {
        const scalingChannelsDB = await ChannelModel.$.getScalingChannelsByMasterId( guild.id, masterChannelId );
        const scalingChannels: VoiceChannel[] = [];

        for ( const channelDB of scalingChannelsDB ) {
            const channel = guild.channels.cache.get( channelDB.channelId ) as VoiceChannel | undefined;

            if ( channel ) {
                scalingChannels.push( channel );
            }
        }

        return scalingChannels;
    }

    private computeTotalAvailableSlots( scalingChannels: VoiceChannel[], maxMembers: number ): number {
        let total = 0;

        for ( const ch of scalingChannels ) {
            const availableSlots = Math.max( 0, maxMembers - ch.members.size );
            total += availableSlots;
            this.debugger.log( this.computeTotalAvailableSlots, `Channel ${ ch.name }: ${ ch.members.size }/${ maxMembers } members (${ availableSlots } slots available)` );
        }

        return total;
    }

    private computeAvailableChannelsCount( scalingChannels: VoiceChannel[], maxMembers: number ): number {
        let count = 0;

        for ( const ch of scalingChannels ) {
            if ( ch.members.size < maxMembers ) {
                ++count;
            }
        }

        return count;
    }

    private async cleanupExcessEmptyChannels( scalingChannels: VoiceChannel[] ) {
        const emptyChannels = scalingChannels.filter( ( ch ) => ch.members.size === 0 );

        this.debugger.log( this.cleanupExcessEmptyChannels, `Found ${ emptyChannels.length } empty scaling channels` );

        if ( emptyChannels.length <= 1 ) {
            return;
        }

        this.logger.log( this.cleanupExcessEmptyChannels, `Cleaning up excess empty channels (keeping 1, removing ${ emptyChannels.length - 1 })` );

        emptyChannels.sort( ( a, b ) => a.createdTimestamp - b.createdTimestamp );

        for ( let i = 1; i < emptyChannels.length; ++i ) {
            const channel = emptyChannels[ i ];

            this.logger.log( this.cleanupExcessEmptyChannels, `Deleting empty channel: ${ channel.name } (${ channel.id })` );

            try {
                await this.services.channelService.delete( {
                    guild: channel.guild,
                    channel
                } );
            } catch( error ) {
                this.logger.error( this.cleanupExcessEmptyChannels, `Failed to delete channel ${ channel.name }`, error );
            }
        }
    }
}

export default ScalingChannelService;
