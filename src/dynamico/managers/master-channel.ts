import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import {
    ChannelType,
    CommandInteraction,
    Guild,
    Interaction,
    NonThreadGuildBasedChannel,
    OverwriteType,
    PermissionsBitField,
    SelectMenuInteraction,
    VoiceBasedChannel,
    VoiceChannel,
} from "discord.js";

import {
    IChannelEnterGenericArgs,
    IChannelLeaveGenericArgs,
    IMasterChannelCreateArgs,
    IMasterChannelCreateDefaultMasters,
    IMasterChannelCreateDynamicArgs
} from "../interfaces/channel";

import {
    DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
    DEFAULT_DATA_USER_DYNAMIC_CHANNEL_TEMPLATE,
    DEFAULT_MASTER_CATEGORY_NAME,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_NAME,
    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS,
} from "@dynamico/constants/master-channel";

import {
    categoryManager,
    channelManager,
    dmManager,
    dynamicoManager,
    guiManager,
    permissionsManager
} from "@dynamico/managers";

import CategoryModel from "@dynamico/models/category";
import ChannelModel from "@dynamico/models/channel";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

import { badwordsNormalizeArray } from "@dynamico/utils/badwords";
import { guildGetSettings, guildSetBadwords } from "@dynamico/utils/guild";

import {
    masterChannelGetDynamicChannelNameTemplate,
    masterChannelSetSettingsData
} from "@dynamico/utils/master-channel";

import Debugger from "@dynamico/utils/debugger";

import DynamicoManager from "@dynamico/managers/dynamico";

import { ManagerCacheBase } from "@internal/bases/manager-cache-base";

export class MasterChannelManager extends ManagerCacheBase<any> {
    private static instance: MasterChannelManager;

    private debugger: Debugger;

    public static getName(): string {
        return "Dynamico/Managers/MasterChannel";
    }

    public static getInstance(): MasterChannelManager {
        if ( ! MasterChannelManager.instance ) {
            MasterChannelManager.instance = new MasterChannelManager();
        }

        return MasterChannelManager.instance;
    }

    public constructor( shouldDebugCache = DynamicoManager.isDebugOn( "CACHE", MasterChannelManager.getName() ) ) {
        super( shouldDebugCache );

        this.debugger = new Debugger( this );
    }

