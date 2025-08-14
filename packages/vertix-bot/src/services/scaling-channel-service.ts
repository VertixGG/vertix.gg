import "@vertix.gg/prisma/bot-client";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { ChannelType } from "discord.js";

import type { VoiceBasedChannel, VoiceChannel } from "discord.js";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";
import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

type ManagedCategorySettings = {
    masterChannelId: string
    maxMembersPerChannel: number
}

export class ScalingChannelService extends ServiceWithDependenciesBase<{
    appService: AppService
    channelService: ChannelService
}> {
    private readonly debugger: Debugger;

    private categoryToSettings = new Map<string, ManagedCategorySettings>();

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

    private async onJoin( args: IChannelEnterGenericArgs ) {
        const channel = args.newState.channel;
        const categoryId = channel?.parentId;

        if ( !channel || !categoryId ) return;

        await this.ensureCategoryMapping( channel );

        if ( !this.categoryToSettings.has( categoryId ) ) return;

        await this.ensureScaleUp( channel );
    }

    private async onLeave( args: IChannelLeaveGenericArgs ) {
        const channel = args.oldState.channel;
        const categoryId = channel?.parentId;

        if ( !channel || !categoryId ) return;

        await this.ensureCategoryMapping( channel );

        if ( !this.categoryToSettings.has( categoryId ) ) return;

        await this.ensureScaleDown( channel );
    }

    private async ensureCategoryMapping( channel: VoiceBasedChannel | null ) {
        if ( !channel?.parentId ) return;

        if ( this.categoryToSettings.has( channel.parentId ) ) return;

        const master = await this.findMasterScalingChannelInCategory( channel );

        if ( !master ) return;

        const masterDB = await ChannelModel.$.getByChannelId( master.id );

        if ( !masterDB ) return;

        const settings = await MasterChannelDataModelV3.$.getSettings( masterDB.id );

        const maxMembersPerChannel = Number( ( settings as any )?.maxMembersPerChannel ) || 5;

        this.categoryToSettings.set( channel.parentId, {
            masterChannelId: master.id,
            maxMembersPerChannel
        } );
    }

    private async findMasterScalingChannelInCategory( channel: VoiceBasedChannel ) {
        const guild = channel.guild;

        const candidates = guild.channels.cache.filter( c => c.type === ChannelType.GuildVoice && c.parentId === channel.parentId );

        for ( const [ , candidate ] of candidates ) {
            const db = await ChannelModel.$.getByChannelId( candidate.id );

            if ( db?.internalType === PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL ) {
                const settings = await MasterChannelDataModelV3.$.getSettings( db.id );
                if ( ( settings as any )?.type === "auto-scaling" ) return candidate as VoiceBasedChannel;
            }
        }

        return null;
    }

    private getBaseNameAndIndex( name: string ) {
        const match = name.match( /(.*?)(?:\s*-\s*|\s+)(\d+)$/ );

        if ( match ) return { base: match[ 1 ].trim(), index: parseInt( match[ 2 ], 10 ) };

        return { base: name.trim(), index: 0 };
    }

    private buildNextName( existing: VoiceChannel[] ) {
        let base = "Team";
        let maxIndex = 0;

        for ( const ch of existing ) {
            const { base: b, index } = this.getBaseNameAndIndex( ch.name );

            if ( index > maxIndex ) {
                maxIndex = index;
                base = b;
            }
        }

        const next = Math.max( 1, maxIndex + 1 );

        return `${ base } - ${ next }`;
    }

    private async listScalingChannels( anchor: VoiceBasedChannel ) {
        const guild = anchor.guild;

        const channels = guild.channels.cache.filter( c => c.type === ChannelType.GuildVoice && c.parentId === anchor.parentId );

        const result: VoiceChannel[] = [];

        for ( const [ , c ] of channels ) {
            const db = await ChannelModel.$.getByChannelId( c.id );

            if ( db?.internalType === PrismaBot.E_INTERNAL_CHANNEL_TYPES.SCALING_CHANNEL ) result.push( c as VoiceChannel );
        }

        return result;
    }

    private async ensureScaleUp( channel: VoiceBasedChannel ) {
        const settings = this.categoryToSettings.get( channel.parentId! );

        if ( !settings ) return;

        const scaling = await this.listScalingChannels( channel );

        if ( scaling.length === 0 ) {
            await this.createNextScalingChannel( channel, settings );
            return;
        }

        const totalFreeSlots = scaling.reduce( ( acc, ch ) => acc + Math.max( 0, settings.maxMembersPerChannel - ch.members.size ), 0 );

        if ( totalFreeSlots > 1 ) return;

        await this.createNextScalingChannel( channel, settings );
    }

    private async createNextScalingChannel( anchor: VoiceBasedChannel, settings: ManagedCategorySettings ) {
        const master = await this.findMasterScalingChannelInCategory( anchor );

        if ( !master ) return;

        const scaling = await this.listScalingChannels( anchor );

        const name = this.buildNextName( scaling );

        await this.services.channelService.create( {
            guild: master.guild,
            parent: master.parent as any,
            userOwnerId: this.services.appService.getClient().user.id,
            ownerChannelId: master.id,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.SCALING_CHANNEL,
            version: ( await ChannelModel.$.getByChannelId( master.id ) )?.version as any,
            name,
            type: ChannelType.GuildVoice,
            userLimit: settings.maxMembersPerChannel
        } );
    }

    private async ensureScaleDown( channel: VoiceBasedChannel ) {
        const scaling = await this.listScalingChannels( channel );

        if ( scaling.length <= 1 ) return;

        const empties = scaling.filter( ch => ch.members.size === 0 );

        if ( empties.length <= 1 ) return;

        let candidate = empties[ 0 ];

        for ( const ch of empties ) {
            const { index: i1 } = this.getBaseNameAndIndex( candidate.name );
            const { index: i2 } = this.getBaseNameAndIndex( ch.name );

            if ( i2 > i1 ) candidate = ch;
        }

        await this.services.channelService.delete( { guild: candidate.guild, channel: candidate } );
    }
}

export default ScalingChannelService;

