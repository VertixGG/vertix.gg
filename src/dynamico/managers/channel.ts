import { channel } from "@prisma/client";

import {
    ChannelType,
    DMChannel,
    NonThreadGuildBasedChannel,
    VoiceChannel,
    VoiceState
} from "discord.js";

import MasterChannelManager from "./master-channel";

import {
    IChannelCreateArgs,
    IChannelDeleteArgs,
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs
} from "../interfaces/channel";

import guiManager from "@dynamico/managers/gui";
import ChannelModel from "@dynamico/models/channel";

import InitializeBase from "@internal/bases/initialize-base";

const UNKNOWN_DISPLAY_NAME = "Unknown User",
    UNKNOWN_CHANNEL_NAME = "Unknown Channel";

export class ChannelManager extends InitializeBase {
    private static instance: ChannelManager;

    private channelModel: ChannelModel;

    private cache = new Map<string, channel | null>();

    private masterChannelManager: MasterChannelManager;

    public static getInstance(): ChannelManager {
        if ( ! ChannelManager.instance ) {
            ChannelManager.instance = new ChannelManager();
        }

        return ChannelManager.instance;
    }

    public static getName(): string {
        return "Dynamico/Managers/Channel";
    }

    public constructor() {
        super();

        this.channelModel = ChannelModel.getInstance();

        this.masterChannelManager = MasterChannelManager.getInstance();
    }

    public async onJoin( oldState: VoiceState, newState: VoiceState ) {
        const displayName = newState.member?.displayName || UNKNOWN_DISPLAY_NAME,
            channelName = newState.channel?.name || UNKNOWN_CHANNEL_NAME;

        this.logger.info( this.onJoin,
            `User '${ displayName }' joined channel '${ channelName }'` );

        await this.onEnterGeneric( {
            oldState,
            newState,
            displayName,
            channelName
        } );
    }

    public async onSwitch( oldState: VoiceState, newState: VoiceState ) {
        const displayName = newState.member?.displayName || UNKNOWN_DISPLAY_NAME,
            oldChannelName = oldState.channel?.name || UNKNOWN_CHANNEL_NAME,
            newChannelName = newState.channel?.name || UNKNOWN_CHANNEL_NAME;

        this.logger.info( this.onSwitch,
            `User '${ displayName }' switched from channel '${ oldChannelName }' to channel '${ newChannelName }'` );

        await this.onEnterGeneric( {
            oldState,
            newState,
            displayName,
            channelName: newChannelName
        } );
    }

    /**
     * Function onLeave() :: Called when a user leaves a channel,
     *
     * @note Does not goes anywhere else, mostly leave the guild.
     */
    public async onLeave( oldState: VoiceState, newState: VoiceState ) {
        const displayName = newState.member?.displayName || UNKNOWN_DISPLAY_NAME,
            channelName = newState.channel?.name || UNKNOWN_CHANNEL_NAME;

        this.logger.info( this.onLeave,
            `User '${ displayName }' left channel from guild: '${ oldState.guild.name }'` );

        await this.onLeaveGeneric( {
            oldState,
            newState,
            displayName,
            channelName
        } );
    }

    public async onEnterGeneric( args: IChannelEnterGenericArgs ) {
        const { oldState, newState } = args;

        if ( newState.channelId && await this.channelModel.isMasterCreate( newState.channelId, newState.guild.id ) ) {
            await this.masterChannelManager.onJoinMasterCreateChannel( args );
        }

        // If the user switched channels.
        if ( oldState.channelId !== newState.channelId ) {
            await this.onLeaveGeneric( args );
        }
    }

    public async onLeaveGeneric( args: IChannelLeaveGenericArgs ) {
        const { oldState, newState } = args;

        if ( oldState.channelId && await this.channelModel.isDynamic( oldState.channelId, newState.guild.id ) ) {
            await this.masterChannelManager.onLeaveDynamicChannel( args );
        }
    }

