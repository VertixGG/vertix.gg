import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import {
    ChannelType,
    CommandInteraction,
    Guild,
    Interaction,
    NonThreadGuildBasedChannel,
    PermissionsBitField,
    SelectMenuInteraction,
    VoiceBasedChannel
} from "discord.js";

import {
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs,
    IMasterChannelCreateArgs,
    IMasterChannelCreateDynamicArgs
} from "../interfaces/channel";

import {
    DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
    DEFAULT_MASTER_CATEGORY_NAME,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_NAME,
    DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS,
    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
} from "@dynamico/constants/master-channel";

import {
    categoryManager,
    channelDataManager,
    channelManager,
    guiManager,
    permissionsManager
} from "@dynamico/managers";

import { DATA_CHANNEL_KEY_MISSING_PERMISSIONS, DATA_CHANNEL_KEY_SETTINGS } from "@dynamico/constants/channel-data";

import CategoryModel from "@dynamico/models/category";
import ChannelModel from "@dynamico/models/channel";

import { ManagerCacheBase } from "@internal/bases/manager-cache-base";

export class MasterChannelManager extends ManagerCacheBase<any> {
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

        const channel = await channelManager.getChannel(
            args.newState.guild.id,
            args.newState.channelId || "",
            true
        );

        if ( ! channel || ! newState.channel ) {
            this.logger.error( this.onJoinMasterCreateChannel,
                `Could not find channel '${ channelName }'` );

            return;
        }

        // Receive missing permissions.
        const missingPermissions: string[] = [],
            missingPermissionsDB = await channelDataManager.getData( {
                ownerId: channel.id,
                key: DATA_CHANNEL_KEY_MISSING_PERMISSIONS,
                default: null,
            } );
        if ( missingPermissionsDB?.values ) {
            missingPermissions.push( ... missingPermissionsDB.values );
        }

        const missingPermissionsRoles = permissionsManager.getMissingPermissions(
            DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
            args.newState.guild,
        );

        // Add missing permissions roles to missing permissions.
        if ( missingPermissionsRoles.length > 0 ) {
            // Add only if not already added.

            // TODO: Can by optimized.
            missingPermissionsRoles.forEach( ( role ) => {
                if ( ! missingPermissions.includes( role ) ) {
                    missingPermissions.push( role );
                }
            } );
        }

        if ( missingPermissions.length ) {
            this.logger.warn( this.onJoinMasterCreateChannel,
                `User '${ displayName }' connected to master channel '${ channelName }' but is missing permissions` );

            const message = await guiManager.get( "Dynamico/UI/NotifyPermissions" )
                .getMessage( newState.channel, {
                    permissions: missingPermissions,
                    botName: newState.guild.client.user.username,
                } );

            // Get owner from guild.
            const userOwnerId = newState.guild.ownerId,
                owner = await newState.guild.members.fetch( userOwnerId );

            // Get guild master from database.
            if ( newState.channelId ) {
                const masterChannel = await channelManager.getChannel( newState.guild.id, newState.channelId, true );

                if ( masterChannel ) {
                    const channelOwner = await newState.guild.members.fetch( masterChannel.userOwnerId );

                    if ( channelOwner.id !== userOwnerId ) {
                        await channelOwner.send( message );
                    }
                }
            }

            // Send message to owner.
            await owner.send( message );

            return;
        }

        // Create a new dynamic channel for the user.
        const dynamicChannel = await this.createDynamic( { displayName, guild, oldState, newState, } ),
            message = await guiManager
                .get( "Dynamico/UI/EditDynamicChannel" )
                .getMessage( newState.channel as NonThreadGuildBasedChannel ); // TODO: Remove `as`.

        message.content = "<@" + newState.member?.id + ">";

