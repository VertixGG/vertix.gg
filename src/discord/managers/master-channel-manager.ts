import { ChannelType, Guild, PermissionsBitField, VoiceBasedChannel } from "discord.js";

import {
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs,
    IMasterChanelCreateDynamicArgs,
    IMasterChannelCreateArgs
} from "../interfaces/channel";

import PrismaBase from "@internal/bases/prisma-base";

import CategoryManager from "./category-manager";
import ChannelManager from "./channel-manager";
import Logger from "@internal/modules/logger";

const DEFAULT_CATEGORY_NAME = "⚡ Dynamic Channels",
    DEFAULT_CHANNEL_NAME = "➕ New Channel",
    DEFAULT_DYNAMIC_CHANNEL_NAME = "%{userDisplayName}%'s Channel";

const DEFAULT_OWNER_DYNAMIC_CHANNEL_PERMISSIONS = {
    allow: [
        PermissionsBitField.Flags.ManageChannels,
        PermissionsBitField.Flags.MoveMembers,
    ],
};

/* Everyone - Send Messages - False */
const DEFAULT_EVERYONE_CHANNEL_PERMISSIONS = {
    deny: [ PermissionsBitField.Flags.SendMessages ],
};

export default class MasterChannelManager extends PrismaBase {
    private static instance: MasterChannelManager;

    private logger: Logger;

    public static getName(): string {
        return "Discord/Managers/MasterChannelManager";
    }

    public static getInstance(): MasterChannelManager {
        if ( ! MasterChannelManager.instance ) {
            MasterChannelManager.instance = new MasterChannelManager();
        }

        return MasterChannelManager.instance;
    }

    constructor() {
        super();

        this.logger = new Logger( this );
    }

    /**
     * Function onJoinMasterChannel() :: Called when a user joins the master channel(➕ New Channel).
     */
    public async onJoinMasterChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName, oldState, newState } = args,
            { guild } = newState;

        this.logger.info( this.onJoinMasterChannel,
            `User '${ displayName }' joined master channel '${ channelName }'` );

        // Create a new dynamic channel for the user.
        await this.createDynamic( { displayName, guild, oldState, newState, } );
    }

    public async onLeaveDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.log( this.onLeaveDynamicChannel,
            `User '${ displayName }' left dynamic channel '${ channelName }'` );

        // If the channel is empty, delete it.
        if ( args.oldState.channel?.members.size === 0 ) {
            await ChannelManager.getInstance().delete( {
                guild,
                channelName,
                channel: args.oldState.channel,
            } );
        }
    }

    public getDefaultInheritedProperties( masterChannel: VoiceBasedChannel ) {
        const { rtcRegion, bitrate, userLimit } = masterChannel,
            result: any = { bitrate, userLimit };

        if ( rtcRegion !== null ) {
            result.rtcRegion = rtcRegion;
        }

        this.logger.debug( this.getDefaultInheritedProperties, JSON.stringify( result ) );

        return result;
    }

    public getDefaultInheritedPermissions( masterChannel: VoiceBasedChannel ) {
        const { permissionOverwrites } = masterChannel,
            result = [];

        for ( const overwrite of permissionOverwrites.cache.values() ) {
            let { id, allow, deny } = overwrite;

            // Exclude `PermissionsBitField.Flags.SendMessages` for everyone.
            if ( id === masterChannel.guild.id ) {
                deny = deny.remove( PermissionsBitField.Flags.SendMessages );
            }

            this.logger.debug( this.getDefaultInheritedPermissions, JSON.stringify( {
                id,
                allow: allow.toArray(),
                deny: deny.toArray()
            } ) );

            result.push( { id, allow, deny } );
        }

        return result;
    }

    public async createDynamic( args: IMasterChanelCreateDynamicArgs ) {
        const { displayName, guild, newState } = args,
            ownerId = newState.id,
            dynamicChannelName = DEFAULT_DYNAMIC_CHANNEL_NAME.replace(
                "%{userDisplayName}%",
                displayName
            );

        this.logger.log( this.createDynamic,
            `Creating dynamic channel '${ dynamicChannelName }' for user '${ displayName }' ownerId: '${ ownerId }'` );

        const masterChannel = newState.channel as VoiceBasedChannel,
            masterChannelParent = masterChannel.parent;

        // Take overview of the master channel.
        const inheritedProperties = this.getDefaultInheritedProperties( masterChannel ),
            inheritedPermissions = this.getDefaultInheritedPermissions( masterChannel );

        // Create channel for the user.
        const channel = await ChannelManager.getInstance().create( {
            guild,
            isDynamic: true,
            ownerId: newState.id,
            // ---
            name: dynamicChannelName,
            type: ChannelType.GuildVoice,
            parent: masterChannelParent,
            // ---
            permissionOverwrites: [
                ... inheritedPermissions,
                {
                    id: newState.id,
                    ... DEFAULT_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
                }
            ],
            ... inheritedProperties,
        } );

        // Move the user to new created channel.
        await newState.setChannel( channel.id );
    }

    /**
     * Function create() :: Creates a new master channel for a guild.
     */
    public async create( args: IMasterChannelCreateArgs ) {
        const { guild } = args;

        this.logger.info( this.create,
            `Creating master channel for guild '${ guild.name }' for user: '${ args.guild.ownerId }'` );

        // Create master channel category.
        const category = await CategoryManager.getInstance().create( {
            guild,
            name: DEFAULT_CATEGORY_NAME,
        } );

        // Create master channel.
        return ChannelManager.getInstance().create( {
            guild,
            isMaster: true,
            name: args.name || DEFAULT_CHANNEL_NAME,
            parent: category,
            type: ChannelType.GuildVoice,
            permissionOverwrites: [ {
                id: guild.roles.everyone,
                ... DEFAULT_EVERYONE_CHANNEL_PERMISSIONS
            } ],
        } );
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Removing leftovers of guild '${ guild.name }'` );

        await CategoryManager.getInstance().delete( guild );
        await ChannelManager.getInstance().deleteFromDB( guild );
    }

    public async isMaster( channelId: string, guildId: string ) {
        return !! await this.prisma.channel.findFirst( {
            where: {
                channelId,
                guildId,
                isMaster: true
            }
        } );
    }

    public async isDynamic( channelId: string, guildId: string ) {
        return !! await this.prisma.channel.findFirst( {
            where: {
                channelId,
                guildId,
                isDynamic: true
            }
        } );
    }
}
