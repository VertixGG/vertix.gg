import {
    DEFAULT_MASTER_CATEGORY_NAME,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_NAME,
    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
} from "@dynamico/constants/master-channel";
import { CategoryManager, ChannelManager } from "@dynamico/managers";
import CategoryModel from "@dynamico/models/category";
import ChannelModel from "@dynamico/models/channel";
import InitializeBase from "@internal/bases/initialize-base";
import {
    ChannelType,
    Guild,
    Interaction,
    NonThreadGuildBasedChannel,
    PermissionsBitField,
    VoiceBasedChannel
} from "discord.js";

import {
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs,
    IMasterChannelCreateArgs,
    IMasterChannelCreateDynamicArgs
} from "../interfaces/channel";
import guiManager from "./gui";
import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

export class MasterChannelManager extends InitializeBase {
    private static instance: MasterChannelManager;

    private cache = new Map<string, any>();

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
            message = guiManager
                .get( "Dynamico/UI/EditChannel" )
                .getMessage( newState.channel as NonThreadGuildBasedChannel ); // TODO: Remove `as`.

        message.content = "<@" + newState.member?.id + ">";

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
     * Take overview of the master channel.
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
            let { id, allow, deny, type } = overwrite;

            // Exclude `PermissionsBitField.Flags.SendMessages` for everyone.
            if ( id === masterChannel.guild.id ) {
                deny = deny.remove( PermissionsBitField.Flags.SendMessages );
            }

            this.logger.debug( this.getDefaultInheritedPermissions, JSON.stringify( {
                id,
                allow: allow.toArray(),
                deny: deny.toArray(),
                type,
            } ) );