        await dynamicChannel?.send( message );
    }

    /**
     * onLeaveDynamicChannel() :: Called when a user leaves a dynamic channel.
     */
    public async onLeaveDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info( this.onLeaveDynamicChannel,
            `User '${ displayName }' left dynamic channel '${ channelName }'` );

        // If the channel is empty, delete it.
        if ( args.oldState.channel?.members.size === 0 ) {
            await channelManager.delete( {
                guild,
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

        this.debugger.log( this.getDefaultInheritedProperties, JSON.stringify( result ) );

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

            this.debugger.debugPermission( this.getDefaultInheritedPermissions, overwrite );

            result.push( { id, allow, deny, type } );
        }

        return result;
    }

    /**
     * Function getByDynamicChannel() :: Returns the master channel by the dynamic channel according the interaction.
     */
    public async getByDynamicChannel( interaction: Interaction, cache: boolean = false ) {
        this.logger.info( this.getByDynamicChannel, `Interaction: '${ interaction.id }', cache: '${ cache }'` );

        // If it exists in the cache, then return it.
        if ( interaction.channelId && cache ) {
            const cached = this.getCache( `getByDynamicChannel-${ interaction.channelId }` );

            if ( cached ) {
                return cached;
            }
        }

        if ( ChannelType.GuildVoice !== interaction.channel?.type || ! interaction.guildId ) {
            this.logger.error( this.getByDynamicChannel,
                `Interaction is not a voice channel, interaction: '${ interaction.id }'` );
            return null;
        }

        const dynamicChannel = interaction.channel,
            dynamicChannelDB = await ChannelModel.getInstance().get( interaction.guildId, dynamicChannel.id );

        if ( ! dynamicChannelDB ) {
            this.logger.error( this.getByDynamicChannel,
                `Could not find channel in database, guildId: ${ interaction.guildId }, dynamic channelId: ${ dynamicChannel.id }` );

            await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendContinues( interaction as SelectMenuInteraction, {
                    globalResponse: "%{masterChannelNotExist}%"
                } );

            return;
        }

        if ( ! dynamicChannelDB.ownerChannelId ) {
            this.logger.error( this.getByDynamicChannel,
                `Could not find master channel in database, guildId: ${ interaction.guildId }, dynamic channelId: ${ dynamicChannel.id }` );

            await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendContinues( interaction as SelectMenuInteraction, {
                    globalResponse: "%{masterChannelNotExist}%"
                } );

            return;
        }

        let masterChannel,
            masterChannelPromise = interaction.guild?.channels.fetch( dynamicChannelDB.ownerChannelId );

        const promise = new Promise( ( resolve ) => {
            masterChannelPromise?.catch( ( e ) => {
                this.logger.error( this.getByDynamicChannel,
                    `Could not fetch master channel, guildId: ${ interaction.guildId }, dynamic channelId: ${ dynamicChannel.id }` );
                this.logger.error( this.getByDynamicChannel, "", e );
                resolve( null );
            } ).then( ( result ) => {
                masterChannel = result;
                resolve( result );
            } );
        } );

        await promise;

        if ( ! masterChannel ) {
            this.logger.warn( this.getByDynamicChannel,
                `Could not find master channel, guildId: ${ interaction.guildId }, dynamic channelId: ${ dynamicChannel.id }` );

            await guiManager.get( "Dynamico/UI/GlobalResponse" )
                .sendContinues( interaction as SelectMenuInteraction, {
                    globalResponse: "%{masterChannelNotExist}%"
                } );

            return;
        }

        // Set cache, anyway.
        this.setCache( `getByDynamicChannel-${ interaction.channelId }`, masterChannel );

        return masterChannel;
    }

    /**
     * Function createDynamic() :: Creates a new dynamic channel for a user.
     */
    public async createDynamic( args: IMasterChannelCreateDynamicArgs ) {
        const { displayName, guild, newState } = args,
            masterChannel = newState.channel as VoiceBasedChannel,
            userOwnerId = newState.member?.id;

        const masterChannelDB = await channelManager.getChannel( guild.id, masterChannel.id, true );

        if ( ! masterChannelDB ) {
            this.logger.error( this.createDynamic,
                `Could not find master channel in database, guildId: ${ guild.id }, master channelId: ${ masterChannel.id }` );
            return;
        }

        // TODO: Data should be created, after creating the master.
        const data = await channelDataManager.getData( {
            ownerId: masterChannelDB.id,
            key: DATA_CHANNEL_KEY_SETTINGS,
            cache: true,
            default: {
                dynamicChannelNameTemplate: DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
            },
        } );

        const dynamicChannelName = data.object.dynamicChannelNameTemplate.replace(
            "%{userDisplayName}%",
            displayName
        );

        this.logger.info( this.createDynamic,
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
        const channel = await channelManager.create( {
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

    /**
     * Function createDefaultMasters() :: Creates a default master channel(s) for a guild, part of setup process.
     */
    public async createDefaultMasters( interaction: CommandInteraction, userOwnerId: string ) {
        const guild = interaction.guild as Guild;

        let masterCategory;
        try {
            masterCategory = await this.createMasterCategory( guild );
        } catch ( e ) {
            this.logger.warn( this.createDefaultMasters, "", e );
        }

        if ( masterCategory ) {
            const args = {
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

        await guiManager.get( "Dynamico/UI/GlobalResponse" )
            .sendFollowUp( interaction, {
                globalResponse: "%{somethingWentWrong}%"
            } );

        return false;
    }

    /**
     * Function createMasterCategory() :: Creates a new master category for a master channel(s).
     */
    public async createMasterCategory( guild: Guild ) {
        return await categoryManager.create( {
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
            `Creating master channel for guild '${ guild.name }' guildId: '${ guild.id }' for user: '${ args.guild.ownerId }'` );

        return await channelManager.create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: args.name || DEFAULT_MASTER_CHANNEL_CREATE_NAME,
            type: ChannelType.GuildVoice,
            permissionOverwrites: [ {
                id: guild.client.user.id,
                ... DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS,
            }, {
                id: guild.roles.everyone,
                ... DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
            } ],
        } );
    }

    /**
     * Function checkLimit() :: Validates if the guild has reached the master channel limit.
     */
    public async checkLimit( interaction: CommandInteraction, guildId: string ) {
        const hasReachedLimit = await ChannelModel.getInstance().isReachedMasterLimit( guildId );

        if ( hasReachedLimit ) {
            this.debugger.log( this.checkLimit, `GuildId: ${ guildId } has reached master limit.` );

            await guiManager.get( "Dynamico/UI/NotifyMaxMasterChannels" )
                .sendFollowUp( interaction, { maxFreeMasterChannels: DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS } );
        }

        return ! hasReachedLimit;
    }

    /**
     * Function removeLeftOvers() :: Removes leftovers of a guild.
     */
    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Removing leftovers of guild '${ guild.name }' guildId: '${ guild.id }'` );

        // TODO Relations are deleted automatically??
        await CategoryModel.getInstance().delete( guild.id );
        await ChannelModel.getInstance().delete( guild );
    }
}

export default MasterChannelManager;
