import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import {
    CategoryChannel,
    ChannelType,
    Guild,
    GuildChannel,
    OverwriteType,
    PermissionsBitField,
    VoiceBasedChannel,
    VoiceChannel,
} from "discord.js";

import { IChannelEnterGenericArgs, } from "../interfaces/channel";

import {
    DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    DEFAULT_MASTER_CATEGORY_NAME,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_NAME,
    DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS,
    DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS,
    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE,
} from "@vertix/definitions/master-channel";

import { CategoryModel } from "@vertix/models/category";
import { ChannelModel, ChannelResult } from "@vertix/models/channel";

import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";
import { AppManager } from "@vertix/managers/app-manager";
import { CategoryManager } from "@vertix/managers/category-manager";
import { ChannelDataManager } from "@vertix/managers/channel-data-manager";
import { ChannelManager } from "@vertix/managers/channel-manager";
import { DynamicChannelManager } from "@vertix/managers/dynamic-channel-manager";
import { GuildDataManager } from "@vertix/managers/guild-data-manager";
import { PermissionsManager } from "@vertix/managers/permissions-manager";

import {
    DynamicChannelElementsGroup
} from "@vertix/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { Debugger } from "@internal/modules/debugger";
import { InitializeBase } from "@internal/bases/initialize-base";

interface IMasterChannelCreateCommonArgs {
    userOwnerId: string,

    dynamicChannelNameTemplate?: string,
    dynamicChannelButtonsTemplate?: number[],
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

export class MasterChannelManager extends InitializeBase {
    private static instance: MasterChannelManager;

    private debugger: Debugger;

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

        this.debugger = new Debugger( this, "", AppManager.isDebugOn( "MANAGER", MasterChannelManager.getName() ) );
    }

