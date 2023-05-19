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

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "../interfaces/channel";

import { DynamicoManager } from "@dynamico/managers/dynamico";
import { DynamicChannelManager } from "@dynamico/managers/dynamic-channel";
import { PermissionsManager } from "@dynamico/managers/permissions";
import { MasterChannelManager } from "@dynamico/managers/master-channel";

import { ChannelModel } from "@dynamico/models/channel";

import { Debugger } from "@internal/modules/debugger";

import { InitializeBase } from "@internal/bases/initialize-base";

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
    channel: NonThreadGuildBasedChannel,
}

export class ChannelManager extends InitializeBase {
    private static instance: ChannelManager;

    private debugger: Debugger;

    public static getName() {
        return "Dynamico/Managers/Channel";
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

        this.debugger = new Debugger( this, "", DynamicoManager.isDebugOn( "MANAGER", ChannelManager.getName() ) );
    }

    public async onJoin( oldState: VoiceState, newState: VoiceState ) {
        const displayName = newState.member?.displayName as string,
            channelName = newState.channel?.name as string;

        this.logger.info( this.onJoin,
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

        this.logger.info( this.onLeave,
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
            case ChannelType.GuildText:
                const channelId = channel.id,
                    guildId = channel.guildId;

                this.logger.info( this.onChannelDelete,
                    `Guild id: '${ guildId }' - Channel id: '${ channelId }' was deleted` );

                if ( await ChannelModel.$.isMaster( channelId ) ) {
                    await this.delete( { channel, guild: channel.guild } );
                }

                return true;
        }

        // TODO: Bad practice, should be removed.
        return false;
    }

    public async onChannelUpdate( oldChannel: DMChannel | NonThreadGuildBasedChannel, newChannel: DMChannel | NonThreadGuildBasedChannel ) {
        this.logger.log( this.onChannelUpdate, `Channel id: '${ oldChannel.id }' was updated` );

        if ( ChannelType.GuildVoice === oldChannel.type && newChannel.type === ChannelType.GuildVoice ) {
            // If permissions were updated.
            if ( ( oldChannel as VoiceChannel ).permissionOverwrites !== ( newChannel as VoiceChannel ).permissionOverwrites ) {
                await PermissionsManager.$
                    .onChannelPermissionsUpdate( oldChannel as VoiceChannel, newChannel as VoiceChannel );
            }
        }
    }

    public async getMasterChannelDBByDynamicChannelId( dynamicChannelId: string, cache = true ) {
        this.logger.log( this.getMasterChannelDBByDynamicChannelId,
            `Dynamic channel id: '${ dynamicChannelId }' - Trying to get master channel from database`
        );

        const dynamicChannelDB = await ChannelModel.$.getByChannelId( dynamicChannelId, cache );

        if ( ! dynamicChannelDB || ! dynamicChannelDB.ownerChannelId ) {
            return null;
        }

        return await ChannelModel.$.getByChannelId( dynamicChannelDB.ownerChannelId, cache );
    }

    public async getMasterChannelByDynamicChannelId( dynamicChannelId: string, cache = true ) {
        this.logger.log( this.getMasterChannelByDynamicChannelId,
            `Dynamic channel id: '${ dynamicChannelId }' - Trying to get master channel from database`
        );

        const masterChannelDB = await this.getMasterChannelDBByDynamicChannelId( dynamicChannelId, cache );

        if ( ! masterChannelDB ) {
            return null;
        }

        const result = await DynamicoManager.$.getClient()?.channels.fetch( masterChannelDB.channelId );

        if ( ! result || result.type !== ChannelType.GuildVoice ) {
            return null;
        }

        return result;
    }

    public async getMasterChannelAndDBbyDynamicChannelId( dynamicChannelId: string, cache: boolean = true ) {
        const masterChannelDB = await ChannelModel.$.getByChannelId( dynamicChannelId, cache );
        if ( ! masterChannelDB ) {
            return null;
        }

        const masterChannel = await DynamicoManager.$.getClient()?.channels.fetch( masterChannelDB.channelId );
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

        const channel = await guild.channels.create( args ),
            // Data to be inserted into the database.
            data: any = {
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

        await ChannelModel.$.delete( guild, channel.id )
            .catch( ( e ) => this.logger.error( this.delete, "", e ) );

        // Some channels are not deletable, so we need to catch the error.
        await channel.delete().catch( ( e ) => this.logger.error( this.delete, "", e ) );
    }
}
