import {
    ChannelType,
    DMChannel,
    Guild,
    NonThreadGuildBasedChannel,
    VoiceState
} from "discord.js";

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
        const { oldState, newState } = args;

        if ( newState.channelId && await this.masterChannelManager.isMaster( newState.channelId, newState.guild.id ) ) {
            await this.masterChannelManager.onJoinMasterChannel( args );
        }

        // If the user switched channels.
        if ( oldState.channelId !== newState.channelId ) {
            await this.onLeaveGeneric( args );
        }
    }

    public async onLeaveGeneric( args: IChannelLeaveGenericArgs ) {
        const { oldState, newState } = args;

        if ( oldState.channelId && await this.masterChannelManager.isDynamic( oldState.channelId, newState.guild.id ) ) {
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

                if ( await this.masterChannelManager.isMaster( channelId, guildId ) ) {
                    await this.deleteFromDB( channel.guild, channelId );
                }
        }
    }

    /**
     * Function create() :: Creates a new channel for a guild.
     */
    public async create( args: IChannelCreateArgs ) {
        const { name, guild, ownerId = false, isMaster = false, isDynamic = false } = args;

        this.logger.info( this.create,
            `Creating channel for guild '${ guild.name }' with the following properties:\n` +
                    `With name: '${ name }', ownerId: '${ ownerId }', isMaster: '${ isMaster }, isDynamic: '${ isDynamic }'`
        );

        const channel = await guild.channels.create( args ),
            // Data to be inserted into the database.
            data:any = {
                name,
                channelId: channel.id,
                guildId: guild.id,
                createdAtDiscord: channel.createdTimestamp,
            };

        if ( channel.parentId ) {
            data.categoryId = channel.parentId;
        }

        // TODO: Make it dynamic, useless ifs.
        if ( isMaster ) {
            data.isMaster = true;
        }

        if ( isDynamic ) {
            data.isDynamic = true;
        }

        if ( ownerId ) {
            data.ownerId = args.ownerId;
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
    public async deleteFromDB( guild: Guild, channelId?: string|null ) {
        if ( await this.isExisting( guild, channelId ) ) {
            const where: any = { guildId: guild.id };

            if ( channelId ) {
                this.logger.info( this.deleteFromDB,
                    `Deleting channel '${ channelId }' for guild '${ guild.name }'` );

                where.channelId = channelId;
            } else {
                this.logger.info( this.deleteFromDB,
                    `Deleting all channels for guild '${ guild.name }'` );
            }

            await this.prisma.channel.deleteMany( { where } );
        }
    }

    public async isExisting( guild: Guild, channelId?: string|null ) {
        const where: any =  { guildId: guild.id };

        if ( channelId ) {
            where.channelId = channelId;
        }

        return !! await this.prisma.channel.findFirst( { where } );
    }
}