    public async onJoinMasterChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName, oldState, newState } = args,
            { guild } = newState;

        this.logger.info( this.onJoinMasterChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' joined master channel: '${ channelName }'` );

        if ( ! newState.channel ) {
            this.logger.error( this.onJoinMasterChannel, `Could not find channel: '${ channelName }'` );

            return;
        }

        // Check if bot exist in administrator role.
        if ( ! PermissionsManager.$.isSelfAdministratorRole( guild ) ) {
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

            const missingPermissionsChannelLevel = PermissionsManager.$.getMissingPermissions(
                    DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS.allow,
                    newState.channel
                ),
                missingPermissionsRoleLevel = PermissionsManager.$.getMissingPermissions(
                    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS.allow,
                    newState.channel.guild
                ),
                missingPermissionsRoleMasterChannelLevel = PermissionsManager.$.getMissingPermissions(
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

            // Vertix leaking permissions on the role level.
            if ( missingPermissionsRoleLevel.length ) {
                this.logger.admin( this.onJoinMasterChannel,
                    `🔐 Vertix missing permissions - "${ missingPermissionsRoleLevel.join( ", " ) }" (${ guild.name }) (${ guild.memberCount })`
                );
            }

            if ( missingPermissionsChannelLevel.length ) {
                this.logger.admin( this.onJoinMasterChannel,
                    `🔐 Master Channel missing permissions - "${ missingPermissionsChannelLevel.join( ", " ) }" (${ guild.name }) (${ guild.memberCount })`
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

    public async getChannelNameTemplate( ownerId: string, returnDefault?: boolean ) {
        const result = await ChannelDataManager.$.getSettingsData(
                ownerId,
                returnDefault ? DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS : null,
                true
            ),
            name = result?.object?.[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ];

        this.debugger.dumpDown( this.getChannelNameTemplate,
            result,
            `ownerId: '${ ownerId }' returnDefault:'${ returnDefault }' - Result: `
        );

        return name;
    }

    public async getChannelButtonsTemplate( ownerId: string, returnDefault?: boolean ) {
        const result = await ChannelDataManager.$.getSettingsData(
                ownerId,
                returnDefault ? DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS : null,
                true
            ),
            buttons = result?.object?.[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ]
                .map( ( button: string ) => parseInt( button ) );

        this.debugger.dumpDown( this.getChannelButtonsTemplate,
            buttons,
            `ownerId: '${ ownerId }' returnDefault: '${ returnDefault }' - buttons: `
        );

        return buttons;
    }

    public async createMasterChannel( args: IMasterChannelCreateArgs ) {
        const result: IMasterChannelCreateResult = {
            code: MasterChannelCreateResultCode.Error,
        };

        if ( ! await this.checkLimit( args.guildId ) ) {
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

    public async checkLimit( guildId: string ) {
        const limit = ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
            hasReachedLimit = await this.isReachedMasterLimit( guildId, limit );

        if ( hasReachedLimit ) {
            this.debugger.log( this.checkLimit, `Guild id: '${ guildId }' - Has reached master limit: '${ limit }'` );

            const guild = AppManager.$.getClient().guilds.cache.get( guildId ) ||
                await AppManager.$.getClient().guilds.fetch( guildId );

            this.logger.admin( this.checkLimit,
                `💰 Master Channels Limitation function has been activated max(${ limit }) (${ guild?.name }) (${ guild?.memberCount })`
            );
        }

        return ! hasReachedLimit;
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Guild id: '${ guild.id }' - Removing leftovers of guild '${ guild.name }'` );

        // TODO Relations are deleted automatically??
        await CategoryModel.$.delete( guild.id );
        await ChannelModel.$.delete( guild.id );
    }

    public async isReachedMasterLimit( guildId: string, limit = DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS ) {
        return await ChannelModel.$.getTypeCount( guildId, E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL ) >= limit;
    }

    public async setChannelNameTemplate( ownerId: string, newName: string ) {
        this.logger.log( this.setChannelNameTemplate,
            `Master channel id: '${ ownerId }' - Setting channel name template: '${ newName }'`
        );

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ]: newName
        } );
    }

    public async setChannelButtonsTemplate( ownerId: string, newButtons: number[], shouldAdminLog = true ) {
        this.logger.log( this.setChannelButtonsTemplate,
            `Master channel id: '${ ownerId }' - Setting channel name template: '${ newButtons }'`
        );

        if ( shouldAdminLog ) {
            const previousButtons = await this.getChannelButtonsTemplate( ownerId, true ),
                previousUsedEmojis = await DynamicChannelElementsGroup.getUsedEmojis( previousButtons ),
                newUsedEmojis = await DynamicChannelElementsGroup.getUsedEmojis( newButtons );

            this.logger.admin( this.setChannelButtonsTemplate,
                `🎚  Dynamic Channel buttons modified  - ownerId: "${ ownerId }", "${ previousUsedEmojis }" => "${ newUsedEmojis }"`
            );
        }

        await ChannelDataManager.$.setSettingsData( ownerId, {
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ]: newButtons
        } );
    }

    /**
     * Function createMasterChannel() :: Creates channel master of create.
     */
    private async createMasterChannelInternal( args: IMasterChannelCreateInternalArgs ) {
        const { guild, parent } = args;

        this.logger.info( this.createMasterChannelInternal,
            `Guild id: '${ guild.id }' - Creating master channel for guild: '${ guild.name }' ownerId: '${ args.guild.ownerId }'` );

        const outOfBoxPermissionsOverwrites = [ {
            id: guild.client.user.id,
            ... DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS,
        }, {
            id: guild.roles.everyone,
            ... DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
        } ];

        const result = await ChannelManager.$.create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: DEFAULT_MASTER_CHANNEL_CREATE_NAME,
            type: ChannelType.GuildVoice,
            permissionOverwrites: outOfBoxPermissionsOverwrites,
        } );

        if ( ! result ) {
            await parent.delete( "Cannot create master channel" );
            return null;
        }

        // TODO In future, we should use hooks for this. `Commands.on( "channelCreate", ( channel ) => {} );`.
        const newName = args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ] ||
                DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
            newButtons = args[ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ] ||
                DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE;

        await ChannelDataManager.$.setSettingsData( result.db.id, {
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ]: newName,
            [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ]: newButtons
        } );

        // TODO: Duplicate code.
        const usedButtons = DynamicChannelElementsGroup.getAllItems().filter( ( item ) => {
                return newButtons.includes( item.getId() );
            } ),
            usedEmojis = ( await DynamicChannelElementsGroup.getUsedEmojis(
                usedButtons.map( ( item ) => item.getId()
                ) ) ).join( "," );

        this.logger.admin( this.createMasterChannelInternal,
            `🛠️  Setup has performed - "${ newName }", "${ usedEmojis }" (${ guild.name }) (${ guild?.memberCount })`
        );

        return result;
    }
}
