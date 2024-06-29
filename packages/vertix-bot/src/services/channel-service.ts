import "@vertix.gg/prisma/bot-client";
import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ChannelDataManager } from "@vertix.gg/base/src/managers/channel-data-manager";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ChannelType } from "discord.js";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

import type {
    CategoryChannel,
    CategoryCreateChannelOptions,
    DMChannel,
    Guild,
    GuildChannel,
    NonThreadGuildBasedChannel,
    VoiceChannel,
    VoiceState
} from "discord.js";

interface IChannelCreateArgs extends CategoryCreateChannelOptions {
    guild: Guild,
    parent?: CategoryChannel;
    userOwnerId: string,
    ownerChannelId?: string,
    internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES,
}

interface IChannelUpdateArgs {
    channel: GuildChannel,
    userOwnerId: string,
}

interface IChannelDeleteArgs {
    guild: Guild,
    channel: GuildChannel,
}

export class ChannelService extends ServiceWithDependenciesBase<{
    appService: AppService,
}> {
    private debugger: Debugger;

    public static getName() {
        return "VertixBot/Services/Channel";
    }

    public constructor() {
        super();

        this.debugger = new Debugger(
            this,
            "",
            isDebugEnabled( "SERVICE", ChannelService.getName() )
        );

        EventBus.$.register( this, [
            this.onJoin,
            this.onLeave,
            this.onChannelGuildVoiceDelete,
        ] );
    }

    // Remove this auto-generated return type.
    // getDependencies(): TServicesNonEmpty<TServiceNameDependencies<D>> {
    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
        };
    }

    public async onEnter( oldState: VoiceState, newState: VoiceState ) {
        const displayName = newState.member?.displayName as string,
            channelName = newState.channel?.name as string;

        this.logger.log( this.onEnter,
            `Guild id: '${ oldState.guild.id }' - User: '${ displayName }' joined to channel: '${ channelName }'`
        );

        await this.onJoinGeneric( {
            oldState,
            newState,
            displayName,
            channelName
        } );
    }

    public async onSwitch( oldState: VoiceState, newState: VoiceState ) {
        const displayName = newState.member?.displayName as string,
            oldChannelName = oldState.channel?.name as string,
            newChannelName = newState.channel?.name as string;

        this.logger.log( this.onSwitch,
            `Guild id: '${ oldState.guild.id }' - User: '${ displayName }' switched from channel: '${ oldChannelName }' to channel: '${ newChannelName }'`
        );

        await this.onJoinGeneric( {
            oldState,
            newState,
            displayName,
            channelName: newChannelName
        } );

        await this.onLeaveGeneric( oldState, newState );
    }

    public async onJoinGeneric( args: IChannelEnterGenericArgs ) {
        const { oldState, newState } = args;

        this.debugger.log( this.onJoinGeneric,
            `Guild id: '${ oldState.guild.id }' - oldChannelId: '${ oldState.channelId }' - newChannelId: '${ newState.channelId }'` );

        if ( ! newState.channelId ) {
            this.logger.error( this.onJoinGeneric,
                `Guild id: '${ oldState.guild.id }' - User: '${ args.displayName }' ` +
                `joined to channel: '${ args.channelName }' but channel id is not found.` );
            return;
        }

        await this.onJoin( args );
    }

    public async onJoin( args: IChannelEnterGenericArgs ) {
        this.debugger.log( this.onJoin,
            `Guild id: '${ args.newState.guild.id }' - User: '${ args.displayName }' joined to channel: '${ args.channelName }'`
        );
    }

    public async onLeaveGeneric( oldState: VoiceState, newState: VoiceState ) {
        const displayName = newState.member?.displayName as string,
            channelName = newState.channel?.name as string;

        this.logger.log( this.onLeaveGeneric,
            `Guild id: '${ oldState.guild.id }' - User: '${ displayName }' left channel guild: '${ oldState.guild.name }'`
        );

        const leaveArgs: IChannelLeaveGenericArgs = {
            oldState,
            newState,
            displayName,
            channelName
        };

        if ( oldState.channelId ) {
            await this.onLeave( leaveArgs );
        }
    }

    public async onLeave( _args: IChannelLeaveGenericArgs ) {

    }

    public async onChannelDelete( channel: DMChannel | NonThreadGuildBasedChannel ) {
        this.debugger.log( this.onChannelDelete, `Channel id: '${ channel.id }' was deleted` );

        switch ( channel.type ) {
            case ChannelType.GuildVoice:
                await this.onChannelGuildVoiceDelete( channel as VoiceChannel );
                break;

            case ChannelType.GuildCategory:
                await CategoryManager.$.onDelete( channel );
                break;
        }
    }

    public async onChannelGuildVoiceDelete( channel: VoiceChannel ) {
        this.debugger.log( this.onChannelGuildVoiceDelete,
            `Guild id: '${ channel.guild.id }' - Voice channel: '${ channel.name }' was deleted`
        );

        // if ( await ChannelModel.$.isMaster( channel.id ) ) {
        //     await this.onDeleteMasterChannel( channel );
        // }
    }

    public async onChannelUpdate( oldChannelState: DMChannel | NonThreadGuildBasedChannel, newChannelState: DMChannel | NonThreadGuildBasedChannel ) {
        this.logger.log( this.onChannelUpdate, `Channel id: '${ oldChannelState.id }' was updated` );

        if ( ChannelType.GuildVoice === oldChannelState.type && newChannelState.type === ChannelType.GuildVoice ) {
            // If permissions were updated.
            if ( ( oldChannelState as VoiceChannel ).permissionOverwrites.cache.toJSON() !== ( newChannelState as VoiceChannel ).permissionOverwrites.cache.toJSON() ) {
                await PermissionsManager.$
                    .onChannelPermissionsUpdate( oldChannelState as VoiceChannel, newChannelState as VoiceChannel );
            }
        }
    }

    public async getMasterChannelByDynamicChannelId( dynamicChannelId: string, cache = true ) {
        this.logger.log( this.getMasterChannelByDynamicChannelId,
            `Dynamic channel id: '${ dynamicChannelId }', cache: '${ cache }' - Trying to get master channel from database`
        );

        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( dynamicChannelId, cache );

        if ( ! masterChannelDB ) {
            return null;
        }

        const result = await this.services.appService.getClient().channels.fetch( masterChannelDB.channelId );

        if ( ! result || result.type !== ChannelType.GuildVoice ) {
            return null;
        }

        return result;
    }

    public async getMasterChannelAndDBbyDynamicChannelId( dynamicChannelId: string, cache: boolean = true ) {
        const masterChannelDB = await ChannelModel.$.getMasterChannelDBByDynamicChannelId( dynamicChannelId, cache );
        if ( ! masterChannelDB ) {
            return null;
        }

        const masterChannel = await this.services.appService.getClient().channels.fetch( masterChannelDB.channelId );
        if ( ! masterChannel || masterChannel.type !== ChannelType.GuildVoice ) {
            return null;
        }

        return {
            channel: masterChannel,
            db: masterChannelDB,
        };
    }

    public async create( args: IChannelCreateArgs ) {
        const { name, guild, userOwnerId, internalType, ownerChannelId = null } = args;

        this.logger.info( this.create,
            `Guild id: '${ guild.id }' - Creating channel for guild: '${ guild.name }' with the following properties: ` +
            `name: '${ name }' ownerId: '${ userOwnerId }' internalType: '${ internalType }' ` +
            `ownerChannelId: '${ args.ownerChannelId }'`
        );

        const channel = await guild.channels.create( args ).catch( () =>
            this.logger.error( this.create,
                `Guild id: '${ guild.id }' - Error while creating channel for guild: '${ guild.name }'`
            ) );

        if ( ! channel ) {
            return null;
        }

        // Data to be inserted into the database.
        const data: any = {
            internalType,
            userOwnerId,
            channelId: channel.id,
            guildId: guild.id,
            createdAtDiscord: channel.createdTimestamp,
        };

        this.debugger.log( this.create,
            `Guild id: '${ guild.id }' - Channel id '${ channel.id }' was created`
        );

        if ( channel.parentId ) {
            data.categoryId = channel.parentId;
        }

        if ( ownerChannelId ) {
            data.ownerChannelId = ownerChannelId;
        }

        return { channel, db: ChannelModel.$.create( { data } ) };
    }

    public async update( args: IChannelUpdateArgs ) {
        const { channel, userOwnerId } = args;

        this.logger.info( this.update,
            `Guild id: '${ channel.guild.id }' - Updating channel: '${ channel.name }' channel id: '${ channel.id }' ` +
            `guild: '${ channel.guild.name }' with the following properties: ownerId: '${ userOwnerId }'`
        );

        const where = {
            where: { channelId: channel.id },
            data: { userOwnerId }
        };

        await ChannelModel.$.update( where,
            ( cache ) => ChannelDataManager.$.removeFromCache( cache.id )
        );
    }

    public async delete( args: IChannelDeleteArgs ) {
        const { channel, guild } = args;

        this.logger.info( this.delete,
            `Guild id: '${ guild.id } - Deleting channel: '${ channel.name }' channel id: '${ channel.id }' guild: '${ guild.name }'`
        );

        const where = {
            guildId: guild.id,
            channelId: channel.id,
        };

        await ChannelModel.$.delete( where,
            ( cached ) => ChannelDataManager.$.removeFromCache( cached.id )
        ).catch( ( e ) => this.logger.error( this.delete, "", e ) );

        // Some channels are not deletable, so we need to catch the error.
        await channel.delete().catch( ( e ) => this.logger.error( this.delete, "", e ) );
    }
}

export default ChannelService;
