import { ChannelType, Guild, VoiceState } from "discord.js";

import PrismaBase from "@internal/bases/prisma-base";
import Logger from "@internal/modules/logger";

import {
    IChannelCreateArgs,
    IChannelDeleteArgs,
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs
} from "../interfaces/channel";

import MasterChannelManager from "./master-channel-manager";

const UNKNOWN_DISPLAY_NAME = "Unknown User",
    UNKNOWN_CHANNEL_NAME = "Unknown Channel";

export default class ChannelManager extends PrismaBase {
    private static instance: ChannelManager;

    private logger: Logger;

    private masterChannelManager: MasterChannelManager;

    public static getInstance(): ChannelManager {
        if ( ! ChannelManager.instance ) {
            ChannelManager.instance = new ChannelManager();
        }

        return ChannelManager.instance;
    }

    public static getName(): string {
        return "Discord/Managers/ChannelManager";
    }

    constructor() {
        super();

        this.logger = new Logger( this );

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
        const { newState } = args;

        if ( newState.channelId && await this.masterChannelManager.isMaster( newState.channelId, newState.guild.id ) ) {
            await this.masterChannelManager.onJoinMasterChannel( args );
        } else {
            await this.onLeaveGeneric( args );
        }
    }

    public async onLeaveGeneric( args: IChannelLeaveGenericArgs ) {
        const { oldState, newState } = args;

        if ( oldState.channelId && await this.masterChannelManager.isDynamic( oldState.channelId, newState.guild.id ) ) {
            await this.masterChannelManager.onLeaveDynamicChannel( args );
        }
    }

    /**
     * Function create() :: Creates a new channel for a guild.
     */
    public async create( args: IChannelCreateArgs ) {
        const { name, guild, isMaster = false, isDynamic = false } = args;

        this.logger.info( this.create,
            `Creating channel for guild '${ guild.name }' with the following properties:\n` +
                    `With name: '${ name }'\n` +
                    `isMaster: '${ isMaster }'\n` +
                    `isDynamic: '${ isDynamic }'`
        );

        const channel = await guild.channels.create( args );

        const data = {
            name,
            channelId: channel.id,
            guildId: guild.id,
            createdAtDiscord: channel.createdTimestamp,
        } as any;

        if ( channel.parentId ) {
            data.categoryId = channel.parentId;
        }

        if ( isMaster ) {
            data.isMaster = true;
        }

        if ( isDynamic ) {
            data.isDynamic = true;
        }

        await this.prisma.channel.create( { data } );

        return channel;
    }

    public async delete( args: IChannelDeleteArgs ) {
        const { channel, guild, channelName } = args;

        this.logger.info( this.delete,
            `Deleting channel '${ channelName }' for guild '${ guild.name }'` );

        await this.prisma.channel.deleteMany( {
            where: {
                channelId: channel.id,
                guildId: guild.id,
            }
        } );

        await channel.delete();
    }

    // TODO: Create a model class for such methods.
    public async deleteFromDB( guild: Guild ) {
        if ( await this.isExisting( guild ) ) {
            this.logger.info( this.deleteFromDB,
                `Deleting all channels for guild '${ guild.name }'` );

            await this.prisma.channel.deleteMany( { where: { guildId: guild.id } } );
        }
    }

    public async isExisting( guild: Guild ) {
        return !! await this.prisma.channel.findFirst( { where: { guildId: guild.id } } );
    }
}
