import "@vertix.gg/prisma/bot-client";
import { VERSION_UI_V2, VERSION_UI_V3, VERSION_UI_UNSPECIFIED } from "@vertix.gg/base/src/definitions/version";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import type { OverwriteResolvable, Guild, GuildChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { ChannelType, EmbedBuilder, OverwriteType, PermissionsBitField } from "discord.js";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import type {
    IMasterChannelCreateResult,
    TMasterChannelScalingCreateInternalArgs,
    TMasterChannelDynamicCreateInternalArgs,
    TMasterChannelCreateInternalArgs,
    TMasterChannelGenricCreateArgs
} from "@vertix.gg/base/src/definitions/master-channel";
import {
    EMasterChannelType,
    DEFAULT_MASTER_CHANNEL_MAX_TIMEOUT_PER_CREATE,
    EMasterChannelCreateResultCode
} from "@vertix.gg/base/src/definitions/master-channel";

import { MasterChannelDynamicDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-dynamic-data-model-v3";

import { MasterChannelScalingDataModel } from "@vertix.gg/base/src/models/master-channel/master-channel-scaling-data-model-v3";

import { MasterChannelDataDynamicManager } from "@vertix.gg/base/src/managers/master-channel-data-dynamic-manager";

import { clientChannelExtend } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
} from "@vertix.gg/bot/src/definitions/master-channel";

import { CategoryModel } from "@vertix.gg/bot/src/models/category-model";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import type UIService from "@vertix.gg/gui/src/ui-service";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";

import type { IChannelEnterGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type {
    MasterChannelDynamicConfig,
    MasterChannelDynamicConfigV3
} from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type MasterChannelScalingConfig from "@vertix.gg/bot/src/config/master-channel-scaling-config";
import type { ScalingChannelService } from "@vertix.gg/bot/src/services/scaling-channel-service";

export class MasterChannelService extends ServiceWithDependenciesBase<{
    appService: AppService;
    uiService: UIService;
    channelService: ChannelService;
    dynamicChannelService: DynamicChannelService;
    scalingChannelService: ScalingChannelService;
}> {
    private debugger: Debugger;

    private requestedChannelMap: Map<
        string,
        {
            timestamp: number;
            tryCount: number;
            shouldSentWarning: boolean;
        }
    > = new Map();

    public static getName(): string {
        return "VertixBot/Services/MasterChannel";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", MasterChannelService.getName() ) );

        EventBus.$.on(
            "VertixBot/Services/Channel",
            "onChannelGuildVoiceDelete",
            this.onChannelGuildVoiceDelete.bind( this )
        );

        EventBus.$.on( "VertixBot/Services/Channel", "onJoin", this.onJoin.bind( this ) );
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            uiService: "VertixGUI/UIService",
            channelService: "VertixBot/Services/Channel",
            dynamicChannelService: "VertixBot/Services/DynamicChannel",
            scalingChannelService: "VertixBot/Services/ScalingChannel"
        };
    }

    public async onJoinMasterChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName, oldState, newState } = { ...args },
            { guild } = newState;

        this.logger.info(
            this.onJoinMasterChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' joined master channel id: '${ newState.channelId }'`
        );

        if ( !newState.channel ) {
            this.logger.error( this.onJoinMasterChannel, `Could not find channel id: '${ newState.channelId }'` );

            return;
        }

        if ( !newState.member ) {
            this.logger.error( this.onJoinMasterChannel, `Could not find member channel id: '${ newState.channelId }'` );

            return;
        }

        const member = newState.member,
            request = this.requestedChannelMap.get( member.id ),
            timestamp = Date.now(),
            timePassed = timestamp - ( request?.timestamp || 0 ),
            tooFast = timePassed < DEFAULT_MASTER_CHANNEL_MAX_TIMEOUT_PER_CREATE;

        let tryCount = request?.tryCount || 0;

        if ( tryCount > 1 && tooFast ) {
            this.logger.warn(
                this.onJoinMasterChannel,
                `Guild id: '${ guild.id }' - User '${ displayName }' request master channel id: '${ newState.channelId }' too fast, try count: ${ request?.tryCount }`
            );

            if ( true === request?.shouldSentWarning ) {
                const embed = new EmbedBuilder();

                embed.setColor( "Yellow" );
                embed.setTitle( "Warning" );
                embed.setDescription(
                    `You are requesting channel too fast. You can create new channels each \`${ DEFAULT_MASTER_CHANNEL_MAX_TIMEOUT_PER_CREATE / 1000 }\` seconds.`
                );

                await newState.member
                    .send( { embeds: [ embed ] } )
                    .catch( () => {
                        this.logger.error(
                            this.onJoinMasterChannel,
                            `Guild id: '${ guild.id }' - User '${ displayName }' could not send warning message`
                        );
                    } )
                    .then( () => {
                        this.requestedChannelMap.set( member.id, {
                            timestamp,
                            shouldSentWarning: false,
                            tryCount: tryCount + 1
                        } );
                    } );
            }

            return;
        }

        // Set a new timestamp.
        this.requestedChannelMap.set( newState.member.id, {
            timestamp,
            shouldSentWarning: true,
            tryCount: tooFast ? tryCount + 1 : 1
        } );

        // Check if bot exists in the administrator role.
        if ( !PermissionsManager.$.isSelfAdministratorRole( guild ) ) {
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
                    newState.channel.guild
                ),
                missingPermissions = [ ...missingPermissionsRoleLevel, ...missingPermissionsRoleMasterChannelLevel ];

            // TODO: Fully refactor, it does add denied channel permissions to the missing permissions, if they not exist in the role permissions.
            const userOrRoles = newState.channel.permissionOverwrites.cache,
                missingPermissionsAdditional: any = {};

            for ( const userOrRole of userOrRoles.values() ) {
                const requiredPermissionsField = new PermissionsBitField(
                        userOrRole.deny.bitfield === 0n ? userOrRole.allow.bitfield : userOrRole.deny.bitfield
                    ),
                    requirePermissionArray = requiredPermissionsField.toArray();

                requirePermissionArray.forEach( ( permission ) => {
                    missingPermissionsAdditional[ permission ] = true;
                } );
            }

            // Vertix leaking permissions on the role level.
            if ( missingPermissionsRoleLevel.length ) {
                this.logger.admin(
                    this.onJoinMasterChannel,
                    `🔐 Vertix missing permissions - "${ missingPermissionsRoleLevel.join( ", " ) }" (${ guild.name }) (${ guild.memberCount })`
                );
            }

            // Find all roles that have bot member.
            for ( const role of newState.guild.roles.cache.values() ) {
                if ( role.members.has( this.services.appService.getClient().user?.id || "" ) ) {
                    const rolePermissions = role.permissions.toArray();

                    rolePermissions.forEach( ( permission ) => {
                        delete missingPermissionsAdditional[ permission ];
                    } );
                }
            }

            missingPermissions.push( ...Object.keys( missingPermissionsAdditional ) );

            if ( missingPermissions.length ) {
                this.logger.warn(
                    this.onJoinMasterChannel,
                    `Guild id: '${ guild.id }' - User '${ displayName }' connected to master channel name: '${ channelName }' but is missing permissions`
                );

                const uniqueMissingPermissions = [ ...new Set( missingPermissions ) ];

                // Send a DM message to the user with missing permissions.
                if ( newState.member?.id ) {
                    const missingPermissionsAdapter = this.services.uiService.get(
                        "VertixGUI/InternalAdapters/MissingPermissionsAdapter"
                    );

                    if ( !missingPermissionsAdapter ) {
                        this.logger.error(
                            this.onJoinMasterChannel,
                            `Guild id: '${ guild.id }' - Failed to get missing permissions adapter`
                        );

                        return;
                    }

                    await missingPermissionsAdapter.sendToUser( newState.guild.id, newState.member?.id || "", {
                        missingPermissions: uniqueMissingPermissions,
                        omitterDisplayName: newState.guild.client.user.username
                    } );
                }

                return;
            }
        }

        const masterChanelDB = await ChannelModel.$.getByChannelId( newState.channelId );

        if ( !masterChanelDB ) {
            this.logger.error(
                this.onJoinMasterChannel,
                `Guild id: '${ guild.id }' - Could not find master channel id: '${ newState.channelId }'`
            );
            return;
        }

        const masterChannelDataResult = await clientChannelExtend.channelData.findMany( {
            where: {
                ownerId: masterChanelDB.id,
            }
        } );

        if ( masterChannelDataResult.length > 1 || !masterChannelDataResult.length ) {
            this.logger.error(
                this.onJoinMasterChannel,
                `Guild id: '${ guild.id }' - Master Channel, discord id '${ newState.channelId }' data is malformed`
            );
            return;
        }

        const masterChannelData = masterChannelDataResult.at( 0 )!;

        const object = masterChannelData.object as any;

        if ( object.type === EMasterChannelType.AUTO_SCALING ) {
            this.logger.warn(
                this.onJoinMasterChannel,
                `Guild id: '${ guild.id }' - User '${ displayName }' connected to master channel name: '${ channelName }' 'EMasterChannelType.AUTO_SCALING'`
            )
            return;
        }

        try {
            // Create a new dynamic channel for the user.
            const dynamic = await this.services.dynamicChannelService.createDynamicChannel( {
                username: newState.member.user.username,
                displayName,
                guild,
                oldState,
                newState
            } );

            if ( !dynamic ) {
                this.logger.error(
                    this.onJoinMasterChannel,
                    `Guild id: '${ guild.id }' - Failed to create dynamic channel for user: '${ displayName }'`
                );
                return;
            }
        } catch ( e ) {
            this.logger.error(
                this.onJoinMasterChannel,
                `Guild id: '${ guild.id }' - Failed to create dynamic channel for user: '${ displayName }'`
            );

            this.logger.error( this.onJoinMasterChannel, "", e );
        }
    }

    public async onDeleteMasterChannel( channel: VoiceBasedChannel ) {
        this.logger.info(
            this.onDeleteMasterChannel,
            `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Master channel was deleted: '${ channel.name }'`
        );

        this.logger.admin(
            this.onDeleteMasterChannel,
            `➖  Master channel has been deleted - "${ channel.name }" (${ channel.guild.name }) (${ channel.guild.memberCount })`
        );

        const dynamicChannelsDB = await ChannelModel.$.getDynamicsByMasterId( channel.guildId, channel.id );

        for ( const dynamicChannelDB of dynamicChannelsDB ) {
            const dynamicChannel = channel.guild.channels.cache.get( dynamicChannelDB.channelId );

            if ( !dynamicChannel ) {
                this.logger.error(
                    this.onDeleteMasterChannel,
                    `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Could not find dynamic channel: '${ dynamicChannelDB.channelId }'`
                );

                continue;
            }

            await this.services.channelService.delete( {
                guild: channel.guild,
                channel: dynamicChannel as GuildChannel
            } );
        }

        const where = {
            channelId: channel.id
        };

        await ChannelModel.$.delete( where );
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Guild id: '${ guild.id }' - Removing leftovers of guild '${ guild.name }'` );

        await CategoryModel.$.delete( guild.id );

        await ChannelModel.$.deleteMany( { guildId: guild.id } );
    }

    public async isReachedMasterLimit( guildId: string, definedLimit?: number ) {
        const limit =
                "number" === typeof definedLimit
                    ? definedLimit
                    : ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
            hasReachedLimit =
                ( await ChannelModel.$.getTypeCount(
                    guildId,
                    PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL
                ) ) >= limit;

        if ( hasReachedLimit ) {
            this.debugger.log(
                this.isReachedMasterLimit,
                `Guild id: '${ guildId }' - Has reached master limit: '${ limit }'`
            );

            const guild =
                this.services.appService.getClient().guilds.cache.get( guildId ) ||
                ( await this.services.appService.getClient().guilds.fetch( guildId ) );

            this.logger.admin(
                this.isReachedMasterLimit,
                `💰 Master Channels limitation function has been activated max(${ limit }) (${ guild?.name }) (${ guild?.memberCount })`
            );
        }

        return hasReachedLimit;
    }

    public async createMasterChannel( args: TMasterChannelGenricCreateArgs ) {
        const result: IMasterChannelCreateResult = {
            code: EMasterChannelCreateResultCode.Error
        };

        if ( await this.isReachedMasterLimit( args.guildId ) ) {
            result.code = EMasterChannelCreateResultCode.LimitReached;
            result.maxMasterChannels = ( await GuildDataManager.$.getAllSettings( args.guildId ) ).maxMasterChannels;

            return result;
        }

        const guild =
            this.services.appService.getClient().guilds.cache.get( args.guildId ) ||
            ( await this.services.appService.getClient().guilds.fetch( args.guildId ) );

        this.logger.info(
            this.createMasterChannel,
            `Guild id: '${ guild.id }' - User id: '${ args.userOwnerId }' is creating a ${ args.type || "default" } master channel`
        );

        let masterCategory;

        this.debugger.dumpDown( this.createMasterChannel, args, "args" );

        const type = args.type;
        switch ( type ) {
            case EMasterChannelType.DYNAMIC:
                // For dynamic channels, create a new category
                const config = ConfigManager.$.get<MasterChannelDynamicConfig>( "Vertix/Config/MasterChannelDynamic", args.version );

                masterCategory = await CategoryManager.$.create( {
                    guild,
                    name: config.data.constants.dynamicChannelsCategoryName
                } ).catch( ( e ) => {
                    this.logger.error( this.createMasterChannel, "", e );
                } );

                if ( !masterCategory ) {
                    result.code = EMasterChannelCreateResultCode.CannotCreateCategory;
                    return result;
                }
                break;

            case EMasterChannelType.AUTO_SCALING:
                masterCategory = guild.channels.cache.get( args.scalingChannelCategoryId );

                if ( !masterCategory || masterCategory.type !== ChannelType.GuildCategory ) {
                    this.logger.error(
                        this.createMasterChannel,
                        `Guild id: '${ guild.id }' - Could not find category with ID: ${ args.scalingChannelCategoryId }`
                    );
                    result.code = EMasterChannelCreateResultCode.CannotCreateCategory;

                    return result;
                }
                break;

            default:
                this.logger.error( this.createMasterChannel, `Unknown master channel type: '${ type }'` );
        }

        const master = await this.createMasterChannelInternal( {
            ...args,

            guild,
            parent: masterCategory!,
        } );

        if ( !master ) {
            return result;
        }

        result.code = EMasterChannelCreateResultCode.Success;
        result.category = masterCategory;
        result.channel = master.channel as unknown as VoiceChannel;
        result.db = await master.db;

        return result;
    }

    /**
     * Function `createMasterChannelInternal()` - Creates a master channel for the guild.
     */
    private async createMasterChannelInternal( args: TMasterChannelCreateInternalArgs ) {
        let result;

        const { parent, guild } = args;

        this.logger.info(
            this.createMasterChannelInternal,
            `Guild id: '${ guild.id }' - Creating master channel for guild: '${ guild.name }' ownerId: '${ args.guild.ownerId }' version: '${ args.version }' type: '${ args.type }'`
        );

        switch ( args.type ) {
            case EMasterChannelType.AUTO_SCALING:
                result = await this.createAutoScalingMasterChannelInternal( args );
                break;

            case EMasterChannelType.DYNAMIC:
                switch ( args.version ) {
                    case VERSION_UI_V3:
                        result = await this.createMasterChannelInternalV3( args );
                        break;
                    default:
                        result = await this.createMasterChannelInternalLegacy( args );
                }
            default:
                break;
        }

        if ( !result ) {
            await parent.delete( "Cannot create master channel" );
        }

        return result;
    }

    private async createMasterChannelInternalV3( args: TMasterChannelDynamicCreateInternalArgs ) {
        const config = ConfigManager.$.get<MasterChannelDynamicConfigV3>(
            "Vertix/Config/MasterChannelDynamic",
            VERSION_UI_V3
        );

        const { parent, guild } = args;

        const newVerifiedRoles = args.dynamicChannelVerifiedRoles || [ guild.roles.everyone.id ];

        const verifiedRolesWithPermissions = newVerifiedRoles.map( ( roleId ) => ( {
            id: roleId,
            ...DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
        } ) );

        const result = await this.services.channelService.create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            version: args.version,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: config.get( "constants" ).masterChannelName,
            type: ChannelType.GuildVoice,
            permissionOverwrites: verifiedRolesWithPermissions,
            // TODO: Should be configurable.
            rtcRegion: "us-west"
        } );

        if ( !result ) {
            return null;
        }

        const usedRoles = newVerifiedRoles
            .map( ( roleId ) => {
                if ( roleId === guild.roles.everyone.id ) {
                    return "@everyone";
                }

                return guild.roles.cache.get( roleId )?.name || roleId;
            } )
            .join( "," );

        const usedButtonsInterface =
            args.dynamicChannelButtonsTemplate || config.get( "settings" ).dynamicChannelButtonsTemplate;

        const usedNameTemplate = args.dynamicChannelNameTemplate || config.get( "settings" ).dynamicChannelNameTemplate;

        this.logger.admin(
            this.createMasterChannelInternalV3,
            `🛠️  Setup has performed - "${ usedNameTemplate }", "${ usedButtonsInterface.join( "," ) }", "${ usedRoles }" (${ guild.name }) (${ guild?.memberCount })`
        );

        const db = await result.db;

        await MasterChannelDynamicDataModelV3.$.setSettings( db.id, args, true );

        return result;
    }

    private async createMasterChannelInternalLegacy( args: TMasterChannelDynamicCreateInternalArgs ) {
        const config = ConfigManager.$.get<MasterChannelDynamicConfig>( "Vertix/Config/MasterChannelDynamic", VERSION_UI_V2 );

        const { guild, parent } = args;

        const { settings, constants } = config.data;

        /**
         * The following block of code initializes various dynamic channel settings using
         * either provided arguments or defaults
         */
        const newName = args.dynamicChannelNameTemplate || settings.dynamicChannelNameTemplate,
            newButtons = args.dynamicChannelButtonsTemplate || settings.dynamicChannelButtonsTemplate,
            newMentionable =
                typeof args.dynamicChannelMentionable === "boolean"
                    ? args.dynamicChannelMentionable
                    : settings.dynamicChannelMentionable,
            newAutoSave =
                typeof args.dynamicChannelAutoSave === "boolean"
                    ? args.dynamicChannelAutoSave
                    : settings.dynamicChannelAutoSave,
            newVerifiedRoles = args.dynamicChannelVerifiedRoles || [ guild.roles.everyone.id ];

        const verifiedRolesWithPermissions = newVerifiedRoles.map( ( roleId ) => ( {
            id: roleId,
            ...DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
        } ) );

        const result = await this.services.channelService.create( {
            parent,
            guild,
            version: args.version,
            userOwnerId: args.userOwnerId,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: constants.masterChannelName,
            type: ChannelType.GuildVoice,
            permissionOverwrites: verifiedRolesWithPermissions,
            // TODO: Should be configurable.
            rtcRegion: "us-west"
        } );

        if ( !result ) {
            return null;
        }

        const masterChannelDB = await result.db;

        await MasterChannelDataDynamicManager.$.setAllSettings( masterChannelDB, {
            type: EMasterChannelType.DYNAMIC,

            dynamicChannelAutoSave: newAutoSave,
            dynamicChannelButtonsTemplate: newButtons,
            // Since `LogsChannelId` not defined in the creation process but later via configuration.
            dynamicChannelLogsChannelId: settings.dynamicChannelLogsChannelId,
            dynamicChannelMentionable: newMentionable,
            dynamicChannelNameTemplate: newName,
            dynamicChannelVerifiedRoles: newVerifiedRoles
        } );

        // TODO: Duplicate code.
        const usedButtons = DynamicChannelElementsGroup.getAll().filter( ( item ) => {
                return newButtons.includes( item.getId().toString() );
            } ),
            usedEmojis = DynamicChannelElementsGroup.getEmbedEmojis( usedButtons.map( ( item ) => item.getId() ) ).join( "," ),
            usedRoles = newVerifiedRoles
                .map( ( roleId ) => {
                    if ( roleId === guild.roles.everyone.id ) {
                        return "@everyone";
                    }

                    return guild.roles.cache.get( roleId )?.name || roleId;
                } )
                .join( "," );

        this.logger.admin(
            this.createMasterChannelInternalLegacy,
            `🛠️  Setup has performed - "${ newName }", "${ usedEmojis }", "${ usedRoles }" (${ guild.name }) (${ guild?.memberCount })`
        );

        return result;
    }

    private async createAutoScalingMasterChannelInternal( args: TMasterChannelScalingCreateInternalArgs ) {
        const config = ConfigManager.$.get<MasterChannelScalingConfig>(
            "Vertix/Config/MasterChannelScaling",
            VERSION_UI_UNSPECIFIED
        );

        const { parent, guild } = args;

        const permissionOverwrites: OverwriteResolvable[] = [
            {
                id: guild.roles.everyone.id,
                deny: [ PermissionsBitField.Flags.ViewChannel ],
            },
        ];

        guild.roles.cache.forEach( role => {
            if ( role.permissions.has( PermissionsBitField.Flags.Administrator ) ) {
                permissionOverwrites.push( {
                    id: role.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.Connect, // Allow admins to connect if needed for UI interaction
                        PermissionsBitField.Flags.ManageChannels, // Allow admins to manage the channel settings
                    ],
                } );
            }
        } );
        // We use a different name for auto-scaling master channels
        const channelName = config.get( "constants" ).masterChannelName;

        const result = await this.services.channelService.create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            version: args.version,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: channelName,
            type: ChannelType.GuildVoice,
            permissionOverwrites,
        } );

        if ( !result ) {
            return null;
        }

        this.logger.admin(
            this.createAutoScalingMasterChannelInternal,
            `🛠️  Auto-Scaling Setup has performed - prefix: "${ args.scalingChannelPrefix }: (${ guild.name }) (${ guild?.memberCount })`
        );

        const db = await result.db;

        const maxMembersPerChannel = args.scalingChannelMaxMembersPerChannel;
        const channelPrefix = args.scalingChannelPrefix;

        // Save the settings with additional auto-scaling specific fields
        await MasterChannelScalingDataModel.$.setSettings( db.id, {
            ...args,

            // Store auto-scaling specific settings
            scalingChannelMaxMembersPerChannel: maxMembersPerChannel,
            scalingChannelCategoryId: parent.id,
            scalingChannelPrefix: channelPrefix
        }, true );

        // Create an initial scaling channel directly
        try {
            await this.services.scalingChannelService["createScaledChannel"](
                guild,
                parent,
                db,
                channelPrefix,
                maxMembersPerChannel,
                1
            );

            this.logger.info(
                this.createAutoScalingMasterChannelInternal,
                `Guild id: '${guild.id}' - Initial scaling channel created for auto scaling master channel`
            );
        } catch (error) {
            this.logger.error(
                this.createAutoScalingMasterChannelInternal,
                `Guild id: '${guild.id}' - Failed to create initial scaling channel: ${error}`
            );
        }

        return result;
    }

    private async onJoin( args: IChannelEnterGenericArgs ) {
        const { newState } = args;

        if ( await ChannelModel.$.isMaster( newState.channelId! ) ) {
            await this.onJoinMasterChannel( args );
        }
    }

    private async onChannelGuildVoiceDelete( channel: VoiceBasedChannel ) {
        if ( await ChannelModel.$.isMaster( channel.id ) ) {
            await this.onDeleteMasterChannel( channel );
        }
    }

}

export default MasterChannelService;