    public async onChannelDelete( channel: DMChannel | NonThreadGuildBasedChannel ) {
        switch ( channel.type ) {
            case ChannelType.GuildVoice:
            case ChannelType.GuildText:
                const channelId = channel.id,
                    guildId = channel.guildId;

                this.logger.info( this.onChannelDelete,
                    `Channel '${ channelId }' was deleted from '${ guildId }'.` );

                if ( await this.channelModel.isMasterCreate( channelId, guildId ) ) {
                    await this.channelModel.delete( channel.guild, channelId );
                }

                return true;
        }

        return false;
    }

    public async onChannelUpdate( oldChannel: DMChannel | NonThreadGuildBasedChannel, newChannel: DMChannel | NonThreadGuildBasedChannel ) {
        this.logger.info( this.onChannelUpdate, `Channel '${ oldChannel.id }' was updated.` );

        if ( ChannelType.GuildVoice === oldChannel.type && newChannel.type === ChannelType.GuildVoice ) {
            // If permissions were updated.
            if ( ( oldChannel as VoiceChannel ).permissionOverwrites !== ( newChannel as VoiceChannel ).permissionOverwrites ) {
                await this.onVoiceChannelUpdatePermissions( oldChannel as VoiceChannel, newChannel as VoiceChannel );
            }
        }
    }

    public async onVoiceChannelUpdatePermissions( oldChannel: VoiceChannel, newChannel: VoiceChannel ) {
        this.logger.info( this.onVoiceChannelUpdatePermissions,
            `Channel '${ oldChannel.id }' permissions were updated.` );

        // Print debug new permissions.
        // TODO: Utils.debugPermissions()
        this.logger.debug( this.onVoiceChannelUpdatePermissions,
            `New permissions for channel '${ oldChannel.id }':\n` +
            `${ JSON.stringify( newChannel.permissionOverwrites.cache.map( ( permission ) => {
                return {
                    id: permission.id,
                    type: permission.type,
                    allow: permission.allow.toArray(),
                    deny: permission.deny.toArray()
                };
            } ) ) }` );

        let message = null;

        // TODO: Try removing this.
        try {
            message = await newChannel.messages.fetch( { limit: 1 } ).then( ( messages ) => messages.first() );

            if ( ! message ) {
                this.logger.error( this.onVoiceChannelUpdatePermissions,
                    `Failed to find message in channel '${ newChannel.id }'.` );
                return;
            }

            const newMessage = guiManager
                .get( "Dynamico/UI/EditChannel" )
                .getMessage( newChannel );

            await message.edit( newMessage );
        } catch ( error ) {
            this.logger.error( this.onVoiceChannelUpdatePermissions,
                `Failed to edit message in channel '${ newChannel.id }'.` );
            this.logger.error( this.onVoiceChannelUpdatePermissions, "", error );
        }
    }

    public async getChannel( guildId: string, channelId: string, cache = false ) {
        this.logger.debug( this.getChannel,
            `Getting channel '${ channelId }' from guild '${ guildId }', cache: '${ cache }'`
        );

        const key = guildId + channelId;

        // If in cache, return it.
        if ( cache ) {
            const result = this.cache.get( key );

            if ( result ) {
                this.logger.debug( this.getChannel,
                    `Channel '${ channelId }' from guild '${ guildId }' was found in cache.`
                );
                return result;
            }
        }

        const result = await this.channelModel.get( guildId, channelId );

        // Set cache.
        this.cache.set( key, result );

        return result;
    }

    /**
     * Function create() :: Creates a new channel for a guild.
     */
    public async create( args: IChannelCreateArgs ) {
        const { name, guild, userOwnerId, internalType, ownerChannelId = null } = args;

        this.logger.info( this.create,
            `Creating channel for guild '${ guild.name }' with the following properties: ` +
            `With name: '${ name }', ownerId: '${ userOwnerId }', internalType: '${ internalType }' ` +
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

        if ( channel.parentId ) {
            data.categoryId = channel.parentId;
        }

        if ( ownerChannelId ) {
            data.ownerChannelId = ownerChannelId;
        }

        await this.channelModel.create( { data } );

        return channel;
    }

    public async delete( args: IChannelDeleteArgs ) {
        const { channel, guild } = args;

        this.logger.info( this.delete,
            `Deleting channel '${ channel.name }' for guild '${ guild.name }'` );

        await this.channelModel.delete( guild, channel.id );

        await channel.delete();
    }
}

export default ChannelManager;