            result.push( { id, allow, deny, type } );
        }

        return result;
    }

    public async getMasterCreateChannelData( masterChannelId: string, cache = false ) {
        // Try get from cache.
        if ( cache ) {
            const cached = this.cache.get( `data-${ masterChannelId }` );

            if ( cached ) {
                return cached;
            }
        }

        // Get from database.
        const data = ( await ChannelModel.getInstance().getMasterChannelDataByChannelId( masterChannelId, E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL ) );

        if ( ! data ) {
            this.logger.error( this.getMasterCreateChannelData,
                `Could not find master channel data for channelId: '${ masterChannelId }'`
            );
            return;
        }

        // Set cache.
        this.cache.set( `data-${ masterChannelId }`, data );

        return data;
    }

    /**
     * Function createDynamic() :: Creates a new dynamic channel for a user.
     */
    public async createDynamic( args: IMasterChannelCreateDynamicArgs ) {
        const { displayName, guild, newState } = args,
            masterChannel = newState.channel as VoiceBasedChannel,
            userOwnerId = newState.member?.id,
            data = await this.getMasterCreateChannelData( masterChannel.id, true ),
            dynamicChannelName = data.newDynamicChannelTemplateName.replace(
                "%{userDisplayName}%",
                displayName
            );

        this.logger.log( this.createDynamic,
            `Creating dynamic channel '${ dynamicChannelName }' for user '${ displayName }' ownerId: '${ userOwnerId }'` );

        const categoryChannel = masterChannel.parent,
            inheritedProperties = this.getDefaultInheritedProperties( masterChannel ),
            inheritedPermissions = this.getDefaultInheritedPermissions( masterChannel ),
            permissionOverwrites = [
                ... inheritedPermissions,
                {
                    id: newState.id,
                    ... DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
                }
            ];

        // Create channel for the user.
        const channel = await ChannelManager.getInstance().create( {
            guild,
            name: dynamicChannelName,
            // ---
            userOwnerId: newState.id,
            ownerChannelId: masterChannel.id,
            // ---
            type: ChannelType.GuildVoice,
            parent: categoryChannel,
            internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL,
            // ---
            ... inheritedProperties,
            // ---
            permissionOverwrites,
        } );

        // Move the user to new created channel.
        await newState.setChannel( channel.id );

        return channel;
    }

    public async createDefaultMasters( guild: Guild, userOwnerId: string ) {
        const masterCategory = await this.createMasterCategory( guild ),
            args = {
                guild,
                userOwnerId,
                parent: masterCategory,
            },
            masterCreateChannel = await this.createCreateChannel( args );

        return {
            masterCategory,
            masterCreateChannel,
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
            userOwnerId: args.userOwnerId,
            internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: args.name || DEFAULT_MASTER_CHANNEL_CREATE_NAME,
            type: ChannelType.GuildVoice,
            permissionOverwrites: [ {
                id: guild.roles.everyone,
                ... DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
            } ],
        } );
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Removing leftovers of guild '${ guild.name }'` );

        // TODO Relations are deleted automatically??
        CategoryModel.getInstance().delete( guild.id );
        ChannelModel.getInstance().delete( guild );
    }

    public getByDynamicChannelSync( interaction: Interaction ) {
        this.logger.debug( this.getByDynamicChannelSync, `Interaction: '${ interaction.id }'` );

        // If it exists in the cache, then return it.
        if ( interaction.channelId ) {
            const cached = this.cache.get( `getByDynamicChannel-${ interaction.channelId }` );

            if ( cached ) {
                this.logger.log( this.getByDynamicChannel, `Found in cache: '${ interaction.channelId }'` );

                return cached;
            }
        } else {
            this.logger.warn( this.getByDynamicChannelSync, `Interaction: '${ interaction.id }' has no channelId` );
        }

        return null;
    }

    public async getByDynamicChannel( interaction: Interaction, cache: boolean = false ) {
        this.logger.debug( this.getByDynamicChannel, `Interaction: '${ interaction.id }', cache: '${ cache }'` );

        // If it exists in the cache, then return it.
        if ( interaction.channelId && cache ) {
            const cached = this.cache.get( `getByDynamicChannel-${ interaction.channelId }` );

            if ( cached ) {
                this.logger.log( this.getByDynamicChannel, `Found in cache: '${ interaction.channelId }'` );

                return cached;
            }
        }

        if ( ChannelType.GuildVoice !== interaction.channel?.type || ! interaction.guildId ) {
            return null;
        }

        if ( ! interaction.isButton() && ! interaction.isStringSelectMenu() && ! interaction.isModalSubmit() ) {
            return null;
        }

        const dynamicChannel = interaction.channel,
            dynamicChannelDB = await ChannelModel.getInstance().get( interaction.guildId, dynamicChannel.id );

        if ( ! dynamicChannelDB ) {
            this.logger.error( this.getByDynamicChannel,
                `Could not find channel in database. Guild ID: ${ interaction.guildId }, Dynamic Channel ID: ${ dynamicChannel.id }` );

            await guiManager.continuesMessage( interaction, "An error occurred while trying to find the channel in the database." );

            return;
        }

        if ( ! dynamicChannelDB.ownerChannelId ) {
            this.logger.error( this.getByDynamicChannel,
                `Could not find master channel in database. Guild ID: ${ interaction.guildId }, Dynamic Channel ID: ${ dynamicChannel.id }` );

            await guiManager.continuesMessage( interaction, "An error occurred while trying to find the master channel in the database." );

            return;
        }

        // Get master channel permissions.
        const masterChannel = await interaction.guild?.channels.fetch( dynamicChannelDB.ownerChannelId );

        if ( ! masterChannel ) {
            this.logger.warn( this.getByDynamicChannel,
                `Could not find master channel. Guild ID: ${ interaction.guildId }, Dynamic Channel ID: ${ dynamicChannel.id }` );

            await guiManager.continuesMessage( interaction, "An error occurred while trying to find the master channel." );

            return;
        }

        // Set cache, anyway.
        this.cache.set( `getByDynamicChannel-${ interaction.channelId }`, masterChannel );

        return masterChannel;
    }
}

export default MasterChannelManager;
