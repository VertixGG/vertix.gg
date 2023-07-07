import { E_INTERNAL_CHANNEL_TYPES } from "@vertix-base-prisma-bot";

import {
    CategoryChannel,
    ChannelType,
    EmbedBuilder,
    Guild,
    GuildChannel,
    OverwriteType,
    PermissionsBitField,
    VoiceBasedChannel,
    VoiceChannel,
} from "discord.js";

import { Debugger } from "@vertix-base/modules/debugger";
import { InitializeBase } from "@vertix-base/bases/initialize-base";

import { isDebugOn } from "@vertix-base/utils/debug";

import { GuildDataManager } from "@vertix-base/managers/guild-data-manager";

import { DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA } from "@vertix-base/definitions/dynamic-channel-defaults";

import {
    DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE, DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE,
    DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    DEFAULT_MASTER_CATEGORY_NAME,
    DEFAULT_MASTER_CHANNEL_CREATE_NAME
} from "@vertix-base/definitions/master-channel-defaults";

import { ChannelModel, ChannelResult } from "@vertix-base/models/channel-model";

import { ChannelDataManager } from "@vertix-base/managers/channel-data-manager";

import {
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES
} from "@vertix-base/definitions/master-channel-data-keys";

import { IChannelEnterGenericArgs, } from "../interfaces/channel";
import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS,
} from "@vertix/definitions/master-channel";

import { CategoryModel } from "@vertix/models/category-model";

import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";
import { AppManager } from "@vertix/managers/app-manager";
import { CategoryManager } from "@vertix/managers/category-manager";

import { ChannelManager } from "@vertix/managers/channel-manager";
import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";
import { PermissionsManager } from "@vertix/managers/permissions-manager";

import {
    DynamicChannelElementsGroup
} from "@vertix/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

interface IMasterChannelCreateCommonArgs {
    userOwnerId: string,

    dynamicChannelNameTemplate?: string,
    dynamicChannelButtonsTemplate?: number[],
    dynamicChannelMentionable?: boolean,
    dynamicChannelVerifiedRoles?: string[],
}

interface IMasterChannelCreateInternalArgs extends IMasterChannelCreateCommonArgs {
    parent: CategoryChannel,
    guild: Guild,
}

interface IMasterChannelCreateArgs extends IMasterChannelCreateCommonArgs {
    guildId: string,
}

enum MasterChannelCreateResultCode {
    Error = 0,
    Success = "success",
    CannotCreateCategory = "cannot-create-category",
    LimitReached = "limit-reached",
}

interface IMasterChannelCreateResult {
    code: MasterChannelCreateResultCode,

    maxMasterChannels?: number,

    category?: CategoryChannel,
    channel?: VoiceBasedChannel,
    db?: ChannelResult,
}

const MAX_TIMEOUT_PER_CREATE = /* 1 minute */ 40 * 1000;

export class MasterChannelManager extends InitializeBase {
    private static instance: MasterChannelManager;

    private debugger: Debugger;

    private requestedChannelMap: Map<string, {
        timestamp: number,
        tryCount: number,
        shouldSentWarning: boolean,
    }> = new Map();

    public static getName(): string {
        return "Vertix/Managers/MasterChannel";
    }

    public static getInstance(): MasterChannelManager {
        if ( ! MasterChannelManager.instance ) {
            MasterChannelManager.instance = new MasterChannelManager();
        }

        return MasterChannelManager.instance;
    }

