import {
    CategoryChannel,
    CategoryCreateChannelOptions,
    ChannelType,
    DMChannel,
    Guild,
    GuildChannel,
    NonThreadGuildBasedChannel,
    VoiceChannel,
    VoiceState,
} from "discord.js";

import { E_INTERNAL_CHANNEL_TYPES } from "@vertix-base-prisma-bot";

import { Debugger } from "@vertix-base/modules/debugger";
import { InitializeBase } from "@vertix-base/bases/initialize-base";

import { isDebugOn } from "@vertix-base/utils/debug";

import { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "../interfaces/channel";

import { AppManager } from "@vertix/managers/app-manager";
import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";
import { PermissionsManager } from "@vertix/managers/permissions-manager";
import { MasterChannelManager } from "@vertix/managers/master-channel-manager";
import { CategoryManager } from "@vertix/managers/category-manager";

import { ChannelModel } from "@vertix/models/channel-model";

interface IChannelCreateArgs extends CategoryCreateChannelOptions {
    guild: Guild,
    parent?: CategoryChannel;
    userOwnerId: string,
    ownerChannelId?: string,
    internalType: E_INTERNAL_CHANNEL_TYPES,
}

interface IChannelUpdateArgs {
    channel: GuildChannel,
    userOwnerId: string,
}

interface IChannelDeleteArgs {
    guild: Guild,
    channel: GuildChannel,
}

export class ChannelManager extends InitializeBase {
    private static instance: ChannelManager;

    private debugger: Debugger;

    public static getName() {
        return "Vertix/Managers/Channel";
    }

    public static getInstance(): ChannelManager {
        if ( ! ChannelManager.instance ) {
            ChannelManager.instance = new ChannelManager();
        }

        return ChannelManager.instance;
    }

    public static get $() {
        return ChannelManager.getInstance();
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugOn( "MANAGER", ChannelManager.getName() ) );
    }

    public async onJoin( oldState: VoiceState, newState: VoiceState ) {
        const displayName = newState.member?.displayName as string,
            channelName = newState.channel?.name as string;

        this.logger.log( this.onJoin,
            `Guild id: '${ oldState.guild.id }' - User: '${ displayName }' joined to channel: '${ channelName }'`
        );

        await this.onEnterGeneric( {
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

        await this.onEnterGeneric( {
            oldState,
            newState,
            displayName,
            channelName: newChannelName
        } );
    }

    public async onEnterGeneric( args: IChannelEnterGenericArgs ) {
        const { oldState, newState } = args;

        this.debugger.log( this.onEnterGeneric,
            `Guild id: '${ oldState.guild.id }' - oldChannelId: '${ oldState.channelId }' - newChannelId: '${ newState.channelId }'` );

        if ( ! newState.channelId ) {
            this.logger.error( this.onEnterGeneric,
                `Guild id: '${ oldState.guild.id }' - User: '${ args.displayName }' ` +
                `joined to channel: '${ args.channelName }' but channel id is not found.` );
            return;
        }

        if ( await ChannelModel.$.isMaster( newState.channelId ) ) {
            await MasterChannelManager.$.onJoinMasterChannel( args );
        } else if ( await ChannelModel.$.isDynamic( newState.channelId ) ) {
            await DynamicChannelManager.$.onJoinDynamicChannel( args );
        }

        await this.onLeave( oldState, newState );
    }

    public async onLeave( oldState: VoiceState, newState: VoiceState ) {
        const displayName = newState.member?.displayName as string,
            channelName = newState.channel?.name as string;

        this.logger.log( this.onLeave,
            `Guild id: '${ oldState.guild.id }' - User: '${ displayName }' left channel guild: '${ oldState.guild.name }'`
        );

        const leaveArgs: IChannelLeaveGenericArgs = {
            oldState,
            newState,
            displayName,
            channelName
        };

        if ( oldState.channelId && await ChannelModel.$.isDynamic( oldState.channelId ) ) {
            await DynamicChannelManager.$.onLeaveDynamicChannel( leaveArgs );
        }
    }

    public async onChannelDelete( channel: DMChannel | NonThreadGuildBasedChannel ) {
        this.debugger.log( this.onChannelDelete, `Channel id: '${ channel.id }' was deleted` );

        switch ( channel.type ) {
            case ChannelType.GuildVoice:
                if ( await ChannelModel.$.isMaster( channel.id ) ) {
                    await MasterChannelManager.$.onDeleteMasterChannel( channel );
                }
                break;

            case ChannelType.GuildCategory:
                await CategoryManager.$.onDelete( channel );
                break;
        }
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

        const result = await AppManager.$.getClient().channels.fetch( masterChannelDB.channelId );

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

        const masterChannel = await AppManager.$.getClient().channels.fetch( masterChannelDB.channelId );
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

        const channel = await guild.channels.create( args ).catch( ( error ) => {
            this.logger.error( this.create,
                `Guild id: '${ guild.id }' - Error while creating channel for guild: '${ guild.name }'`
            );
        } );

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

        return { channel, db: await ChannelModel.$.create( { data } ) };
    }

    public async update( args: IChannelUpdateArgs ) {
        const { channel, userOwnerId } = args;

        this.logger.info( this.update,
            `Guild id: '${ channel.guild.id }' - Updating channel: '${ channel.name }' channel id: '${ channel.id }' ` +
            `guild: '${ channel.guild.name }' with the following properties: ownerId: '${ userOwnerId }'`
        );

        await ChannelModel.$.update( {
            where: { channelId: channel.id },
            data: { userOwnerId }
        } );
    }

    public async delete( args: IChannelDeleteArgs ) {
        const { channel, guild } = args;

        this.logger.info( this.delete,
            `Guild id: '${ guild.id } - Deleting channel: '${ channel.name }' channel id: '${ channel.id }' guild: '${ guild.name }'`
        );

        await ChannelModel.$.delete( guild.id, channel.id )
            .catch( ( e ) => this.logger.error( this.delete, "", e ) );

        // Some channels are not deletable, so we need to catch the error.
        await channel.delete().catch( ( e ) => this.logger.error( this.delete, "", e ) );
    }
}
