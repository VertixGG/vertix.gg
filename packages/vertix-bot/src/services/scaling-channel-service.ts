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

import type { CategoryChannel, Guild, GuildBasedChannel, VoiceChannel } from "discord.js";

import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";

export class ScalingChannelService extends ServiceWithDependenciesBase<{
    appService: AppService;
    channelService: ChannelService;
    uiService: UIService;
}> {
    private readonly debugger: Debugger;

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
            this.logger.log( this.initialize, "App service ready, checking existing scaling channels" );
            const client = this.services.appService.getClient();
            
            for ( const guild of client.guilds.cache.values() ) {
                this.debugger.log( this.initialize, `Checking guild: ${guild.name} (${guild.id})` );
                const masters = await ChannelModel.$.getDynamicMasters( guild.id );
                this.debugger.log( this.initialize, `Found ${masters.length} master channels in guild ${guild.name}` );
                
                for ( const master of masters ) {
                    this.debugger.log( this.initialize, `Checking master channel: ${master.id}` );
                    const config = await MasterChannelScalingDataModel.$.getSettings( master.id );
                    if ( !config ) {
                        this.debugger.log( this.initialize, `No scaling config found for master ${master.id}` );
                        continue;
                    }
                    
                    const categoryId = config.scalingChannelCategoryId;
                    const prefix = config.scalingChannelPrefix;
                    const maxMembers = config.scalingChannelMaxMembersPerChannel;
                    
                    this.debugger.log( this.initialize, `Master ${master.id} config - Category: ${categoryId}, Prefix: ${prefix}, MaxMembers: ${maxMembers}` );
                    
                    if ( !categoryId || !prefix || !maxMembers ) {
                        this.debugger.log( this.initialize, `Invalid config for master ${master.id}, skipping` );
                        continue;
                    }
                    
                    const category = guild.channels.cache.get( categoryId ) as CategoryChannel | undefined;
                    if ( !category ) {
                        this.debugger.log( this.initialize, `Category ${categoryId} not found for master ${master.id}` );
                        continue;
                    }
                    const allChannels = guild.channels.cache.filter( ( c ) => c.parentId === categoryId && c.type === ChannelType.GuildVoice );
                    this.debugger.log( this.initialize, `Found ${allChannels.size} voice channels in category ${categoryId}` );
                    
                    let hasScaling = false;
                    for ( const c of allChannels.values() ) {
                        const db = await ChannelModel.$.getByChannelId( c.id );
                        if ( !db ) continue;
                        if ( db.internalType === PrismaBot.E_INTERNAL_CHANNEL_TYPES.SCALING_CHANNEL && db.ownerChannelId === master.id ) {
                            this.debugger.log( this.initialize, `Found existing scaling channel: ${c.name} (${c.id})` );
                            hasScaling = true;
                            break;
                        }
                    }
                    
                    if ( !hasScaling ) {
                        this.logger.log( this.initialize, `No scaling channels found for master ${master.id}, creating initial channel` );
                        await this.createScaledChannel( guild, category, master, prefix, maxMembers, 1 );
                    } else {
                        this.debugger.log( this.initialize, `Scaling channels already exist for master ${master.id}` );
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

    public async createScaledChannel( guild: Guild, category: CategoryChannel, master: ChannelExtended, prefix: string, maxMembers: number, index: number ) {
        const name = `${ prefix }-${ index }`;
        
        this.logger.log( this.createScaledChannel, `Creating new scaling channel: ${name} (limit: ${maxMembers}) in guild ${guild.name}` );
        
        try {
            const result = await this.services.channelService.create( {
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
            
            this.logger.log( this.createScaledChannel, `Successfully created scaling channel: ${name}` );
            return result;
        } catch ( error: unknown ) {
            this.logger.error( this.createScaledChannel, `Failed to create scaling channel ${name}: ${error instanceof Error ? error.message : String(error)}` );
            throw error;
        }
    }

    private async handleScaling( guild: Guild ) {
        this.debugger.log( this.handleScaling, `Starting scaling evaluation for guild ${guild.name} (${guild.id})` );
        
        const masterChannels = await ChannelModel.$.getScalingMasters( guild.id );
        this.debugger.log( this.handleScaling, `Found ${masterChannels.length} master channels to evaluate` );
        
        for ( const master of masterChannels ) {
            this.debugger.log( this.handleScaling, `Evaluating scaling for master channel ${master.id}` );
            
            const config = await MasterChannelScalingDataModel.$.getSettings( master.id );
            if ( !config ) {
                this.debugger.log( this.handleScaling, `No scaling config for master ${master.id}` );
                continue;
            }
            const categoryId = config.scalingChannelCategoryId;
            const prefix = config.scalingChannelPrefix;
            const maxMembers = config.scalingChannelMaxMembersPerChannel;
            
            this.debugger.log( this.handleScaling, `Config - Category: ${categoryId}, Prefix: ${prefix}, MaxMembers: ${maxMembers}` );
            
            if ( !categoryId || !prefix || !maxMembers ) {
                this.debugger.log( this.handleScaling, `Invalid config for master ${master.id}` );
                continue;
            }
            
            const category = guild.channels.cache.get( categoryId ) as CategoryChannel | undefined;
            if ( !category ) {
                this.debugger.log( this.handleScaling, `Category ${categoryId} not found` );
                continue;
            }
            const allChannels = guild.channels.cache.filter( ( c: GuildBasedChannel ) => c.parentId === categoryId && c.type === ChannelType.GuildVoice );
            this.debugger.log( this.handleScaling, `Found ${allChannels.size} voice channels in category` );
            
            const scaledChannels: VoiceChannel[] = [];
            let masterChannel: VoiceChannel | null = null;
            
            for ( const c of allChannels.values() ) {
                const db = await ChannelModel.$.getByChannelId( c.id );
                if ( !db ) continue;
                
                if ( db.internalType === PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL ) {
                    masterChannel = c as VoiceChannel;
                    this.debugger.log( this.handleScaling, `Found master channel: ${c.name} (${c.id})` );
                } else if ( db.internalType === PrismaBot.E_INTERNAL_CHANNEL_TYPES.SCALING_CHANNEL && db.ownerChannelId === master.id ) {
                    const voiceChannel = c as VoiceChannel;
                    scaledChannels.push( voiceChannel );
                    this.debugger.log( this.handleScaling, `Found scaling channel: ${c.name} (${c.id}) with ${voiceChannel.members.size} members` );
                }
            }
            
            if ( !masterChannel ) {
                this.debugger.log( this.handleScaling, `No master channel found in category ${categoryId}` );
                continue;
            }
            this.debugger.log( this.handleScaling, `Found ${scaledChannels.length} scaling channels for master ${master.id}` );
            
            let totalAvailableSlots = 0;
            for ( const ch of scaledChannels ) {
                const voiceChannel = ch as VoiceChannel;
                const availableSlots = Math.max( 0, maxMembers - voiceChannel.members.size );
                totalAvailableSlots += availableSlots;
                this.debugger.log( this.handleScaling, `Channel ${ch.name}: ${voiceChannel.members.size}/${maxMembers} members (${availableSlots} slots available)` );
            }
            
            this.debugger.log( this.handleScaling, `Total available slots: ${totalAvailableSlots}` );
            
            if ( totalAvailableSlots === 1 ) {
                this.logger.log( this.handleScaling, `Only 1 slot available, creating new scaling channel` );
                await this.createScaledChannel( guild, category, master, prefix, maxMembers, scaledChannels.length + 1 );
            }
            const emptyChannels = scaledChannels.filter( ( ch: VoiceChannel ) => ch.members.size === 0 );
            this.debugger.log( this.handleScaling, `Found ${emptyChannels.length} empty scaling channels` );
            
            if ( emptyChannels.length > 1 ) {
                this.logger.log( this.handleScaling, `Cleaning up excess empty channels (keeping 1, removing ${emptyChannels.length - 1})` );
                emptyChannels.sort( ( a: VoiceChannel, b: VoiceChannel ) => a.createdTimestamp - b.createdTimestamp );
                
                for ( let i = 1; i < emptyChannels.length; ++i ) {
                    this.logger.log( this.handleScaling, `Deleting empty channel: ${emptyChannels[i].name} (${emptyChannels[i].id})` );
                    await emptyChannels[ i ].guild.channels.delete( emptyChannels[ i ].id ).catch( ( error: unknown ) => {
                        this.logger.error( this.handleScaling, `Failed to delete channel ${emptyChannels[i].name}: ${error instanceof Error ? error.message : String(error)}` );
                    } );
                }
            }
        }
    }
    
    private async onJoinScalingChannel( args: IChannelEnterGenericArgs ) {
        const { newState, displayName } = args,
            { guild } = newState;
        
        this.logger.log( this.onJoinScalingChannel, `User ${displayName} joined scaling channel ${newState.channelId} in guild ${guild.name}` );
        await this.handleScaling( guild );
    }

    private async onLeavingScalingChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, displayName } = args,
            { guild } = oldState;
        
        this.logger.log( this.onLeavingScalingChannel, `User ${displayName} left scaling channel ${oldState.channelId} in guild ${guild.name}` );
        await this.handleScaling( guild );
    }

    
    private async onJoin( args: IChannelEnterGenericArgs ) {
        const { newState } = args;
        const isScaling = await ChannelModel.$.isScaling( newState.channelId! );
        
        this.debugger.log( this.onJoin, `Channel ${newState.channelId} is scaling: ${isScaling}` );
        
        if ( isScaling ) {
            await this.onJoinScalingChannel( args );
        }
    }

    private async onLeave( args: IChannelLeaveGenericArgs ) {
        const { oldState } = args;
        const isScaling = await ChannelModel.$.isScaling( oldState.channelId! );
        
        this.debugger.log( this.onLeave, `Channel ${oldState.channelId} is scaling: ${isScaling}` );
        
        if ( isScaling ) {
            await this.onLeavingScalingChannel( args );
        }
    }

}

export default ScalingChannelService;