    public static get $() {
        return MasterChannelManager.getInstance();
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugOn( "MANAGER", MasterChannelManager.getName() ) );
    }

    public async onJoinMasterChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName, oldState, newState } = args,
            { guild } = newState;

        this.logger.info( this.onJoinMasterChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' joined master channel id: '${ newState.channelId }'` );

        if ( ! newState.channel ) {
            this.logger.error( this.onJoinMasterChannel, `Could not find channel id: '${ newState.channelId }'` );

            return;
        }

        if ( ! newState.member ) {
            this.logger.error( this.onJoinMasterChannel, `Could not find member channel id: '${ newState.channelId }'` );

            return;
        }

        const member = newState.member,
            request = this.requestedChannelMap.get( member.id ),
            timestamp = Date.now(),
            timePassed = timestamp - ( request?.timestamp || 0 ),
            tooFast = timePassed < MAX_TIMEOUT_PER_CREATE;

        let tryCount = request?.tryCount || 0;

        if ( tryCount > 1 && tooFast ) {
            this.logger.warn( this.onJoinMasterChannel,
                `Guild id: '${ guild.id }' - User '${ displayName }' request master channel id: '${ newState.channelId }' too fast, try count: ${ request?.tryCount }` );

            if ( true === request?.shouldSentWarning ) {
                const embed = new EmbedBuilder();

                embed.setColor( "Yellow" );
                embed.setTitle( "Warning" );
                embed.setDescription( `You are requesting channel too fast. You can create new channels each \`${ MAX_TIMEOUT_PER_CREATE / 1000 }\` seconds.` );

                await newState.member.send( { embeds: [ embed ] } ).catch( () => {
                    this.logger.error( this.onJoinMasterChannel,
                        `Guild id: '${ guild.id }' - User '${ displayName }' could not send warning message` );
                } ).then( () => {
                    this.requestedChannelMap.set( member.id, {
                        timestamp,
                        shouldSentWarning: false,
                        tryCount: tryCount + 1,
                    } );
                } );
            }

            return;
        }

        // Set new timestamp.
        this.requestedChannelMap.set( newState.member.id, {
            timestamp,
            shouldSentWarning: true,
            tryCount: tooFast ? ( tryCount + 1 ) : 1,
        } );

        // Check if bot exists in the administrator role.
        if ( ! PermissionsManager.$.isSelfAdministratorRole( guild ) ) {
            // Get permissions of a master channel.
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

            const missingPermissionsRoleLevel = PermissionsManager.$.getMissingPermissions(
                    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
                    newState.channel.guild
                ),
                missingPermissionsRoleMasterChannelLevel = PermissionsManager.$.getMissingPermissions(
                    roleMasterChannelPermissions,
                    newState.channel.guild,
                ), missingPermissions = [
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

            // Vertix leaking permissions on the role level.
            if ( missingPermissionsRoleLevel.length ) {
                this.logger.admin( this.onJoinMasterChannel,
                    `🔐 Vertix missing permissions - "${ missingPermissionsRoleLevel.join( ", " ) }" (${ guild.name }) (${ guild.memberCount })`
                );
            }

            // Find all roles that has bot member.
            for ( const role of newState.guild.roles.cache.values() ) {
                if ( role.members.has( AppManager.$.getClient().user?.id || "" ) ) {
                    const rolePermissions = role.permissions.toArray();

                    rolePermissions.forEach( ( permission ) => {
                        delete missingPermissionsAdditional[ permission ];
                    } );
                }
            }

            missingPermissions.push( ... Object.keys( missingPermissionsAdditional ) );

            if ( missingPermissions.length ) {
                this.logger.warn( this.onJoinMasterChannel,
                    `Guild id: '${ guild.id }' - User '${ displayName }' connected to master channel name: '${ channelName }' but is missing permissions`
                );

                const uniqueMissingPermissions = [ ... new Set( missingPermissions ) ];

                // Send DM message to the user with missing permissions.
                if ( newState.member?.id ) {
                    const missingPermissionsAdapter = await UIAdapterManager.$.get( "Vertix/UI-V2/MissingPermissionsAdapter" );

                    if ( ! missingPermissionsAdapter ) {
                        this.logger.error( this.onJoinMasterChannel,
                            `Guild id: '${ guild.id }' - Failed to get missing permissions adapter` );

                        return;
                    }

                    await missingPermissionsAdapter.sendToUser( newState.guild.id, newState.member?.id || "", {
                        missingPermissions: uniqueMissingPermissions,
                        omitterDisplayName: newState.guild.client.user.username,
                    } );
                }

                return;
            }
        }

        try {
            // Create a new dynamic channel for the user.
            const dynamic = await DynamicChannelManager.$.createDynamicChannel( {
                displayName,
                guild,
                oldState,
                newState,
            } );

            if ( ! dynamic ) {
                this.logger.error( this.onJoinMasterChannel,
                    `Guild id: '${ guild.id }' - Failed to create dynamic channel for user: '${ displayName }'` );
                return;
            }
        } catch ( e ) {
            this.logger.error( this.onJoinMasterChannel,
                `Guild id: '${ guild.id }' - Failed to create dynamic channel for user: '${ displayName }'` );

            this.logger.error( this.onJoinMasterChannel, "", e );
        }
    }

    public async onDeleteMasterChannel( channel: VoiceBasedChannel ) {
        this.logger.info( this.onDeleteMasterChannel,
            `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Master channel was deleted: '${ channel.name }'` );

        this.logger.admin( this.onDeleteMasterChannel,
            `➖  Master channel has been deleted - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild.memberCount })`
        );

        const dynamicChannelsDB = await ChannelModel.$.getDynamicsByMasterId( channel.guildId, channel.id );

        for ( const dynamicChannelDB of dynamicChannelsDB ) {
            const dynamicChannel = channel.guild.channels.cache.get( dynamicChannelDB.channelId );

            if ( ! dynamicChannel ) {
                this.logger.error( this.onDeleteMasterChannel,
                    `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Could not find dynamic channel: '${ dynamicChannelDB.channelId }'` );

                continue;
            }

            await ChannelManager.$.delete( {
                guild: channel.guild,
                channel: dynamicChannel as GuildChannel,
            } );
        }

        await ChannelModel.$.delete( channel.guildId, channel.id );
    }

    public getChannelDefaultInheritedProperties( masterChannel: VoiceBasedChannel ) {
        const { rtcRegion, bitrate, userLimit } = masterChannel,
            result: any = { bitrate, userLimit };

        if ( rtcRegion !== null ) {
            result.rtcRegion = rtcRegion;
        }

        this.debugger.log( this.getChannelDefaultInheritedProperties, JSON.stringify( result ) );

        return result;
    }

    public getChannelDefaultInheritedPermissions( masterChannel: VoiceBasedChannel ) {
        const { permissionOverwrites } = masterChannel,
            result = [];

        for ( const overwrite of permissionOverwrites.cache.values() ) {
            let { id, allow, deny, type } = overwrite;

            // Exclude `PermissionsBitField.Flags.SendMessages` for everyone.
            if ( id === masterChannel.guild.id ) {
                deny = deny.remove( PermissionsBitField.Flags.SendMessages );
            }

            this.debugger.debugPermission( this.getChannelDefaultInheritedPermissions, overwrite );

            result.push( { id, allow, deny, type } );
        }

        return result;
    }

    public getChannelDefaultInheritedPermissionsWithUser( masterChannel: VoiceBasedChannel, userId: string ) {
        const inheritedPermissions = this.getChannelDefaultInheritedPermissions( masterChannel );

        return [
            ... inheritedPermissions,
            {
                id: userId,
                ... DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
            }
        ];
    }

    public getChannelDefaultProperties( userId: string, masterChannel: VoiceBasedChannel ) {
        const inheritedProperties = this.getChannelDefaultInheritedProperties( masterChannel ),
            inheritedPermissions = this.getChannelDefaultInheritedPermissionsWithUser( masterChannel, userId );

        return {
            ... inheritedProperties,
            permissionOverwrites: inheritedPermissions,
        };
    }

    public async createMasterChannel( args: IMasterChannelCreateArgs ) {
        const result: IMasterChannelCreateResult = {
            code: MasterChannelCreateResultCode.Error,
        };

        if ( await this.isReachedMasterLimit( args.guildId ) ) {
            result.code = MasterChannelCreateResultCode.LimitReached;
            result.maxMasterChannels = ( await GuildDataManager.$.getAllSettings( args.guildId ) ).maxMasterChannels;

            return result;
        }

        const guild = AppManager.$.getClient().guilds.cache.get( args.guildId ) ||
            await AppManager.$.getClient().guilds.fetch( args.guildId );

        this.logger.info( this.createMasterChannel,
            `Guild id: '${ guild.id }' - User id: '${ args.userOwnerId }' is creating a default master channel`
        );

        const masterCategory = await this.createDefaultMasterCategory( guild )
            .catch( ( e ) => {
                this.logger.error( this.createMasterChannel, "", e );
            } );

        if ( ! masterCategory ) {
            result.code = MasterChannelCreateResultCode.CannotCreateCategory;
            return result;
        }

        this.debugger.dumpDown( this.createMasterChannel, {
            dynamicChannelNameTemplate: args.dynamicChannelNameTemplate,
            dynamicChannelButtonsTemplate: args.dynamicChannelButtonsTemplate,
            dynamicChannelMentionable: args.dynamicChannelMentionable,
            dynamicChannelVerifiedRoles: args.dynamicChannelVerifiedRoles,
        }, "options" );

        const master = await this.createMasterChannelInternal( {
            ... args,
            guild,
            parent: masterCategory,
        } );

        if ( ! master ) {
            return result;
        }

        result.code = MasterChannelCreateResultCode.Success;
        result.category = masterCategory;
        result.channel = master.channel as unknown as VoiceChannel;
        result.db = master.db;

        return result;
    }

    public async createDefaultMasterCategory( guild: Guild ) {
        return CategoryManager.$.create( {
            guild,
            name: DEFAULT_MASTER_CATEGORY_NAME,
        } );
    }

    public async isReachedMasterLimit( guildId: string, definedLimit?: number ) {
        const limit = "number" === typeof definedLimit ?
                definedLimit : ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
            hasReachedLimit =
                await ChannelModel.$.getTypeCount( guildId, E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL ) >= limit;

        if ( hasReachedLimit ) {
            this.debugger.log( this.isReachedMasterLimit, `Guild id: '${ guildId }' - Has reached master limit: '${ limit }'` );

            const guild = AppManager.$.getClient().guilds.cache.get( guildId ) ||
                await AppManager.$.getClient().guilds.fetch( guildId );

            this.logger.admin( this.isReachedMasterLimit,
                `💰 Master Channels limitation function has been activated max(${ limit }) (${ guild?.name }) (${ guild?.memberCount })`
            );
        }

        return hasReachedLimit;
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Guild id: '${ guild.id }' - Removing leftovers of guild '${ guild.name }'` );

        // TODO Relations are deleted automatically??
        // TODO: They should be deleted only when they not exist.
        await CategoryModel.$.delete( guild.id );
        await ChannelModel.$.delete( guild.id );
    }

    /**
     * Function createMasterChannel() :: Creates channel master of create.
     */
    private async createMasterChannelInternal( args: IMasterChannelCreateInternalArgs ) {
        const { guild, parent } = args;

        this.logger.info( this.createMasterChannelInternal,
            `Guild id: '${ guild.id }' - Creating master channel for guild: '${ guild.name }' ownerId: '${ args.guild.ownerId }'` );

        // TODO In future, we should use hooks for this. `Commands.on( "channelCreate", ( channel ) => {} );`.
        const newName = args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ] ||
                DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
            newButtons = args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ] ||
                DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
            newMentionable = typeof args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ] === "boolean" ?
                args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ] : DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE,
            newVerifiedRoles = args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ] || [
                guild.roles.everyone.id
            ];

        const verifiedRolesWithPermissions = newVerifiedRoles.map( ( roleId ) => ( {
            id: roleId,
            ... DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
        } ) );

        const result = await ChannelManager.$.create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: DEFAULT_MASTER_CHANNEL_CREATE_NAME,
            type: ChannelType.GuildVoice,
            permissionOverwrites: verifiedRolesWithPermissions,
        } );

        if ( ! result ) {
            await parent.delete( "Cannot create master channel" );
            return null;
        }

        await ChannelDataManager.$.setSettingsData( result.db.id, {
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ]: newName,
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ]: newButtons,
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ]: newMentionable,
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ]: newVerifiedRoles,
        } );

        // TODO: Duplicate code.
        const usedButtons = DynamicChannelElementsGroup.getAllItems().filter( ( item ) => {
                return newButtons.includes( item.getId() );
            } ),
            usedEmojis = DEFAULT_DYNAMIC_CHANNEL_BUTTONS_INTERFACE_SCHEMA.getUsedEmojis(
                usedButtons.map( ( item ) => item.getId()
                ) ).join( "," ),
            usedRoles = newVerifiedRoles.map( ( roleId ) => {
                if ( roleId === guild.roles.everyone.id ) {
                    return "@everyone";
                }

                return guild.roles.cache.get( roleId )?.name || roleId;
            } ).join( "," );

        this.logger.admin( this.createMasterChannelInternal,
            `🛠️  Setup has performed - "${ newName }", "${ usedEmojis }", "${ usedRoles }" (${ guild.name }) (${ guild?.memberCount })`
        );

        return result;
    }
}
