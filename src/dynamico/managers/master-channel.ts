import { ChannelType, Guild, PermissionsBitField, VoiceBasedChannel } from "discord.js";

import {
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs,
    IMasterChanelCreateDynamicArgs,
    IMasterChannelCreateArgs,
    IMasterChannelEditArgs
} from "../interfaces/channel";

import InitializeBase from "@internal/bases/initialize-base";

import CategoryManager from "./category";
import ChannelManager from "./channel";
import GUIManager from "./gui";

import {
    DEFAULT_MASTER_CATEGORY_NAME,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_NAME,
    DEFAULT_MASTER_CHANNEL_EDIT_EVERYONE_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_EDIT_NAME,
    DEFAULT_MASTER_DYNAMIC_CHANNEL_NAME_FORMAT,
    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
} from "@dynamico/constants/master-channel";

import CategoryModel from "@dynamico/models/category";
import ChannelModel from "@dynamico/models/channel";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

export default class MasterChannelManager extends InitializeBase {
    private static instance: MasterChannelManager;

    public static getName(): string {
        return "Dynamico/Managers/MasterChannel";
    }

    public static getInstance(): MasterChannelManager {
        if ( ! MasterChannelManager.instance ) {
            MasterChannelManager.instance = new MasterChannelManager();
        }

        return MasterChannelManager.instance;
    }

    /**
     * Function onJoinMasterCreateChannel() :: Called when a user joins the master channel(➕ New Channel).
     */
    public async onJoinMasterCreateChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName, oldState, newState } = args,
            { guild } = newState;

        this.logger.info( this.onJoinMasterCreateChannel,
            `User '${ displayName }' joined master channel '${ channelName }'` );

        // Create a new dynamic channel for the user.
        const channel = await this.createDynamic( { displayName, guild, oldState, newState, } ),
            message = GUIManager
                .getInstance()
                .get( "Dynamico/UI/EditChannel" )
                .getMessage();

        await channel.send( message );
    }
    /**
     * onLeaveDynamicChannel() :: Called when a user leaves a dynamic channel.
     */
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

    /**
     * Function getDefaultInheritedProperties() :: Returns the default inherited properties from the master channel.
     */
    public getDefaultInheritedProperties( masterChannel: VoiceBasedChannel ) {
        const { rtcRegion, bitrate, userLimit } = masterChannel,
            result: any = { bitrate, userLimit };

        if ( rtcRegion !== null ) {
            result.rtcRegion = rtcRegion;
        }

        this.logger.debug( this.getDefaultInheritedProperties, JSON.stringify( result ) );

        return result;
    }

    /**
     * Function getDefaultInheritedPermissions() :: Returns the default inherited permissions from the master channel.
     */
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

    /**
     * Function createDynamic() :: Creates a new dynamic channel for a user.
     */
    public async createDynamic( args: IMasterChanelCreateDynamicArgs ) {
        const { displayName, guild, newState } = args,
            ownerId = newState.id,
            dynamicChannelName = DEFAULT_MASTER_DYNAMIC_CHANNEL_NAME_FORMAT.replace(
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
            internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL,
            // ---
            permissionOverwrites: [
                ... inheritedPermissions,
                {
                    id: newState.id,
                    ... DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
                }
            ],
            ... inheritedProperties,
        } );

        // Move the user to new created channel.
        await newState.setChannel( channel.id );

        return channel;
    }

    public async createDefaultMasters( guild: Guild ) {
        const masterCategory = await this.createMasterCategory( guild ),
            args = {
                guild,
                parent: masterCategory,
            },
            masterCreateChannel = await this.createCreateChannel( args ),
            masterEditChannel = await this.createEditChannel( args );

        return {
            masterCategory,
            masterCreateChannel,
            masterEditChannel,
        };
    }

    /**
     * Function createMasterCategory() :: Creates a new master category for a master channel(s).
     */
    public async createMasterCategory( guild: Guild ) {
        return await CategoryManager.getInstance().create( {
            guild,
            name: DEFAULT_MASTER_CATEGORY_NAME,
        } );
    }

    /**
     * Function createCreateChannel() :: Creates channel master of create.
     */
    public async createCreateChannel( args: IMasterChannelCreateArgs ) {
        const { guild, parent } = args;

        this.logger.info( this.createCreateChannel,
            `Creating master channel for guild '${ guild.name }' for user: '${ args.guild.ownerId }'` );

        // Create master channel.
        return ChannelManager.getInstance().create( {
            parent,
            guild,
            internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: args.name || DEFAULT_MASTER_CHANNEL_CREATE_NAME,
            type: ChannelType.GuildVoice,
            permissionOverwrites: [ {
                id: guild.roles.everyone,
                ... DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
            } ],
        } );
    }

    /**
     * Function createEditChannel() :: Creates channel master of edit.
     */
    public async createEditChannel( args: IMasterChannelEditArgs ) {
        const { guild, parent } = args;

        this.logger.info( this.createEditChannel,
            `Creating master channel for guild '${ guild.name }' for user: '${ args.guild.ownerId }'` );

        // Create master channel.
        return ChannelManager.getInstance().create( {
            parent,
            guild,
            internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_EDIT_CHANNEL,
            name: args.name || DEFAULT_MASTER_CHANNEL_EDIT_NAME,
            type: ChannelType.GuildText,
            permissionOverwrites: [ {
                id: guild.roles.everyone,
                ... DEFAULT_MASTER_CHANNEL_EDIT_EVERYONE_PERMISSIONS
            } ],
        } );
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Removing leftovers of guild '${ guild.name }'` );

        // TODO Relations are deleted automatically??
        CategoryModel.getInstance().delete( guild.id );
        ChannelModel.getInstance().delete( guild );
    }
}