    /**
     * Function onJoinMasterCreateChannel() :: Called when a user joins the master channel(➕ New Channel).
     */
    public async onJoinMasterCreateChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName, oldState, newState } = args,
            { guild } = newState;

        this.logger.info( this.onJoinMasterCreateChannel,
            `User '${ displayName }' joined master channel '${ channelName }' guildId: '${ guild.id }'` );

        if ( ! newState.channel ) {
            this.logger.error( this.onJoinMasterCreateChannel,
                `Could not find channel '${ channelName }'` );

            return;
        }

        // Check if bot exist in administrator role.
        if ( ! permissionsManager.isSelfAdministratorRole( guild ) ) {
            // Get permissions of master channel.
            const roleMasterChannelPermissions: bigint[] = [];

            if ( newState.channel ) {
                for ( const permission of newState.channel.permissionOverwrites.cache.values() ) {
                    const bitfield = permission.allow.bitfield;

                    // Push allow or deny permissions.
                    if ( OverwriteType.Role === permission.type ) {
                        roleMasterChannelPermissions.push( bitfield );
                    }
                }
            }

            const missingPermissionsChannelLevel = permissionsManager.getMissingPermissions(
                    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS.allow,
                    newState.channel
                ),
                missingPermissionsRoleLevel = permissionsManager.getMissingPermissions(
                    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
                    newState.channel.guild
                ),
                missingPermissionsRoleMasterChannelLevel = permissionsManager.getMissingPermissions(
                    roleMasterChannelPermissions,
                    newState.channel.guild,
                ), missingPermissions = [
                    ... missingPermissionsChannelLevel,
                    ... missingPermissionsRoleLevel,
                    ... missingPermissionsRoleMasterChannelLevel,
                ];

            // TODO: Fully refactor, it does add denied channel permissions to the missing permissions, if they not exist in the role permissions.
            const userOrRoles = newState.channel.permissionOverwrites.cache,
                missingPermissionsAdditional: any = {};

            for ( const userOrRole of userOrRoles.values() ) {
                const requiredPermissionsField = new PermissionsBitField( userOrRole.deny.bitfield === 0n ? userOrRole.allow.bitfield : userOrRole.deny.bitfield ),
                    requirePermissionArray = requiredPermissionsField.toArray();

                requirePermissionArray.forEach( ( permission ) => {
                    missingPermissionsAdditional[ permission ] = true;
                } );
            }

            // Dynamico leaking permissions on the role level.
            if ( missingPermissionsRoleLevel.length ) {
                this.logger.admin( this.onJoinMasterCreateChannel,
                    `🔒 Dynamico missing permissions - "${ missingPermissionsRoleLevel.join( ", " ) }" (${ guild.name })`
                );
            }

            if ( missingPermissionsChannelLevel.length ) {
                this.logger.admin( this.onJoinMasterCreateChannel,
                    `🔒 Master Channel missing permissions - "${ missingPermissionsChannelLevel.join( ", " ) }" (${ guild.name })`
                );
            }

            // Find all roles that has bot member.
            for ( const role of newState.guild.roles.cache.values() ) {
                if ( role.members.has( dynamicoManager.getClient()?.user?.id || "" ) ) {
                    const rolePermissions = role.permissions.toArray();

                    rolePermissions.forEach( ( permission ) => {
                        delete missingPermissionsAdditional[ permission ];
                    } );
                }
            }

            missingPermissions.push( ... Object.keys( missingPermissionsAdditional ) );

            if ( missingPermissions.length ) {
                this.logger.warn( this.onJoinMasterCreateChannel,
                    `User '${ displayName }' connected to master channel '${ channelName }' but is missing permissions, guildId: '${ guild.id }'` );

                const uniqueMissingPermissions = [ ... new Set( missingPermissions ) ];

                const message = await guiManager.get( "Dynamico/UI/NotifyPermissions" )
                    .getMessage( newState.channel, {
                        permissions: uniqueMissingPermissions,
                        botName: newState.guild.client.user.username,
                    } );

                // Send DM message to the user with missing permissions.
                if ( newState.member?.id ) {
                    await dmManager.sendToUser( newState.member.id, message );
                }

                return;
            }
        }

        try {
            // Create a new dynamic channel for the user.
            const dynamicChannel = await this.createDynamic( { displayName, guild, oldState, newState, } ),
                message = await guiManager
                    .get( "Dynamico/UI/EditDynamicChannel" )
                    .getMessage( newState.channel as NonThreadGuildBasedChannel ); // TODO: Remove `as`.

            message.content = "<@" + newState.member?.id + ">";

            await dynamicChannel?.send( message );
        } catch ( e ) {
            this.logger.error( this.onJoinMasterCreateChannel,
                `Failed to create dynamic channel for user '${ displayName }'` );

            this.logger.error( this.onJoinMasterCreateChannel, "", e );
        }
    }

    // TODO Where is onJoinDynamicChannel()?
    /**
     * onLeaveDynamicChannel() :: Called when a user leaves a dynamic channel.
     */
    public async onLeaveDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info( this.onLeaveDynamicChannel,
            `User '${ displayName }' left dynamic channel '${ channelName }' guildId: '${ guild.id }'` );

        // If the channel is empty, delete it.
        if ( args.oldState.channel?.members.size === 0 ) {
            this.logger.admin( this.onLeaveDynamicChannel,
                `➖ Dynamic channel has been deleted - "${ oldState.channel?.name }" (${ guild.name })`
            );

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
     * Function getByDynamicChannel() :: Returns the master channel by the guildID & dynamic channel id.
     */
    public async getByDynamicChannelId( guildId: string, dynamicChannelId: string, cache: boolean = false, interaction: Interaction | null = null ): Promise<VoiceChannel | void> {
        this.logger.log( this.getByDynamicChannelId, `guildId: '${ guildId }', dynamic channel id: '${ dynamicChannelId }', cache: '${ cache }'` );

        if ( cache ) {
            const cached = this.getCache( `getByDynamicChannel-${ dynamicChannelId }` );

            if ( cached ) {
                return cached;
            }
        }

        const dynamicChannelDB = await channelManager.getChannel( guildId, dynamicChannelId, true );

        if ( ! dynamicChannelDB ) {
            this.logger.error( this.getByDynamicChannel,
                `Could not find dynamic channel in database, guildId: '${ guildId }', channelId: '${ dynamicChannelId }'` );

            if ( interaction ) {
                await guiManager.get( "Dynamico/UI/NotifyMasterChannelNotExist" )
                    .sendContinues( interaction as SelectMenuInteraction, {} );
            }

            return;
        }

        if ( ! dynamicChannelDB.ownerChannelId ) {
            this.logger.error( this.getByDynamicChannel,
                `Could not find master channel in database, guildId: '${ guildId }', dynamic channelId: '${ dynamicChannelId }'` );

            if ( interaction ) {
                await guiManager.get( "Dynamico/UI/NotifyMasterChannelNotExist" )
                    .sendContinues( interaction as SelectMenuInteraction, {} );
            }

            return;
        }

        let masterChannel,
            guild = await dynamicoManager.getClient()?.guilds.cache.get( guildId ),
            masterChannelPromise = guild?.channels.fetch( dynamicChannelDB.ownerChannelId );

        const promise = new Promise( ( resolve ) => {
            masterChannelPromise?.catch( ( e ) => {
                this.logger.error( this.getByDynamicChannel,
                    `Could not fetch master channel, guildId: '${ guildId }', dynamic channelId: '${ dynamicChannelId }'` );
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
                `Could not find master channel, guildId: '${ guildId }', dynamic channelId: '${ dynamicChannelId }'` );

            if ( interaction ) {
                await guiManager.get( "Dynamico/UI/NotifyMasterChannelNotExist" )
                    .sendContinues( interaction as SelectMenuInteraction, {} );
            }

            return;
        }

        // Set cache, anyway.
        this.setCache( `getByDynamicChannel-${ dynamicChannelId }`, masterChannel );

        return masterChannel;
    }

    /**
     * Function getByDynamicChannel() :: Returns the master channel by the dynamic channel according the interaction.
     */
    public async getByDynamicChannel( interaction: Interaction, cache: boolean = false ) {
        this.logger.info( this.getByDynamicChannel, `Interaction: '${ interaction.id }', cache: '${ cache }', guildId: '${ interaction.guildId }'` );

        if ( ChannelType.GuildVoice !== interaction.channel?.type || ! interaction.guildId || ! interaction.channelId ) {
            this.logger.error( this.getByDynamicChannel,
                `Interaction is not a voice channel, interaction: '${ interaction.id }'` );
            return;
        }

        return this.getByDynamicChannelId( interaction.guildId, interaction.channelId, cache, interaction );
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

        const dynamicChannelTemplateName = await masterChannelGetDynamicChannelNameTemplate( masterChannelDB.id );

        if ( ! dynamicChannelTemplateName ) {
            this.logger.error( this.createDynamic,
                `Could not find master channel data in database, guildId: ${ guild.id }, master channelId: ${ masterChannel.id }` );
            return;
        }

        const dynamicChannelName = dynamicChannelTemplateName.replace(
            DEFAULT_DATA_USER_DYNAMIC_CHANNEL_TEMPLATE,
            displayName
        );

        this.logger.info( this.createDynamic,
            `Creating dynamic channel '${ dynamicChannelName }' for user '${ displayName }' ownerId: '${ userOwnerId }' guildId: '${ guild.id }'` );

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
        const { channel } = await channelManager.create( {
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

        this.logger.admin( this.createDynamic,
            `➕  Dynamic channel has been created - "${ dynamicChannelName }" (${ guild.name })`
        );

        // Move the user to new created channel.
        await newState.setChannel( channel.id );

        return channel;
    }

    /**
     * Function createDefaultMasters() :: Creates a default master channel(s) for a guild, part of setup process.
     */
    public async createDefaultMasters( interaction: CommandInteraction, userOwnerId: string, extraArgs: IMasterChannelCreateDefaultMasters = {} ) {
        const guild = interaction.guild as Guild;

        let masterCategory;
        try {
            masterCategory = await this.createMasterCategory( guild );
        } catch ( e ) {
            this.logger.warn( this.createDefaultMasters, "", e );
        }

        if ( masterCategory ) {
            extraArgs.badwords = badwordsNormalizeArray( extraArgs.badwords );

            this.debugger.dumpDown( this.createDefaultMasters, extraArgs, "extraArgs" );

            const args = {
                    guild,
                    userOwnerId,
                    parent: masterCategory,
                    ... extraArgs,
                },
                masterCreateChannel = await this.createCreateChannel( args );

            return {
                masterCategory,
                masterCreateChannel,
            };
        }

        await guiManager.get( "Dynamico/UI/GlobalResponse" )
            .sendContinues( interaction, {
                globalResponse: uiUtilsWrapAsTemplate( "somethingWentWrong" ),
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
            `Creating master channel for guild '${ guild.name }', guildId: '${ guild.id }', ownerId: '${ args.guild.ownerId }'` );

        this.debugger.log( this.createCreateChannel, "badwords", args.badwords );

        const outOfBoxPermissionsOverwrites = [ {
            id: guild.client.user.id,
            ... DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS,
        }, {
            id: guild.roles.everyone,
            ... DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
        } ];

        const result = await channelManager.create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: args.name || DEFAULT_MASTER_CHANNEL_CREATE_NAME,
            type: ChannelType.GuildVoice,
            permissionOverwrites: outOfBoxPermissionsOverwrites,
        } );

        // TODO In future, we should use hooks for this. `Commands.on( "channelCreate", ( channel ) => {} );`.

        await masterChannelSetSettingsData( result.channelDB.id, {
            dynamicChannelNameTemplate: args.dynamicChannelNameTemplate || DEFAULT_DATA_DYNAMIC_CHANNEL_NAME,
        } );

        await guildSetBadwords( guild, args.badwords );

        return result.channel;
    }

    /**
     * Function checkLimit() :: Validates if the guild has reached the master channel limit.
     */
    public async checkLimit( interaction: CommandInteraction, guildId: string ) {
        const limit = ( await guildGetSettings( guildId ) ).maxMasterChannels,
            hasReachedLimit = await ChannelModel.getInstance().isReachedMasterLimit( guildId, limit );

        if ( hasReachedLimit ) {
            this.debugger.log( this.checkLimit, `guildId: '${ guildId }' has reached master limit: '${ limit }'` );

            this.logger.admin( this.checkLimit,
                `💰 Master Channels Limitation function has been activated max(${ limit }) (${ interaction.guild?.name })`
            );

            await guiManager.get( "Dynamico/UI/NotifyMaxMasterChannels" )
                .sendContinues( interaction, { maxFreeMasterChannels: limit } );
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
