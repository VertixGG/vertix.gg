import "@vertix.gg/prisma/bot-client";
import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";

import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { MasterChannelDataModelV3 } from "@vertix.gg/base/src/models/master-channel/master-channel-data-model-v3";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ChannelType, EmbedBuilder, OverwriteType, PermissionsBitField } from "discord.js";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";

import { DynamicChannelElementsGroup } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_VERIFIED_ROLES_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS,
    DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS
} from "@vertix.gg/bot/src/definitions/master-channel";

import { CategoryModel } from "@vertix.gg/bot/src/models/category-model";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { ChannelUtils } from "@vertix.gg/bot/src/utils/channel-utils";

import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import type { TVersionType } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

import type UIService from "@vertix.gg/gui/src/ui-service";
import type { UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";

import type { IChannelEnterGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type {
    MasterChannelConfigInterface,
    MasterChannelConfigInterfaceV3,
    MasterChannelSettingsInterface
} from "@vertix.gg/base/src/interfaces/master-channel-config";

import type {
    CategoryChannel,
    Guild,
    GuildChannel,
    OverwriteResolvable,
    VoiceBasedChannel,
    VoiceChannel
} from "discord.js";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

interface IMasterChannelCreateCommonArgs extends Partial<MasterChannelSettingsInterface> {
    version: TVersionType;
    userOwnerId: string;
    dynamicChannelControlChannelAutoCreate?: boolean;
}

interface IMasterChannelCreateInternalArgs extends IMasterChannelCreateCommonArgs {
    parent: CategoryChannel;
    guild: Guild;
}

interface IMasterChannelCreateArgs extends IMasterChannelCreateCommonArgs {
    guildId: string;
}

enum MasterChannelCreateResultCode {
    Error = 0,
    Success = "success",
    CannotCreateCategory = "cannot-create-category",
    LimitReached = "limit-reached"
}

interface IMasterChannelCreateResult {
    code: MasterChannelCreateResultCode;

    maxMasterChannels?: number;

    category?: CategoryChannel;
    channel?: VoiceBasedChannel;
    db?: ChannelExtended;
}

const MAX_TIMEOUT_PER_CREATE = 10 * 1000;

interface ICreateControlChannelArgs {
    parent: CategoryChannel;
    guild: Guild;
    version: TVersionType;
    userOwnerId: string;
    masterChannel: GuildChannel;
    controlChannelName: string;
    buttonsTemplate: string[];
    verifiedRoles: string[];
}

interface ICreateControlChannelResult {
    channelId: string;
    channel: UIAdapterStartContext;
}

interface IUpdateControlChannelArgs {
    guildId: string;
    masterChannelId: string;
    version: TVersionType;
    enable: boolean;
}

export class MasterChannelService extends ServiceWithDependenciesBase<{
    appService: AppService;
    uiService: UIService;
    channelService: ChannelService;
    dynamicChannelService: DynamicChannelService;
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
            dynamicChannelService: "VertixBot/Services/DynamicChannel"
        };
    }

    /**
     * Function getAudiencePermissions() :: The overwrites that scope a channel to its audience.
     *
     * `@everyone` is granted sight only while it is itself the audience, and denied outright
     * otherwise - dropping the grant alone would leave it inheriting from the server, which on an
     * ordinary server still means everyone. A role allow outranks the `@everyone` deny in discord's
     * resolution, so the audience still gets through, and so do the owner, trusted users and the
     * bot through their member overwrites.
     */
    private getAudiencePermissions( guild: Guild, verifiedRoles: string[] ): OverwriteResolvable[] {
        const everyoneRoleId = guild.roles.everyone.id,
            isEveryoneAudience = verifiedRoles.includes( everyoneRoleId );

        return [
            {
                id: everyoneRoleId,
                allow: isEveryoneAudience ? [ PermissionsBitField.Flags.ViewChannel ] : [],
                deny: isEveryoneAudience ? [] : [ PermissionsBitField.Flags.ViewChannel ]
            },
            {
                id: guild.client.user.id,
                ...DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS
            },
            ...verifiedRoles
                .filter( ( roleId ) => roleId !== everyoneRoleId )
                .map( ( roleId ) => ( {
                    id: roleId,
                    allow: [ PermissionsBitField.Flags.ViewChannel ],
                    type: OverwriteType.Role
                } ) )
        ];
    }

    private async createControlChannelWithPanel(
        args: ICreateControlChannelArgs
    ): Promise<ICreateControlChannelResult | null> {
        const {
            parent, guild, version, userOwnerId, masterChannel, controlChannelName, buttonsTemplate, verifiedRoles
        } = args;

        const targetPosition = masterChannel.position + 1;

        const everyoneRoleId = guild.roles.everyone.id;

        // The panel is read only, and it is shown to the same audience as the channels it drives.
        //
        // `@everyone` used to be granted `ViewChannel` outright, which on a server that hides its
        // channels from it overrode that lockdown and leaked the panel to everyone. It now gets the
        // grant only when it is itself the audience. The deny list stays on `@everyone` so it
        // reaches every role, verified or not - none of them are granted those permissions back.
        const controlPanelPermissions = [
            {
                id: everyoneRoleId,
                allow: verifiedRoles.includes( everyoneRoleId ) ? PermissionsBitField.Flags.ViewChannel : 0n,
                // Dropping the allow only makes `@everyone` inherit `ViewChannel` from the server,
                // which on an ordinary server still shows the panel to everyone. A narrower
                // audience has to be a deny.
                deny: ( verifiedRoles.includes( everyoneRoleId ) ? 0n : PermissionsBitField.Flags.ViewChannel ) |
                    PermissionsBitField.Flags.SendMessages |
                    PermissionsBitField.Flags.SendMessagesInThreads |
                    PermissionsBitField.Flags.CreatePublicThreads |
                    PermissionsBitField.Flags.CreatePrivateThreads |
                    PermissionsBitField.Flags.AddReactions |
                    PermissionsBitField.Flags.EmbedLinks |
                    PermissionsBitField.Flags.AttachFiles |
                    PermissionsBitField.Flags.UseExternalEmojis |
                    PermissionsBitField.Flags.UseExternalStickers |
                    PermissionsBitField.Flags.ManageMessages |
                    PermissionsBitField.Flags.ManageThreads |
                    PermissionsBitField.Flags.SendTTSMessages |
                    PermissionsBitField.Flags.SendVoiceMessages |
                    PermissionsBitField.Flags.SendPolls
            },
            {
                id: guild.client.user.id,
                ...DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS
            },
            ...verifiedRoles
                .filter( ( roleId ) => roleId !== everyoneRoleId )
                .map( ( roleId ) => ( {
                    id: roleId,
                    allow: PermissionsBitField.Flags.ViewChannel,
                    type: OverwriteType.Role
                } ) )
        ];

        const controlChannelResult = await this.services.channelService.create( {
            parent,
            guild,
            version,
            userOwnerId,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DEFAULT_CHANNEL,
            ownerChannelId: masterChannel.id,
            name: controlChannelName,
            type: ChannelType.GuildText,
            position: targetPosition,
            permissionOverwrites: controlPanelPermissions
        } );

        if ( !controlChannelResult ) {
            return null;
        }

        const panelAdapterName = version === VERSION_UI_V3
            ? "VertixBot/UI-V3/DynamicChannelPanelAdapter"
            : "VertixBot/UI-V2/DynamicChannelPanelAdapter";

        const panelAdapter = this.services.uiService.get( panelAdapterName );

        if ( panelAdapter ) {
            await panelAdapter.send( controlChannelResult.channel, {
                dynamicChannelButtonsTemplate: buttonsTemplate,
                channelId: ""
            } );
        }

        return {
            channelId: controlChannelResult.channel.id,
            channel: controlChannelResult.channel
        };
    }

    public async updateControlChannel( args: IUpdateControlChannelArgs ): Promise<string | null> {
        const guild = await ChannelUtils.cacheOrFetchGuild( args.guildId );

        if ( !guild ) {
            return null;
        }

        const masterChannel = await ChannelUtils.cacheOrFetchChannel( guild, args.masterChannelId );

        if ( !masterChannel || masterChannel.type !== ChannelType.GuildVoice ) {
            return null;
        }

        const masterChannelDB = await ChannelModel.$.getByChannelId( args.masterChannelId );

        if ( !masterChannelDB ) {
            return null;
        }

        const settings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB );
        const controlChannelId = settings.dynamicChannelControlChannelId ?? null;

        if ( !args.enable ) {
            if ( controlChannelId ) {
                const controlChannel = await ChannelUtils.cacheOrFetchChannel( guild, controlChannelId );

                if ( controlChannel && "deletable" in controlChannel ) {
                    await this.services.channelService.delete( {
                        guild,
                        channel: controlChannel as GuildChannel
                    } );
                }
            }

            await MasterChannelDataManager.$.setChannelControlChannel( masterChannelDB, null );

            return null;
        }

        if ( controlChannelId ) {
            const existing = await ChannelUtils.cacheOrFetchChannel( guild, controlChannelId );

            if ( existing ) {
                return controlChannelId;
            }
        }

        const config =
            args.version === VERSION_UI_V3
                ? ConfigManager.$.get<MasterChannelConfigInterfaceV3>( "Vertix/Config/MasterChannel", VERSION_UI_V3 )
                : ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 );

        const constants = args.version === VERSION_UI_V3 ? config.get( "constants" ) : config.data.constants;
        const defaultSettings = args.version === VERSION_UI_V3 ? config.get( "settings" ) : config.data.settings;

        const buttonsTemplate = settings.dynamicChannelButtonsTemplate || defaultSettings.dynamicChannelButtonsTemplate;

        const parent = masterChannel.parent;

        if ( !parent || parent.type !== ChannelType.GuildCategory ) {
            return null;
        }

        const controlChannelResult = await this.createControlChannelWithPanel( {
            parent,
            guild,
            version: args.version,
            userOwnerId: masterChannelDB.userOwnerId,
            masterChannel: masterChannel as GuildChannel,
            controlChannelName: constants.dynamicChannelControlChannelName,
            buttonsTemplate,
            verifiedRoles: await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, guild.id )
        } );

        if ( !controlChannelResult ) {
            return null;
        }

        await MasterChannelDataManager.$.setChannelControlChannel( masterChannelDB, controlChannelResult.channelId );

        return controlChannelResult.channelId;
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

        const masterChannelDB = await ChannelModel.$.getByChannelId( newState.channelId );

        if ( !masterChannelDB ) {
            this.logger.error( this.onJoinMasterChannel, `Master channel DB not found for id: '${ newState.channelId }'` );
            return;
        }

        const member = newState.member,
            request = this.requestedChannelMap.get( member.id ),
            timestamp = Date.now(),
            timePassed = timestamp - ( request?.timestamp || 0 ),
            tooFast = timePassed < MAX_TIMEOUT_PER_CREATE;

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
                    `You are requesting channel too fast. You can create new channels each \`${ MAX_TIMEOUT_PER_CREATE / 1000 }\` seconds.`
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
        } catch( e ) {
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

        const masterChannelDB = await ChannelModel.$.getByChannelId( channel.id );

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

        if ( masterChannelDB ) {
            const where = {
                channelId: channel.id
            };

            await ChannelModel.$.delete( where );
        }
    }

    public async createMasterChannel( args: IMasterChannelCreateArgs ) {
        const result: IMasterChannelCreateResult = {
            code: MasterChannelCreateResultCode.Error
        };

        if ( await this.isReachedMasterLimit( args.guildId ) ) {
            result.code = MasterChannelCreateResultCode.LimitReached;
            result.maxMasterChannels = ( await GuildDataManager.$.getAllSettings( args.guildId ) ).maxMasterChannels;

            return result;
        }

        const guild = await ChannelUtils.cacheOrFetchGuild( args.guildId );

        if ( !guild ) {
            return result;
        }

        this.logger.info(
            this.createMasterChannel,
            `Guild id: '${ guild.id }' - User id: '${ args.userOwnerId }' is creating a default master channel`
        );

        const config = ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", args.version );

        const masterCategory = await CategoryManager.$.create( {
            guild,
            name: config.data.constants.dynamicChannelsCategoryName,
            permissionOverwrites: this.getAudiencePermissions(
                guild,
                args.dynamicChannelVerifiedRoles || [ guild.roles.everyone.id ]
            )
        } ).catch( ( e ) => {
            this.logger.error( this.createMasterChannel, "", e );
        } );

        if ( !masterCategory ) {
            result.code = MasterChannelCreateResultCode.CannotCreateCategory;
            return result;
        }

        this.debugger.dumpDown( this.createMasterChannel, args, "args" );

        const master = await this.createMasterChannelInternal( {
            ...args,
            guild,
            parent: masterCategory
        } );

        if ( !master ) {
            return result;
        }

        result.code = MasterChannelCreateResultCode.Success;
        result.category = masterCategory;
        result.channel = master.channel as unknown as VoiceChannel;
        result.db = await master.db;

        return result;
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

            const guild = await ChannelUtils.cacheOrFetchGuild( guildId );

            this.logger.admin(
                this.isReachedMasterLimit,
                `💰 Master Channels limitation function has been activated max(${ limit }) (${ guild?.name }) (${ guild?.memberCount })`
            );
        }

        return hasReachedLimit;
    }

    public async removeLeftOvers( guild: Guild ) {
        this.logger.info( this.removeLeftOvers, `Guild id: '${ guild.id }' - Removing leftovers of guild '${ guild.name }'` );

        await CategoryModel.$.delete( guild.id );

        await ChannelModel.$.deleteMany( { guildId: guild.id } );
    }

    /**
     * Function `createMasterChannelInternal()` - Creates a master channel for the guild.
     */
    private async createMasterChannelInternal( args: IMasterChannelCreateInternalArgs ) {
        let result;

        const { parent, guild } = args;

        this.logger.info(
            this.createMasterChannelInternal,
            `Guild id: '${ guild.id }' - Creating master channel for guild: '${ guild.name }' ownerId: '${ args.guild.ownerId }' version: '${ args.version }'`
        );

        switch ( args.version ) {
            case VERSION_UI_V3:
                result = await this.createMasterChannelInternalV3( args );
                break;
            default:
                result = await this.createMasterChannelInternalLegacy( args );
        }

        if ( !result ) {
            await parent.delete( "Cannot create master channel" );
        }

        return result;
    }

    private async createMasterChannelInternalV3( args: IMasterChannelCreateInternalArgs ) {
        const config = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
            "Vertix/Config/MasterChannel",
            VERSION_UI_V3
        );

        const constants = config.get( "constants" );

        const settings = config.get( "settings" );

        const { parent, guild } = args;

        const newVerifiedRoles = args.dynamicChannelVerifiedRoles || [ guild.roles.everyone.id ];

        // The master channel is a generator, not a place to chat, so its text chat is closed for
        // `@everyone`, the bot is granted what it needs to run the channel, and each verified role
        // is granted the reach its dynamic channels are built on.
        //
        // The chat lock belongs to `@everyone` alone. Spreading it over the verified roles left
        // `@everyone` free to chat here whenever a custom role was picked, and the deny was
        // inherited by every dynamic channel, silencing the audience in their own channels.
        const isEveryoneAudience = newVerifiedRoles.includes( guild.roles.everyone.id );

        const masterChannelPermissions = [
            {
                id: guild.roles.everyone.id,
                ...DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
                // An audience narrower than `@everyone` keeps `@everyone` out of the generator too,
                // otherwise anyone could join it and spawn a channel they cannot even see.
                deny: isEveryoneAudience
                    ? DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS.deny
                    : [
                        ...DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS.deny,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.Connect
                    ]
            },
            {
                id: guild.client.user.id,
                ...DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS
            },
            ...newVerifiedRoles.map( ( roleId ) => ( {
                id: roleId,
                ...DEFAULT_MASTER_CHANNEL_CREATE_VERIFIED_ROLES_PERMISSIONS
            } ) )
        ];

        const result = await this.services.channelService.create( {
            parent,
            guild,
            userOwnerId: args.userOwnerId,
            version: args.version,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: constants.masterChannelName,
            type: ChannelType.GuildVoice,
            permissionOverwrites: masterChannelPermissions,
            // TODO: Should be configurable.
            rtcRegion: "us-west"
        } );

        if ( !result ) {
            return null;
        }

        const masterChannel = result.channel;

        const rawControlChannelId = typeof args.dynamicChannelControlChannelId === "string"
            ? args.dynamicChannelControlChannelId
            : null;

        let controlChannelId = rawControlChannelId ?? settings.dynamicChannelControlChannelId;

        if ( args.dynamicChannelControlChannelAutoCreate ) {
            const controlChannelResult = await this.createControlChannelWithPanel( {
                parent,
                guild,
                version: args.version,
                userOwnerId: args.userOwnerId,
                masterChannel,
                controlChannelName: constants.dynamicChannelControlChannelName,
                buttonsTemplate: args.dynamicChannelButtonsTemplate || settings.dynamicChannelButtonsTemplate,
                verifiedRoles: newVerifiedRoles
            } );

            if ( controlChannelResult ) {
                controlChannelId = controlChannelResult.channelId;
            }
        }

        const usedRoles = newVerifiedRoles
            .map( ( roleId ) => {
                if ( roleId === guild.roles.everyone.id ) {
                    return "@everyone";
                }

                return guild.roles.cache.get( roleId )?.name || roleId;
            } )
            .join( "," );

        const usedButtonsInterface = args.dynamicChannelButtonsTemplate || settings.dynamicChannelButtonsTemplate;

        const usedNameTemplate = args.dynamicChannelNameTemplate || settings.dynamicChannelNameTemplate;

        this.logger.admin(
            this.createMasterChannelInternalV3,
            `🛠️  Setup has performed - "${ usedNameTemplate }", "${ usedButtonsInterface.join( "," ) }", "${ usedRoles }" (${ guild.name }) (${ guild?.memberCount })`
        );

        const db = await result.db;

        await MasterChannelDataModelV3.$.setSettings( db.id, {
            ...args,
            dynamicChannelControlChannelId: controlChannelId
        }, true );

        return result;
    }

    private async createMasterChannelInternalLegacy( args: IMasterChannelCreateInternalArgs ) {
        const config = ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 );

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
            newControlChannelId = settings.dynamicChannelControlChannelId,
            newVerifiedRoles = args.dynamicChannelVerifiedRoles || [ guild.roles.everyone.id ];

        // The master channel is a generator, not a place to chat, so its text chat is closed for
        // `@everyone`, the bot is granted what it needs to run the channel, and each verified role
        // is granted the reach its dynamic channels are built on.
        //
        // The chat lock belongs to `@everyone` alone. Spreading it over the verified roles left
        // `@everyone` free to chat here whenever a custom role was picked, and the deny was
        // inherited by every dynamic channel, silencing the audience in their own channels.
        const isEveryoneAudience = newVerifiedRoles.includes( guild.roles.everyone.id );

        const masterChannelPermissions = [
            {
                id: guild.roles.everyone.id,
                ...DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS,
                // An audience narrower than `@everyone` keeps `@everyone` out of the generator too,
                // otherwise anyone could join it and spawn a channel they cannot even see.
                deny: isEveryoneAudience
                    ? DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS.deny
                    : [
                        ...DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS.deny,
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.Connect
                    ]
            },
            {
                id: guild.client.user.id,
                ...DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS
            },
            ...newVerifiedRoles.map( ( roleId ) => ( {
                id: roleId,
                ...DEFAULT_MASTER_CHANNEL_CREATE_VERIFIED_ROLES_PERMISSIONS
            } ) )
        ];

        const result = await this.services.channelService.create( {
            parent,
            guild,
            version: args.version,
            userOwnerId: args.userOwnerId,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            name: constants.masterChannelName,
            type: ChannelType.GuildVoice,
            permissionOverwrites: masterChannelPermissions,
            // TODO: Should be configurable.
            rtcRegion: "us-west"
        } );

        if ( !result ) {
            return null;
        }

        const masterChannel = result.channel;

        let controlChannelId = newControlChannelId;

        if ( args.dynamicChannelControlChannelAutoCreate ) {
            const controlChannelResult = await this.createControlChannelWithPanel( {
                parent,
                guild,
                version: args.version,
                userOwnerId: args.userOwnerId,
                masterChannel,
                controlChannelName: constants.dynamicChannelControlChannelName,
                buttonsTemplate: newButtons,
                verifiedRoles: newVerifiedRoles
            } );

            if ( controlChannelResult ) {
                controlChannelId = controlChannelResult.channelId;
            }
        }

        const masterChannelDB = await result.db;

        await MasterChannelDataManager.$.setAllSettings( masterChannelDB, {
            dynamicChannelAutoSave: newAutoSave,
            dynamicChannelButtonsTemplate: newButtons,
            dynamicChannelControlChannelId: controlChannelId,
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
