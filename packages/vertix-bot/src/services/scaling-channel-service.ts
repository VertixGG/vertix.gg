import "@vertix.gg/prisma/bot-client";

import { VERSION_UI_UNSPECIFIED } from "@vertix.gg/base/src/definitions/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { MasterChannelScalingDataModel } from "@vertix.gg/base/src/models/master-channel/master-channel-scaling-data-model-v3";

import { ChannelType } from "discord.js";

import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { MasterChannelScalingConfig } from "@vertix.gg/bot/src/config/master-channel-scaling-config";

export class ScalingChannelService extends ServiceWithDependenciesBase<{
    appService: AppService;
    channelService: ChannelService;
    uiService: UIService;
}> {
    private readonly debugger: Debugger;

    private config =
        ConfigManager.$.get<MasterChannelScalingConfig>( "Vertix/Config/MasterChannelScaling", VERSION_UI_UNSPECIFIED );

    public static getName() {
        return "VertixBot/Services/ScalingChannel";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", ScalingChannelService.getName() ) );

        // Register event handlers
        EventBus.$.on( "VertixBot/Services/Channel", "onJoin", this.onJoin.bind( this ) );
        EventBus.$.on( "VertixBot/Services/Channel", "onLeave", this.onLeave.bind( this ) );
    }

    protected async initialize() {
        await super.initialize();

        this.services.appService.onceReady( async() => {
            const client = this.services.appService.getClient();
            for ( const guild of client.guilds.cache.values() ) {
                const masters = await ChannelModel.$.getMasters( guild.id );
                for ( const master of masters ) {
                    const config = await MasterChannelScalingDataModel.$.getSettings( master.id );
                    if ( !config ) continue;
                    const categoryId = config.scalingChannelCategoryId;
                    const prefix = config.scalingChannelPrefix;
                    const maxMembers = config.scalingChannelMaxMembersPerChannel;
                    if ( !categoryId || !prefix || !maxMembers ) continue;
                    const category = guild.channels.cache.get( categoryId );
                    if ( !category ) continue;
                    const allChannels = guild.channels.cache.filter( ( c ) => c.parentId === categoryId && c.type === ChannelType.GuildVoice );
                    let hasScaling = false;
                    for ( const c of allChannels.values() ) {
                        const db = await ChannelModel.$.getByChannelId( c.id );
                        if ( !db ) continue;
                        if ( db.internalType === PrismaBot.E_INTERNAL_CHANNEL_TYPES.SCALING_CHANNEL && db.ownerChannelId === master.id ) {
                            hasScaling = true;
                            break;
                        }
                    }
                    if ( !hasScaling ) {
                        await this.createScaledChannel( guild, category, master, prefix, maxMembers, 1 );
                    }
                }
            }
        } );
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            channelService: "VertixBot/Services/Channel",
            uiService: "VertixGUI/UIService",
        };
    }

    private async onJoinScalingChannel( args: IChannelEnterGenericArgs ) {
        const { oldState } = args,
            { guild } = oldState;
        await this.handleScaling( guild );
    }

    private async onLeavingScalingChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState } = args,
            { guild } = oldState;
        await this.handleScaling( guild );
    }

    private async onJoin( args: IChannelEnterGenericArgs ) {
        const { newState } = args;
        if ( await ChannelModel.$.isScaling( newState.channelId! ) ) {
            await this.onJoinScalingChannel( args );
        }
    }

    private async onLeave( args: IChannelLeaveGenericArgs ) {
        const { oldState } = args;
        if ( await ChannelModel.$.isScaling( oldState.channelId! ) ) {
            await this.onLeavingScalingChannel( args );
        }
    }

    private async handleScaling( guild: any ) {
        const masters = await ChannelModel.$.getMasters( guild.id );
        for ( const master of masters ) {
            const config = await MasterChannelScalingDataModel.$.getSettings( master.id );
            if ( !config ) continue;
            const categoryId = config.scalingChannelCategoryId;
            const prefix = config.scalingChannelPrefix;
            const maxMembers = config.scalingChannelMaxMembersPerChannel;
            if ( !categoryId || !prefix || !maxMembers ) continue;
            const category = guild.channels.cache.get( categoryId );
            if ( !category ) continue;
            const allChannels = guild.channels.cache.filter( ( c: any ) => c.parentId === categoryId && c.type === ChannelType.GuildVoice );
            const scaledChannels: any[] = [];
            let masterChannel: any = null;
            for ( const c of allChannels.values() ) {
                const db = await ChannelModel.$.getByChannelId( c.id );
                if ( !db ) continue;
                if ( db.internalType === PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL ) {
                    masterChannel = c;
                } else if ( db.internalType === PrismaBot.E_INTERNAL_CHANNEL_TYPES.SCALING_CHANNEL && db.ownerChannelId === master.id ) {
                    scaledChannels.push( c );
                }
            }
            if ( !masterChannel ) continue;
            let totalAvailableSlots = 0;
            for ( const ch of scaledChannels ) {
                totalAvailableSlots += Math.max( 0, maxMembers - ch.members.size );
            }
            if ( totalAvailableSlots === 1 ) {
                await this.createScaledChannel( guild, category, master, prefix, maxMembers, scaledChannels.length + 1 );
            }
            const emptyChannels = scaledChannels.filter( ( ch: any ) => ch.members.size === 0 );
            if ( emptyChannels.length > 1 ) {
                emptyChannels.sort( ( a: any, b: any ) => a.createdTimestamp - b.createdTimestamp );
                for ( let i = 1; i < emptyChannels.length; ++i ) {
                    await emptyChannels[ i ].guild.channels.delete( emptyChannels[ i ].id ).catch( () => {} );
                }
            }
        }
    }

    private async createScaledChannel( guild: any, category: any, master: any, prefix: string, maxMembers: number, index: number ) {
        const name = `${ prefix }-${ index }`;
        await this.services.channelService.create( {
            guild,
            parent: category,
            name,
            userLimit: maxMembers,
            userOwnerId: master.id,
            ownerChannelId: master.id,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.SCALING_CHANNEL,
            version: VERSION_UI_UNSPECIFIED,
            type: ChannelType.GuildVoice
        } );
    }
}

export default ScalingChannelService;
