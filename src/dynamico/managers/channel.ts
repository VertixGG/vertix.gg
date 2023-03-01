import {
    ChannelType,
    DMChannel,
    NonThreadGuildBasedChannel,
    VoiceState
} from "discord.js";

import {
    IChannelCreateArgs,
    IChannelDeleteArgs,
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs
} from "../interfaces/channel";

import InitializeBase from "@internal/bases/initialize-base";

import ChannelModel from "@dynamico/models/channel";

import MasterChannelManager from "./master-channel";

const UNKNOWN_DISPLAY_NAME = "Unknown User",
    UNKNOWN_CHANNEL_NAME = "Unknown Channel";

export default class ChannelManager extends InitializeBase {
    private static instance: ChannelManager;
    private channelModel: ChannelModel;

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

    constructor() {
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

    /**
     * Function create() :: Creates a new channel for a guild.
     */
    public async create( args: IChannelCreateArgs ) {
        const { name, guild, ownerId = false, internalType = false } = args;

        if ( ! internalType ) {
            throw new Error( "Internal type is required to create a channel." );
        }

        this.logger.info( this.create,
            `Creating channel for guild '${ guild.name }' with the following properties: ` +
                    `With name: '${ name }', ownerId: '${ ownerId }', internalType: '${ internalType }'`
        );

        const channel = await guild.channels.create( args ),
            // Data to be inserted into the database.
            data:any = {
                name,
                internalType,
                channelId: channel.id,
                guildId: guild.id,
                createdAtDiscord: channel.createdTimestamp,
            };

        if ( channel.parentId ) {
            data.categoryId = channel.parentId;
        }

        if ( ownerId ) {
            data.ownerId = args.ownerId;
        }

        await this.channelModel.create( { data } );

        return channel;
    }

    public async delete( args: IChannelDeleteArgs ) {
        const { channel, guild, channelName } = args;

        this.logger.info( this.delete,
            `Deleting channel '${ channelName }' for guild '${ guild.name }'` );

        await this.channelModel.delete( guild, channel.id );

        await channel.delete();
    }
}
