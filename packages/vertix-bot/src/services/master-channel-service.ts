import "@vertix.gg/prisma/bot-client";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import {
    ChannelType,
    EmbedBuilder,
    OverwriteType,
    PermissionsBitField
} from "discord.js";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { ChannelDataManager } from "@vertix.gg/base/src/managers/channel-data-manager";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { ChannelModel } from "@vertix.gg/base/src/models/channel-model";

import {
    DynamicChannelElementsGroup
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
} from "@vertix.gg/bot/src/definitions/master-channel";

import { CategoryModel } from "@vertix.gg/bot/src/models/category-model";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import type UIService from "@vertix.gg/gui/src/ui-service";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";

import type { IChannelEnterGenericArgs, } from "@vertix.gg/bot/src/interfaces/channel";
import type { ChannelResult } from "@vertix.gg/base/src/models/channel-model";

import type {
    MasterChannelConfigInterface,
    MasterChannelDataInterface
} from "@vertix.gg/base/src/interfaces/master-channel-config";

import type {
    CategoryChannel,
    Guild,
    GuildChannel,
    VoiceBasedChannel,
    VoiceChannel
} from "discord.js";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

interface IMasterChannelCreateCommonArgs extends Partial<MasterChannelDataInterface> {
    userOwnerId: string,
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

const MAX_TIMEOUT_PER_CREATE = 10 * 1000;

export class MasterChannelService extends ServiceWithDependenciesBase<{
    appService: AppService,
    uiService: UIService,
    channelService: ChannelService,
    dynamicChannelService: DynamicChannelService,
}> {
    private debugger: Debugger;

    private config = ConfigManager.$
        .get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", "0.0.2" as const );

    private requestedChannelMap: Map<string, {
        timestamp: number,
        tryCount: number,
        shouldSentWarning: boolean,
    }> = new Map();

    public static getName(): string {
        return "VertixBot/Services/MasterChannel";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", MasterChannelService.getName() ) );

        EventBus.$.on( "VertixBot/Services/Channel",
            "onChannelGuildVoiceDelete",
            this.onChannelGuildVoiceDelete.bind( this )
        );

        EventBus.$.on( "VertixBot/Services/Channel",
            "onJoin",
            this.onJoin.bind( this )
        );
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            uiService: "VertixGUI/UIService",
            channelService: "VertixBot/Services/Channel",
            dynamicChannelService: "VertixBot/Services/DynamicChannel",
        };
    }

    public async onJoinMasterChannel( args: IChannelEnterGenericArgs ) {
        const { displayName, channelName, oldState, newState } = { ... args },
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
                if ( role.members.has( this.services.appService.getClient().user?.id || "" ) ) {
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
                    const missingPermissionsAdapter = this.services
                        .uiService.get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" );

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
            const dynamic = await this.services.dynamicChannelService.createDynamicChannel( {
                username: newState.member.user.username,
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

            await this.services.channelService.delete( {
                guild: channel.guild,
                channel: dynamicChannel as GuildChannel,
            } );
        }

        const where = {
            guildId: channel.guildId,
            channelId: channel.id,
        };

        await ChannelModel.$.delete( where,
            ( cached ) => ChannelDataManager.$.removeFromCache( cached.id )
        );
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

        const guild = this.services.appService.getClient().guilds.cache.get( args.guildId ) ||
            await this.services.appService.getClient().guilds.fetch( args.guildId );

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

        this.debugger.dumpDown( this.createMasterChannel, args, "args" );

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
        result.db = await master.db;

        return result;
    }

    public async createDefaultMasterCategory( guild: Guild ) {
        return CategoryManager.$.create( {
            guild,
            name: this.config.data.masterChannelDefaults.dynamicChannelsCategoryName,
        } );
    }

    public async isReachedMasterLimit( guildId: string, definedLimit?: number ) {
        const limit = "number" === typeof definedLimit ?
                definedLimit : ( await GuildDataManager.$.getAllSettings( guildId ) ).maxMasterChannels,
            hasReachedLimit =
                await ChannelModel.$.getTypeCount( guildId, PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL ) >= limit;

        if ( hasReachedLimit ) {
            this.debugger.log( this.isReachedMasterLimit, `Guild id: '${ guildId }' - Has reached master limit: '${ limit }'` );

            const guild = this.services.appService.getClient().guilds.cache.get( guildId ) ||
                await this.services.appService.getClient().guilds.fetch( guildId );

            this.logger.admin( this.isReachedMasterLimit,
                `💰 Master Channels limitation function has been activated max(${ limit }) (${ guild?.name }) (${ guild?.memberCount })`
            );
        }

        return hasReachedLimit;
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Guild id: '${ guild.id }' - Removing leftovers of guild '${ guild.name }'` );

        await CategoryModel.$.delete( guild.id );

        await ChannelModel.$.delete( { guildId: guild.id },
            ( cached ) => ChannelDataManager.$.removeFromCache( cached.id )
        );
    }

    /**
     * Function createMasterChannel() :: Creates channel master of create.
     */
    private async createMasterChannelInternal( args: IMasterChannelCreateInternalArgs ) {
        const { guild, parent } = args;

        this.logger.info( this.createMasterChannelInternal,
            `Guild id: '${ guild.id }' - Creating master channel for guild: '${ guild.name }' ownerId: '${ args.guild.ownerId }'` );

        const { masterChannelData } = this.config.data,
            { masterChannelDefaults } = this.config.data;

        const newName = args.dynamicChannelNameTemplate || masterChannelData.dynamicChannelNameTemplate,
            newButtons = args.dynamicChannelButtonsTemplate || masterChannelData.dynamicChannelButtonsTemplate,

            newMentionable = typeof args.dynamicChannelMentionable === "boolean" ?
                args.dynamicChannelMentionable : masterChannelData.dynamicChannelMentionable,

            newAutoSave = typeof args.dynamicChannelAutoSave === "boolean" ?
                args.dynamicChannelAutoSave : masterChannelData.dynamicChannelAutoSave,

            newVerifiedRoles = args.dynamicChannelVerifiedRoles || [
                guild.roles.everyone.id
            ];

        const verifiedRolesWithPermissions = newVerifiedRoles.map( ( roleId ) => ( {
            id: roleId,
            ... DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
        } ) );

        const result = await this.services.channelService.create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: masterChannelDefaults.masterChannelName,
            type: ChannelType.GuildVoice,
            permissionOverwrites: verifiedRolesWithPermissions,
            rtcRegion: "us-west",
        } );

        if ( ! result ) {
            await parent.delete( "Cannot create master channel" );
            return null;
        }

        const masterChannelDB = await result.db;

        await MasterChannelDataManager.$.setAllSettings( masterChannelDB.id, {
            dynamicChannelAutoSave: newAutoSave,
            dynamicChannelButtonsTemplate: newButtons,
            // Since `LogsChannelId` not defined in the creation process, but later via configuration.
            dynamicChannelLogsChannelId: masterChannelData.dynamicChannelLogsChannelId,
            dynamicChannelMentionable: newMentionable,
            dynamicChannelNameTemplate: newName,
            dynamicChannelVerifiedRoles: newVerifiedRoles,
        } );

        // TODO: Duplicate code.
        const usedButtons = DynamicChannelElementsGroup.getAll().filter( ( item ) => {
                return newButtons.includes( item.getId() );
            } ),
            usedEmojis = ( DynamicChannelElementsGroup.getEmbedEmojis(
                usedButtons.map( ( item ) => item.getId()
                )) ).join( "," ),
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
