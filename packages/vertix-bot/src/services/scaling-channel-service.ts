import "@vertix.gg/prisma/bot-client";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ScalingChannelDataModel } from "@vertix.gg/base/src/models/master-channel/scaling-channel-data-model";

import { ChannelType } from "discord.js";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";
import { VERSION_SCALING_CHANNEL } from "@vertix.gg/bot/src/config/scaling-channel-config";

import type { ScalingChannelConfigInterface } from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { CategoryChannel, Guild, VoiceChannel } from "discord.js";

import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";

export class ScalingChannelService extends ServiceWithDependenciesBase<{
    appService: AppService;
    channelService: ChannelService;
}> {
    private readonly debugger: Debugger;

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
            channelService: "VertixBot/Services/Channel"
        };
    }

    protected async initialize() {
        await super.initialize();

        this.services.appService.onceReady( async() => {
            try {
                this.logger.log( this.initialize, "App service ready, checking existing scaling channels" );

                const client = this.services.appService.getClient();

                for ( const guild of client.guilds.cache.values() ) {
                    try {
                        await this.ensureScalingChannelsForGuild( guild );
                    } catch( error ) {
                        this.logger.error(
                            this.ensureScalingChannelsForGuild,
                            `Failed to ensure scaling channels for guild '${ guild.id }'`,
                            error
                        );
                    }
                }
            } catch( error ) {
                this.logger.error( this.initialize, "Failed to ensure scaling channels", error );
            }
        } );
    }

    public async ensureScalingChannelsForGuild( guild: Guild ) {
        this.debugger.log( this.ensureScalingChannelsForGuild, `Checking guild: ${ guild.name } (${ guild.id })` );

        const masters = await ChannelModel.$.getMasters( guild.id );

        for ( const master of masters ) {
            const config = await ScalingChannelDataModel.$.getScalingSettings( master.id );

            if ( !config ) {
                continue;
            }

            const { scalingChannelCategoryId, scalingChannelPrefix, scalingChannelMaxMembersPerChannel } = config;

            if ( !scalingChannelCategoryId || !scalingChannelPrefix || !scalingChannelMaxMembersPerChannel ) {
                continue;
            }

            const category = guild.channels.cache.get( scalingChannelCategoryId ) as CategoryChannel | undefined;

            if ( !category ) {
                this.debugger.log( this.ensureScalingChannelsForGuild, `Category ${ scalingChannelCategoryId } not found for master ${ master.id }` );
                continue;
            }

            const scalingChannels = await this.findScalingChannels( guild, master.id );

            if ( scalingChannels.length === 0 ) {
                this.logger.log( this.ensureScalingChannelsForGuild, `No scaling channels found for master ${ master.id }, creating initial channel` );
                await this.createScaledChannel( guild, category, master, scalingChannelPrefix, scalingChannelMaxMembersPerChannel, 1 );
            }
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
        const name = `${ prefix }-${ index }`;

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
                version: VERSION_SCALING_CHANNEL,
                type: ChannelType.GuildVoice
            } );

            this.logger.log( this.createScaledChannel, `Successfully created scaling channel: ${ name }` );

            return result;
        } catch( error ) {
            this.logger.error( this.createScaledChannel, `Failed to create scaling channel ${ name }`, error );
            throw error;
        }
    }

    public async createScalingMasterChannel( args: {
        guildId: string;
        userOwnerId: string;
        prefix?: string;
        maxMembers?: number;
    } ) {
        const { guildId, userOwnerId, prefix, maxMembers } = args;

        const guild = this.services.appService.getClient().guilds.cache.get( guildId ) ||
            await this.services.appService.getClient().guilds.fetch( guildId );

        this.logger.info( this.createScalingMasterChannel, `Creating scaling master channel for guild ${ guild.name } (${ guildId })` );

        const config = ConfigManager.$.get<ScalingChannelConfigInterface>( "Vertix/Config/ScalingChannel", VERSION_SCALING_CHANNEL );
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
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            version: VERSION_SCALING_CHANNEL,
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

        const isScaling = await ChannelModel.$.isScaling( newState.channelId );

        this.debugger.log( this.onJoin, `Channel ${ newState.channelId } is scaling: ${ isScaling }` );

        if ( isScaling ) {
            await this.handleJoinScaling( args );
        }
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
        const totalAvailableSlots = this.computeTotalAvailableSlots( scalingChannels, scalingChannelMaxMembersPerChannel );

        this.debugger.log( this.handleJoinScaling, `Total available slots: ${ totalAvailableSlots }` );

        if ( totalAvailableSlots <= 1 ) {
            const masterDB = await ChannelModel.$.getByChannelId( masterChannelId );

            if ( !masterDB ) {
                return;
            }

            const nextIndex = scalingChannels.length + 1;

            this.logger.log( this.handleJoinScaling, `Only ${ totalAvailableSlots } slot(s) remaining, creating new scaling channel #${ nextIndex }` );

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

