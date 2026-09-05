import "@vertix.gg/prisma/bot-client";

import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { ConfigManager } from "@vertix.gg/base/src/managers/config-manager";
import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { UserMasterChannelDataModel } from "@vertix.gg/base/src/models/data/user-master-channel-data-model";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { gToken } from "@vertix.gg/base/src/discord/login";

import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { MasterChannelDataManager } from "@vertix.gg/base/src/managers/master-channel-data-manager";

import { UserModel } from "@vertix.gg/base/src/models/user-model";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import pc from "picocolors";

import fetch from "cross-fetch";

import { Routes } from "discord-api-types/v10";

import { ChannelType, EmbedBuilder, OverwriteType, PermissionsBitField } from "discord.js";

import { varsHasIndexPlaceholder } from "@vertix.gg/base/src/utils/vars-utils";

import {
    VAR_DYNAMIC_CHANNEL_GAME,
    VAR_DYNAMIC_CHANNEL_INDEX,
    VAR_DYNAMIC_CHANNEL_STATE,
    VAR_DYNAMIC_CHANNEL_USER
} from "@vertix.gg/definitions/src/dynamic-channel-vars-definitions";

import { GuildCustomizationManager } from "@vertix.gg/bot/src/managers/guild-customization-manager";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import {
    DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
    DynamicClearChatResultCode,
    DynamicEditChannelNameInternalResultCode,
    DynamicEditChannelNameResultCode,
    DynamicEditChannelStateResultCode,
    DynamicResetChannelResultCode
} from "@vertix.gg/bot/src/definitions/dynamic-channel";

import {
    DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS,
    DEFAULT_MASTER_CHANNEL_STAFF_ROLES_PERMISSIONS,
    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
} from "@vertix.gg/bot/src/definitions/master-channel";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { guildGetMemberDisplayName } from "@vertix.gg/bot/src/utils/guild";

import type { ChannelExtended } from "@vertix.gg/base/src/models/channel/channel-client-extend";

import type { MasterChannelUserDataInterface } from "@vertix.gg/base/src/interfaces/master-channel-user-config";

import type { Snowflake } from "discord-api-types/v10";

import type {
    TDynamicChannelConfiguration,
    ChannelPrivacyState,
    ActStatus,
    AddStatus,
    ChannelState,
    ChannelVisibilityState,
    EditStatus,
    IDynamicChannelCreateArgs,
    IDynamicClearChatResult,
    IDynamicEditChannelNameInternalResult,
    IDynamicEditChannelNameResult,
    IDynamicEditChannelStateResult,
    IDynamicResetChannelResult,
    RemoveStatus
} from "@vertix.gg/bot/src/definitions/dynamic-channel";

import type { UIAdapterVersioningService } from "@vertix.gg/gui/src/ui-adapter-versioning-service";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type {
    APIPartialChannel,
    Client,
    Guild,
    GuildChannel,
    GuildMember,
    Interaction,
    Message,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    OverwriteResolvable,
    PermissionOverwriteOptions,
    RESTRateLimit,
    TextChannel,
    VoiceBasedChannel,
    VoiceChannel
} from "discord.js";

import type {
    MasterChannelConfigInterface,
    MasterChannelConfigInterfaceV3
} from "@vertix.gg/base/src/interfaces/master-channel-config";

import type { IChannelEnterGenericArgs, IChannelLeaveGenericArgs } from "@vertix.gg/bot/src/interfaces/channel";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { ChannelCleanupService } from "@vertix.gg/bot/src/services/channel-cleanup-service";

import type { GetDynamicChannelInfoResponse } from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

import type { IPCDiscordChannelInfo } from "@vertix.gg/definitions/src/ipc-definitions";

export class DynamicChannelService extends ServiceWithDependenciesBase<{
    appService: AppService;
    channelService: ChannelService;
    uiService: UIService;
    uiVersioningAdapterService: UIAdapterVersioningService;
    channelCleanupService: ChannelCleanupService;
}> {
    private readonly debugger: Debugger;

    private config = ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 );

    private configV3 = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
        "Vertix/Config/MasterChannel",
        VERSION_UI_V3
    );

    private editMessageDebounceMap = new Map<string, NodeJS.Timeout>();

    private logInChannelDebounceMap = new Map<
        string,
        {
            masterChannelDB: ChannelExtended;
            logsChannel: TextChannel;
            embeds: EmbedBuilder[];
            timer: NodeJS.Timeout;
        }
    >();

    public static getName() {
        return "VertixBot/Services/DynamicChannel";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", DynamicChannelService.getName() ) );

        // Register event handlers
        EventBus.$.on( "VertixBot/Services/Channel", "onJoin", this.onJoin.bind( this ) );
        EventBus.$.on( "VertixBot/Services/Channel", "onLeave", this.onLeave.bind( this ) );

        // Register methods that can be called directly through EventBus
        EventBus.$.register( this, [
            this.onOwnerJoinDynamicChannel,
            this.onOwnerLeaveDynamicChannel,
            this.onLeaveDynamicChannelEmpty,
            this.updateChannelOwnership
        ] );
    }

    /**
     * Handle update dynamic settings IPC action (called by ManagementIPCService)
     */
    public async handleUpdateDynamicSettings( data: {
        guildId: string;
        masterChannelId: string;
        settings: {
            dynamicChannelNameTemplate?: string;
            dynamicChannelAutoSave?: boolean;
            dynamicChannelMentionable?: boolean;
        };
    } ) {
        const { guildId, masterChannelId, settings } = data;

        this.logger.log(
            this.handleUpdateDynamicSettings,
            `Updating dynamic settings for master ${ masterChannelId } in guild ${ guildId }`
        );

        try {
            const masterChannelDB = await ChannelModel.$.getById( masterChannelId );

            if ( !masterChannelDB ) {
                this.logger.error( this.handleUpdateDynamicSettings, `Master channel not found: ${ masterChannelId }` );
                return;
            }

            // Update settings in the database
            if ( settings.dynamicChannelNameTemplate !== undefined ) {
                await MasterChannelDataManager.$.setChannelNameTemplate( masterChannelDB, settings.dynamicChannelNameTemplate );
            }

            if ( settings.dynamicChannelAutoSave !== undefined ) {
                await MasterChannelDataManager.$.setChannelAutoSave( masterChannelDB, settings.dynamicChannelAutoSave );
            }

            if ( settings.dynamicChannelMentionable !== undefined ) {
                await MasterChannelDataManager.$.setChannelMentionable( masterChannelDB, settings.dynamicChannelMentionable );
            }

            this.logger.log(
                this.handleUpdateDynamicSettings,
                `Successfully updated dynamic settings for master ${ masterChannelId }`
            );
        } catch( error ) {
            this.logger.error( this.handleUpdateDynamicSettings, `Failed to update dynamic settings for master ${ masterChannelId }`, error );
        }
    }

    /**
     * Handle delete dynamic setup IPC action (called by ManagementIPCService)
     */
    public async handleDeleteDynamicSetup( data: {
        guildId: string;
        masterChannelId: string;
    } ) {
        const { guildId, masterChannelId } = data;

        // masterChannelId from IPC is the database record ID, we need to get the Discord channel ID
        const masterChannelDB = await ChannelModel.$.getById( masterChannelId );

        if ( !masterChannelDB ) {
            this.logger.error( this.handleDeleteDynamicSetup, `Master channel DB not found: ${ masterChannelId }` );
            return;
        }

        this.logger.log(
            this.handleDeleteDynamicSetup,
            `Deleting dynamic setup for master ${ masterChannelDB.channelId } in guild ${ guildId }`
        );

        // Use channel cleanup service which handles:
        // - Deleting all dynamic channels
        // - Deleting the master channel
        // - Cleaning up empty category
        await this.services.channelCleanupService.deleteDynamicMasterChannelWithCleanup( {
            guildId,
            masterChannelId: masterChannelDB.channelId // Pass Discord channel ID
        } );
    }

    /**
     * Handle create dynamic setup IPC action (called by ManagementIPCService)
     */
    public async handleCreateDynamicSetup( data: {
        guildId: string;
        userOwnerId: string;
        version?: "v2" | "v3";
        nameTemplate?: string;
        autoSave?: boolean;
        mentionable?: boolean;
    } ) {
        const { guildId, userOwnerId, version, nameTemplate, autoSave, mentionable } = data;

        // Map version string to version constant
        const versionConstant = version === "v2" ? VERSION_UI_V2 : VERSION_UI_V3;

        this.logger.log(
            this.handleCreateDynamicSetup,
            `Creating dynamic master channel setup for guild ${ guildId } with version ${ version || "v3" }`
        );

        try {
            // Use ServiceLocator to get MasterChannelService to avoid circular dependency
            const { MasterChannelService } = await import( "@vertix.gg/bot/src/services/master-channel-service" );
            const masterChannelService = ServiceLocator.$.get<InstanceType<typeof MasterChannelService>>( MasterChannelService.getName() );

            if ( !masterChannelService ) {
                this.logger.error( this.handleCreateDynamicSetup, "MasterChannelService not available" );
                return;
            }

            const result = await masterChannelService.createMasterChannel( {
                guildId,
                userOwnerId,
                version: versionConstant,
                dynamicChannelNameTemplate: nameTemplate,
                dynamicChannelAutoSave: autoSave,
                dynamicChannelMentionable: mentionable,
                dynamicChannelControlChannelAutoCreate: true
            } );

            if ( result.code === "success" ) {
                this.logger.log(
                    this.handleCreateDynamicSetup,
                    `Successfully created dynamic master channel setup for guild ${ guildId }`
                );
            } else {
                this.logger.error(
                    this.handleCreateDynamicSetup,
                    `Failed to create dynamic master channel setup: ${ result.code }`
                );
            }
        } catch( error ) {
            this.logger.error( this.handleCreateDynamicSetup, `Failed to create dynamic master channel setup for guild ${ guildId }`, error );
        }
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            channelService: "VertixBot/Services/Channel",
            uiService: "VertixGUI/UIService",
            uiVersioningAdapterService: "VertixGUI/UIVersioningAdapterService",
            channelCleanupService: "VertixBot/Services/ChannelCleanup"
        };
    }

    /**
     * Get dynamic channel info for IPC request (called by ManagementIPCService)
     */
    public async getDynamicChannelInfo(
        guildId: string,
        masterChannelId: string,
        dynamicChannelIds: string[]
    ): Promise<GetDynamicChannelInfoResponse> {
        const result: GetDynamicChannelInfoResponse = {
            masterChannel: null,
            category: null,
            dynamicChannels: []
        };

        const guild = this.services.appService.getClient().guilds.cache.get( guildId );

        if ( !guild ) {
            this.logger.warn( this.getDynamicChannelInfo, `Guild not found: ${ guildId }` );
            return result;
        }

        const masterChannel = guild.channels.cache.get( masterChannelId );

        if ( masterChannel && masterChannel.isVoiceBased() ) {
            result.masterChannel = this.getChannelInfo( masterChannel as VoiceChannel );

            if ( masterChannel.parent ) {
                result.category = {
                    id: masterChannel.parent.id,
                    name: masterChannel.parent.name,
                    memberCount: 0,
                    position: masterChannel.parent.position
                };
            }
        }

        for ( const channelId of dynamicChannelIds ) {
            const channel = guild.channels.cache.get( channelId );

            if ( channel && channel.isVoiceBased() ) {
                result.dynamicChannels.push( this.getChannelInfo( channel as VoiceChannel ) );
            }
        }

        return result;
    }

    private getChannelInfo( channel: VoiceChannel ): IPCDiscordChannelInfo {
        return {
            id: channel.id,
            name: channel.name,
            memberCount: channel.members.size,
            position: channel.position
        };
    }

    public async onJoinDynamicChannel( args: IChannelEnterGenericArgs ) {
        const { oldState, newState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info(
            this.onJoinDynamicChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' join dynamic channel '${ channelName }'`
        );

        if ( newState.channel ) {
            if ( await this.isChannelOwner( newState.member?.id, newState.channel.id ) ) {
                await this.onOwnerJoinDynamicChannel( oldState.member as GuildMember, newState.channel );
            }
        }
    }

    public async onLeaveDynamicChannel( args: IChannelLeaveGenericArgs ) {
        const { oldState, displayName, channelName } = args,
            { guild } = oldState;

        this.logger.info(
            this.onLeaveDynamicChannel,
            `Guild id: '${ guild.id }' - User '${ displayName }' left dynamic channel '${ channelName }'`
        );

        if ( args.oldState.channel ) {
            const channel = args.oldState.channel,
                channelDB = await ChannelModel.$.getByChannelId( channel.id );

            if ( channel.members.size === 0 ) {
                try {
                    await this.onLeaveDynamicChannelEmpty( channel, channelDB, guild, args );
                } catch( error ) {
                    this.logger.error(
                        this.onLeaveDynamicChannelEmpty,
                        `Guild id: '${ guild.id }', channel id: '${ channel.id }' - Failed to handle empty channel`,
                        error
                    );
                }
            } else if ( channelDB?.userOwnerId === oldState.member?.id ) {
                await this.onOwnerLeaveDynamicChannel( oldState.member as GuildMember, channel );
            }
        }
    }

    public async onOwnerJoinDynamicChannel( owner: GuildMember, channel: VoiceBasedChannel ) {
        const state = DynamicChannelVoteManager.$.getState( channel.id );

        this.logger.info(
            this.onOwnerJoinDynamicChannel,
            `Guild id: '${ channel.guild.id }', channel id: ${ channel.id }, state: '${ state }' - ` +
                                `Owner: '${ owner.displayName }' join dynamic channel: '${ channel.name }'`
        );
    }

    private async getMemberRoleIds( channel: VoiceChannel, userId: string ): Promise<string[]> {
        const cached = channel.guild.members.cache.get( userId );

        if ( cached ) {
            return Array.from( cached.roles.cache.keys() );
        }

        const fetched = await channel.guild.members.fetch( userId ).catch( () => null );

        if ( fetched ) {
            return Array.from( fetched.roles.cache.keys() );
        }

        return [];
    }

    public async onOwnerLeaveDynamicChannel( owner: GuildMember, channel: VoiceBasedChannel ) {
        this.logger.info(
            this.onOwnerLeaveDynamicChannel,
            `Guild id: '${ channel.guild.id }' - Owner: '${ owner.displayName }' left dynamic channel: '${ channel.name }'`
        );
    }

    public async onLeaveDynamicChannelEmpty(
        channel: VoiceBasedChannel,
        channelDB: null | ChannelExtended,
        guild: Guild,
        args: IChannelLeaveGenericArgs
    ) {
        if ( !channelDB ) {
            this.logger.error(
                this.onLeaveDynamicChannelEmpty,
                `Guild id: '${ guild.id }', channel id: '${ channel.id }' - ` + "Channel DB not found."
            );

            return;
        }

        const ownerMember = args.newState.guild.members.cache.get( channelDB.userOwnerId );

        await this.log( undefined, channel as VoiceChannel, this.onLeaveDynamicChannelEmpty, "", {
            ownerDisplayName: ownerMember?.displayName
        } );

        await this.services.channelService.delete( { guild, channel } );
    }

    public async getAssembledChannelNameTemplate(
        channel: VoiceChannel,
        userId: string,
        newName?: string,
    ): Promise<string> {
        // Supported placeholders: {user}, {state}, {game}, {index}
        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id ),
            userDisplayName = await guildGetMemberDisplayName( channel.guild, userId );

        // Get the user's current game name
        const member = channel.guild.members.cache.get( userId );
        const gameName = member ? this.getUserCurrentGame( member ) : null;

        const { settings } = this.config.data;

        if ( newName?.length ) {
            const index = await this.getDynamicChannelTemplateIndex(
                channel.guild.id,
                masterChannelDB?.channelId ?? null,
                channel.id,
                newName
            );

            return this.assembleChannelNameTemplate( newName, {
                userDisplayName,
                state: await this.getChannelState( channel ),
                gameName,
                index
            } );
        }

        if ( !masterChannelDB ) {
            const template = settings.dynamicChannelNameTemplate;
            const index = varsHasIndexPlaceholder( template ) ? 1 : null;

            return this.assembleChannelNameTemplate( template, {
                userDisplayName,
                state: await this.getChannelState( channel ),
                gameName,
                index
            } );
        }

        const channelNameTemplate = await MasterChannelDataManager.$.getChannelNameTemplate( masterChannelDB, true );
        const index = await this.getDynamicChannelTemplateIndex(
            channel.guild.id,
            masterChannelDB.channelId,
            channel.id,
            channelNameTemplate!
        );

        return this.assembleChannelNameTemplate( channelNameTemplate!, {
            userDisplayName,
            state: await this.getChannelState( channel ),
            gameName,
            index
        } );
    }

    private async assembleChannelNameTemplate(
        channelNameTemplate: string,
        args: {
            userDisplayName: string | null;
            state: ChannelState | null;
            gameName?: string | null;
            index?: number | null;
        } = {
            state: null,
            userDisplayName: null,
            gameName: null,
            index: null
        }
    ) {
        let state = "",
            userDisplayName = "",
            indexValue = "";

        const { constants } = this.config.data;

        if ( args.state ) {
            state =
                args.state === "private" ? constants.dynamicChannelStatePrivate : constants.dynamicChannelStatePublic;
        }

        if ( args.userDisplayName ) {
            userDisplayName = args.userDisplayName.replace( /[^a-zA-Z0-9]/g, "" );
        }

        if ( args.index != null ) {
            indexValue = String( args.index );
        }

        const replacements: Record<string, string> = {
            [ VAR_DYNAMIC_CHANNEL_STATE ]: state,
            [ VAR_DYNAMIC_CHANNEL_USER ]: userDisplayName,
            [ VAR_DYNAMIC_CHANNEL_GAME ]: args.gameName ?? "",
            [ VAR_DYNAMIC_CHANNEL_INDEX ]: indexValue,
            "{{username}}": userDisplayName,
            "{{user}}": userDisplayName,
            "{{state}}": state,
            "{{game}}": args.gameName ?? "",
            "{{index}}": indexValue,
            "{auto-scale}": indexValue,
            "{autoscale}": indexValue
        };

        return channelNameTemplate.replace(
            new RegExp( Object.keys( replacements ).map( key => key.replace( /[{}]/g, "\\$&" ) ).join( "|" ), "g" ),
            ( matched: any ) => replacements[ matched ]
        );
    }

    private async getDynamicChannelTemplateIndex(
        guildId: string,
        masterChannelId: string | null,
        channelId: string | null,
        template: string
    ): Promise<number | null> {
        if ( !varsHasIndexPlaceholder( template ) ) {
            return null;
        }

        if ( !masterChannelId ) {
            return 1;
        }

        const dynamicChannels = await ChannelModel.$.getDynamicsByMasterId( guildId, masterChannelId );

        if ( !dynamicChannels.length ) {
            return 1;
        }

        const sorted = [ ...dynamicChannels ].sort(
            ( a, b ) => new Date( a.createdAt ).getTime() - new Date( b.createdAt ).getTime()
        );

        if ( channelId ) {
            const index = sorted.findIndex( ( ch ) => ch.channelId === channelId );

            if ( index >= 0 ) {
                return index + 1;
            }

            return 1;
        }

        return sorted.length + 1;
    }

    public async getChannelUsersWithPermissionState(
        channel: VoiceChannel,
        permissions: PermissionsBitField,
        state: boolean,
        skipOwner = true
    ) {
        const result: {
                id: string;
                tag: string;
            }[] = [],
            ids = await this.getChannelUserIdsWithPermissionState( channel, permissions, state, skipOwner );

        for ( const userId of ids ) {
            const user = channel.guild.members.cache.get( userId ) || ( await channel.guild.members.fetch( userId ) );

            result.push( {
                id: userId,
                tag: user.user.tag
            } );
        }

        return result;
    }

    public async getChannelUserIdsWithPermissionState(
        channel: VoiceChannel,
        permissions: PermissionsBitField,
        state: boolean,
        skipOwner = false
    ) {
        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id ),
            dynamicChannelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( !masterChannelDB ) {
            this.logger.error(
                this.getChannelUserIdsWithPermissionState,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - ` +
                                    `Master channel not found for dynamic channel id: '${ channel.id }'`
            );

            return [];
        }

        const masterChannelCache = channel.client.channels.cache.get( masterChannelDB.channelId ),
            result = [];

        for ( const role of channel.permissionOverwrites?.cache?.values() || [] ) {
            if ( role.type !== OverwriteType.Member ) {
                continue;
            }

            if ( skipOwner && role.id === dynamicChannelDB?.userOwnerId ) {
                continue;
            }

            // Show only users that are not in the master channel permission overwrites.
            if (
                masterChannelCache?.type === ChannelType.GuildVoice &&
                                masterChannelCache.permissionOverwrites.cache.has( role.id )
            ) {
                continue;
            }

            if ( state && role.allow.has( permissions ) ) {
                result.push( role.id );
            } else if ( !state && role.deny.has( permissions ) ) {
                result.push( role.id );
            }
        }

        return result;
    }

    public async getPrimaryMessage( channel: VoiceChannel ) {
        let source = "cache";

        const [ primaryMessageId, primaryMessageChannelId ] = await Promise.all( [
            ChannelModel.$.findUnique<string>( {
                where: { channelId: channel.id },
                include: { data: true, key: "primaryMessageId" }
            } ).then( ( result ) => result?.data ?? null ),
            ChannelModel.$.findUnique<string>( {
                where: { channelId: channel.id },
                include: { data: true, key: "primaryMessageChannelId" }
            } ).then( ( result ) => result?.data ?? null )
        ] );

        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

        const messageChannel = await this.resolvePrimaryMessageChannel( channel, masterChannelDB, primaryMessageChannelId );

        let message = messageChannel.messages.cache.at( 0 );

        if ( !this.isPrimaryMessage( message ) && primaryMessageId ) {
            message = messageChannel.messages.cache.get( primaryMessageId );

            if ( !message || !this.isPrimaryMessage( message ) ) {
                source = "fetch";
                message = await messageChannel.messages.fetch( primaryMessageId ).catch( () => undefined );
            }
        }

        this.logger.debug(
            this.getPrimaryMessage,
            `Guild id: '${ channel.guildId }' - Fetching primary message for channel id: '${ channel.id }' source: '${ source }'`
        );

        return message;
    }

    public async resolveTargetChannel(
        interaction: UIAdapterReplyContext | Message<true>,
        args?: UIArgs
    ): Promise<VoiceChannel | null> {
        if ( interaction.channel?.type === ChannelType.GuildVoice ) {
            return interaction.channel;
        }

        const channelFromArgs = args?.channel as { id?: string } | null | undefined;
        const channelIdFromArgs = typeof channelFromArgs?.id === "string" ? channelFromArgs.id : null;
        const channelId = typeof args?.channelId === "string" ? args.channelId : channelIdFromArgs;

        if ( channelId ) {
            const cached = interaction.guild?.channels.cache.get( channelId );

            if ( cached?.type === ChannelType.GuildVoice ) {
                return cached;
            }

            const fetched = await interaction.guild?.channels.fetch( channelId ).catch( () => null );

            if ( fetched?.type === ChannelType.GuildVoice ) {
                return fetched;
            }
        }

        if ( "user" in interaction && interaction.guild ) {
            const member = interaction.guild.members.cache.get( interaction.user.id ) ??
                await interaction.guild.members.fetch( interaction.user.id ).catch( () => null );

            const userVoiceChannel = member?.voice.channel;

            if ( userVoiceChannel?.type === ChannelType.GuildVoice ) {
                return userVoiceChannel;
            }
        }

        return null;
    }

    private async resolvePrimaryMessageChannel(
        channel: VoiceChannel,
        masterChannelDB: ChannelExtended | null,
        storedChannelId: string | null
    ) {
        const storedChannel = await this.getPrimaryMessageChannelById( channel.guild, storedChannelId );

        if ( storedChannel ) {
            return storedChannel;
        }

        if ( masterChannelDB ) {
            const settings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB );
            const controlChannelId = settings.dynamicChannelControlChannelId;
            const controlChannel = await this.getPrimaryMessageChannelById( channel.guild, controlChannelId );

            if ( controlChannel?.type === ChannelType.GuildText ) {
                return controlChannel;
            }
        }

        return channel;
    }

    private async getPrimaryMessageChannelById(
        guild: Guild,
        channelId: string | null
    ): Promise<TextChannel | VoiceChannel | null> {
        if ( !channelId ) {
            return null;
        }

        const cached = guild.channels.cache.get( channelId );

        if ( cached?.type === ChannelType.GuildText ) {
            return cached;
        }

        if ( cached?.type === ChannelType.GuildVoice ) {
            return cached;
        }

        const fetched = await guild.channels.fetch( channelId ).catch( () => null );

        if ( fetched?.type === ChannelType.GuildText ) {
            return fetched;
        }

        if ( fetched?.type === ChannelType.GuildVoice ) {
            return fetched;
        }

        return null;
    }

    /**
     * Function updateVerifiedRolesPermissions() :: Brings the dynamic channels of a master channel
     * in line with an edited verified roles list.
     *
     * A role that left the list keeps whatever the channel state had denied it, so its `Connect`
     * and `ViewChannel` are cleared. A role that joined has to be denied whatever the channel is
     * already set to, otherwise a private or hidden channel would silently stay open to it.
     *
     * The state is read from `previousRoles`, since the stored list is the new one by the time
     * this runs and a brand new role carries no overwrite to read a state from.
     */
    public async updateVerifiedRolesPermissions(
        guildId: string,
        masterChannelId: string,
        previousRoles: string[],
        currentRoles: string[]
    ) {
        const removedRoles = previousRoles.filter( ( roleId ) => ! currentRoles.includes( roleId ) ),
            addedRoles = currentRoles.filter( ( roleId ) => ! previousRoles.includes( roleId ) );

        if ( ! removedRoles.length && ! addedRoles.length ) {
            return;
        }

        const dynamicChannelsDB = await ChannelModel.$.getDynamicsByMasterId( guildId, masterChannelId );

        this.logger.info(
            this.updateVerifiedRolesPermissions,
            `Guild id: '${ guildId }', master channel id: '${ masterChannelId }' - ` +
                `Applying verified roles to ${ dynamicChannelsDB.length } dynamic channel(s), ` +
                `added: '${ addedRoles }', removed: '${ removedRoles }'`
        );

        // The master channel carries the same grant, and new dynamic channels inherit it from
        // there, so it has to move with the list or the next channel is built from a stale one.
        const masterChannel = this.services.appService
            .getClient()
            .channels.cache.get( masterChannelId ) as VoiceChannel | undefined;

        if ( masterChannel ) {
            if ( addedRoles.length ) {
                await PermissionsManager.$.editChannelRolesPermissions( masterChannel, addedRoles, {
                    Connect: true,
                    ViewChannel: true
                } );
            }

            if ( removedRoles.length ) {
                await PermissionsManager.$.editChannelRolesPermissions( masterChannel, removedRoles, {
                    Connect: null,
                    ViewChannel: null
                } );
            }

            // The category is a template as much as a container - discord copies its overwrites
            // onto channels created inside it without their own - so it follows the audience too.
            const masterCategory = masterChannel.parent;

            if ( masterCategory ) {
                if ( removedRoles.length ) {
                    await PermissionsManager.$.editChannelRolesPermissions( masterCategory, removedRoles, {
                        ViewChannel: null
                    } );
                }

                if ( addedRoles.length ) {
                    await PermissionsManager.$.editChannelRolesPermissions( masterCategory, addedRoles, {
                        ViewChannel: true
                    } );
                }

                await PermissionsManager.$.editChannelRolesPermissions(
                    masterCategory,
                    [ masterChannel.guild.roles.everyone.id ],
                    { ViewChannel: currentRoles.includes( masterChannel.guild.roles.everyone.id ) }
                );
            }
        }

        await this.updateControlChannelVerifiedRoles( guildId, masterChannelId, removedRoles, currentRoles );

        for ( const dynamicChannelDB of dynamicChannelsDB ) {
            const channel = this.services.appService
                .getClient()
                .channels.cache.get( dynamicChannelDB.channelId ) as VoiceChannel | undefined;

            if ( ! channel ) {
                this.logger.warn(
                    this.updateVerifiedRolesPermissions,
                    `Guild id: '${ guildId }' - Dynamic channel id: '${ dynamicChannelDB.channelId }' not found`
                );
                continue;
            }

            const wasPrivate = this.isRolesDeniedFlag( channel, previousRoles, PermissionsBitField.Flags.Connect ),
                wasHidden = this.isRolesDeniedFlag( channel, previousRoles, PermissionsBitField.Flags.ViewChannel );

            if ( addedRoles.length ) {
                await PermissionsManager.$.editChannelRolesPermissions( channel, addedRoles, {
                    Connect: wasPrivate ? false : null,
                    ViewChannel: wasHidden ? false : null
                } );
            }

            if ( removedRoles.length ) {
                await PermissionsManager.$.editChannelRolesPermissions( channel, removedRoles, {
                    Connect: null,
                    ViewChannel: null
                } );
            }

            // An audience narrower than `@everyone` keeps `@everyone` out of the channel entirely,
            // whatever the state is, so narrowing the list must not hand the channel to everyone.
            if ( ! currentRoles.includes( channel.guild.roles.everyone.id ) ) {
                await PermissionsManager.$.editChannelRolesPermissions(
                    channel,
                    [ channel.guild.roles.everyone.id ],
                    {
                        Connect: false,
                        ViewChannel: false
                    }
                );
            }
        }
    }

    /**
     * Function updateStaffRolesPermissions() :: Applies an edited staff roles list to everything the
     * master channel owns - itself, its category, its control panel and every dynamic channel under
     * it.
     *
     * Staff roles are granted rather than denied, so adding one never has to read the channel
     * state: the grant outranks whatever deny the state wrote. Removing one does, because a role
     * can be staff and audience at once - clearing the overwrite of a role that is still a verified
     * role would take away the access its verified role entitles it to, so such a role is handed
     * back to the verified roles treatment instead of being cleared.
     */
    public async updateStaffRolesPermissions(
        guildId: string,
        masterChannelId: string,
        previousRoles: string[],
        currentRoles: string[]
    ) {
        const removedRoles = previousRoles.filter( ( roleId ) => ! currentRoles.includes( roleId ) ),
            addedRoles = currentRoles.filter( ( roleId ) => ! previousRoles.includes( roleId ) );

        if ( ! removedRoles.length && ! addedRoles.length ) {
            return;
        }

        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannelId );

        const verifiedRoles = masterChannelDB
            ? await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, guildId )
            : [];

        const clearedRoles = removedRoles.filter( ( roleId ) => ! verifiedRoles.includes( roleId ) ),
            demotedRoles = removedRoles.filter( ( roleId ) => verifiedRoles.includes( roleId ) );

        const dynamicChannelsDB = await ChannelModel.$.getDynamicsByMasterId( guildId, masterChannelId );

        this.logger.info(
            this.updateStaffRolesPermissions,
            `Guild id: '${ guildId }', master channel id: '${ masterChannelId }' - ` +
                `Applying staff roles to ${ dynamicChannelsDB.length } dynamic channel(s), ` +
                `added: '${ addedRoles }', cleared: '${ clearedRoles }', demoted: '${ demotedRoles }'`
        );

        const client = this.services.appService.getClient(),
            masterChannel = client.channels.cache.get( masterChannelId ) as VoiceChannel | undefined;

        // The master channel, its category and the control panel grant a verified role the same
        // access a staff role gets, so a demoted role keeps what it already has there and only
        // loses the flags the verified roles never gave it.
        const staticTargets: GuildChannel[] = [];

        if ( masterChannel ) {
            staticTargets.push( masterChannel );

            if ( masterChannel.parent ) {
                staticTargets.push( masterChannel.parent );
            }
        }

        const controlChannel = await this.getControlChannel( masterChannelId );

        if ( controlChannel ) {
            staticTargets.push( controlChannel );
        }

        for ( const target of staticTargets ) {
            if ( addedRoles.length ) {
                await PermissionsManager.$.editChannelRolesPermissions( target, addedRoles, {
                    Connect: true,
                    ViewChannel: true
                } );
            }

            if ( clearedRoles.length ) {
                await PermissionsManager.$.editChannelRolesPermissions( target, clearedRoles, {
                    Connect: null,
                    ViewChannel: null
                } );
            }

            if ( demotedRoles.length ) {
                await PermissionsManager.$.editChannelRolesPermissions( target, demotedRoles, {
                    ViewChannel: true
                } );
            }
        }

        // A dynamic channel is the one place where the verified roles are denied rather than
        // granted, so a demoted role has to be put back to whatever the channel state says.
        const stateProbeRoles = verifiedRoles.filter( ( roleId ) => ! demotedRoles.includes( roleId ) );

        for ( const dynamicChannelDB of dynamicChannelsDB ) {
            const channel = client.channels.cache.get( dynamicChannelDB.channelId ) as VoiceChannel | undefined;

            if ( ! channel ) {
                continue;
            }

            if ( addedRoles.length ) {
                await PermissionsManager.$.editChannelRolesPermissions( channel, addedRoles, {
                    Connect: true,
                    ViewChannel: true
                } );
            }

            if ( clearedRoles.length ) {
                await PermissionsManager.$.editChannelRolesPermissions( channel, clearedRoles, {
                    Connect: null,
                    ViewChannel: null
                } );
            }

            if ( demotedRoles.length ) {
                const isPrivate = this.isRolesDeniedFlag( channel, stateProbeRoles, PermissionsBitField.Flags.Connect ),
                    isHidden = this.isRolesDeniedFlag( channel, stateProbeRoles, PermissionsBitField.Flags.ViewChannel );

                await PermissionsManager.$.editChannelRolesPermissions( channel, demotedRoles, {
                    Connect: isPrivate ? false : null,
                    ViewChannel: isHidden ? false : null
                } );
            }
        }
    }

    /**
     * Function getControlChannel() :: Resolves the control panel of a master channel, if it has one.
     */
    private async getControlChannel( masterChannelId: string ) {
        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannelId );

        if ( ! masterChannelDB ) {
            return null;
        }

        const settings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB ),
            controlChannelId = settings.dynamicChannelControlChannelId;

        if ( ! controlChannelId ) {
            return null;
        }

        const controlChannel = this.services.appService.getClient().channels.cache.get( controlChannelId );

        return controlChannel?.type === ChannelType.GuildText ? controlChannel : null;
    }

    /**
     * Function updateControlChannelVerifiedRoles() :: Moves the control panel with the verified
     * roles list.
     *
     * The panel is shown to the same audience as the channels it drives, so it has to follow the
     * list too - otherwise editing the roles leaves a panel visible to people who can no longer see
     * a single channel it controls, or hidden from the audience that just gained them.
     *
     * Only `ViewChannel` is touched; the panel's read only deny list is left alone.
     */
    private async updateControlChannelVerifiedRoles(
        guildId: string,
        masterChannelId: string,
        removedRoles: string[],
        currentRoles: string[]
    ) {
        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannelId );

        if ( ! masterChannelDB ) {
            return;
        }

        const settings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB ),
            controlChannelId = settings.dynamicChannelControlChannelId;

        if ( ! controlChannelId ) {
            return;
        }

        const controlChannel = this.services.appService.getClient().channels.cache.get( controlChannelId );

        if ( controlChannel?.type !== ChannelType.GuildText ) {
            this.logger.warn(
                this.updateControlChannelVerifiedRoles,
                `Guild id: '${ guildId }' - Control channel id: '${ controlChannelId }' not found`
            );
            return;
        }

        const everyoneRoleId = controlChannel.guild.roles.everyone.id,
            audienceRoles = currentRoles.filter( ( roleId ) => roleId !== everyoneRoleId );

        for ( const roleId of removedRoles.filter( ( roleId ) => roleId !== everyoneRoleId ) ) {
            await controlChannel.permissionOverwrites.edit( roleId, { ViewChannel: null } ).catch( ( error ) => {
                this.logger.error( this.updateControlChannelVerifiedRoles, "", error );
            } );
        }

        for ( const roleId of audienceRoles ) {
            await controlChannel.permissionOverwrites.edit( roleId, { ViewChannel: true } ).catch( ( error ) => {
                this.logger.error( this.updateControlChannelVerifiedRoles, "", error );
            } );
        }

        // `@everyone` sees the panel only while it is itself the audience.
        await controlChannel.permissionOverwrites
            .edit( everyoneRoleId, { ViewChannel: currentRoles.includes( everyoneRoleId ) } )
            .catch( ( error ) => {
                this.logger.error( this.updateControlChannelVerifiedRoles, "", error );
            } );
    }

    public async getChannelState( channel: VoiceChannel ): Promise<ChannelState> {
        let result: ChannelState;

        if ( await this.isVerifiedRolesDeniedFlag( channel, PermissionsBitField.Flags.Connect ) ) {
            result = "private";
        } else {
            result = "public";
        }

        return result;
    }

    public async getChannelVisibilityState( channel: VoiceChannel ): Promise<ChannelVisibilityState> {
        let result: ChannelVisibilityState;

        if ( await this.isVerifiedRolesDeniedFlag( channel, PermissionsBitField.Flags.ViewChannel ) ) {
            result = "hidden";
        } else {
            result = "shown";
        }

        return result;
    }

    public async getChannelPrivacyState( channel: VoiceChannel ) {
        let result: ChannelPrivacyState;

        const state = await this.getChannelState( channel ),
            visibilityState = await this.getChannelVisibilityState( channel );

        if ( "hidden" === visibilityState ) {
            result = "hidden";
        } else if ( "private" === state ) {
            result = "private";
        } else {
            result = "public";
        }

        return result;
    }

    public getChannelDefaultInheritedProperties( channel: VoiceBasedChannel ) {
        const { rtcRegion, bitrate, userLimit } = channel,
            result: any = { bitrate, userLimit };

        if ( rtcRegion !== null ) {
            result.rtcRegion = rtcRegion;
        }

        this.debugger.log( this.getChannelDefaultInheritedProperties, JSON.stringify( result ) );

        return result;
    }

    /**
     * TODO: This method should be dedicated and used in other places.
     */
    public async getChannelConfiguration(
        channel: VoiceChannel,
        userId: Snowflake,
        masterChannelDBId: string,
        options = {
            includeRegion: false,
            includePrimaryMessage: false
        }
    ): Promise<TDynamicChannelConfiguration> {
        const optional: Partial<TDynamicChannelConfiguration> = {};

        if ( options.includeRegion ) {
            optional.region = channel.rtcRegion ?? "auto";
        }

        if ( options.includePrimaryMessage ) {
            const primaryMessage = await UserMasterChannelDataModel.$.getPrimaryMessage( userId, masterChannelDBId );

            if ( primaryMessage?.title ) {
                optional.primaryMessageTitle = primaryMessage.title;
            }

            if ( primaryMessage?.description ) {
                optional.primaryMessageDescription = primaryMessage.description;
            }
        }

        return {
            name: channel.name,
            userLimit: channel.userLimit,

            state: await this.getChannelState( channel ),
            visibilityState: await this.getChannelVisibilityState( channel ),

            allowedUserIds: await this.getChannelUserIdsWithPermissionState(
                channel,
                DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                true,
                true
            ),
            blockedUserIds: await this.getChannelUserIdsWithPermissionState(
                channel,
                DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                false,
                true
            ),

            ...optional
        };
    }

    public async createDynamicChannel( args: IDynamicChannelCreateArgs ) {
        const { displayName, guild, newState } = args,
            masterChannel = newState.channel as VoiceBasedChannel,
            userOwnerId = newState.member?.id as string;

        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannel.id );
        if ( !masterChannelDB ) {
            this.logger.error(
                this.createDynamicChannel,
                `Guild id: ${ guild.id } - Could not find master channel in database master channel id: '${ masterChannel.id }'`
            );
            return;
        }

        // Ensure user exist.
        const user = await UserModel.$.ensure( {
            data: {
                userId: userOwnerId,
                username: args.username
            }
        } );

        // Check if autosave is enabled.
        const autoSave = await MasterChannelDataManager.$.getChannelAutosave( masterChannelDB, false );

        let savedData: MasterChannelUserDataInterface | null = null,
            dynamicChannelName = "",
            dynamicChannelUserLimit = 0,
            permissionOverwrites: OverwriteResolvable[] = [];

        // Default channel properties.
        const defaultProperties = {
            ...this.getChannelDefaultInheritedProperties( masterChannel ),
            // TODO: Move `getChannelDefaultPermissions` to `getChannelDefaultInheritedProperties`.
            ...PermissionsManager.$.getChannelDefaultPermissions(
                newState.id,
                masterChannel,
                DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
            )
        };

        // Staff roles outrank every deny the state writes, so they are granted up front and the
        // saved state below never has to account for them.
        const staffRoles = await MasterChannelDataManager.$.getChannelStaffRoles( masterChannelDB );

        staffRoles.forEach( ( roleId ) => {
            permissionOverwrites.push( {
                id: roleId,
                ...DEFAULT_MASTER_CHANNEL_STAFF_ROLES_PERMISSIONS
            } );
        } );

        if ( autoSave ) {
            savedData = await UserMasterChannelDataModel.$.getData( user.userId, masterChannelDB.id );
        }

        if ( savedData ) {
            dynamicChannelName = savedData.dynamicChannelName;
            dynamicChannelUserLimit = savedData.dynamicChannelUserLimit;

            const verifiedRoles =
                    await MasterChannelDataManager.$.getChannelVerifiedRoles(
                        masterChannelDB,
                        masterChannel.guildId
                    ),
                verifiedFlagsAllow: bigint[] = [],
                verifiedFlagsDeny: bigint[] = [];

            const {
                dynamicChannelState,
                dynamicChannelVisibilityState,
                dynamicChannelRegion,
                dynamicChannelAllowedUserIds,
                dynamicChannelBlockedUserIds
            } = savedData;

            // V3 states the permission outright - `editChannelPrivacyState()` grants `Connect` for
            // public and `ViewChannel` for shown - while V2 restores the flag to its default.
            // Restoring a channel has to speak whichever model its master channel does, otherwise a
            // saved V3 channel comes back holding V2 permissions until its privacy button is
            // pressed once.
            const isPrivacyGranted = VERSION_UI_V3 === masterChannelDB.version;

            if ( "private" === dynamicChannelState ) {
                verifiedFlagsDeny.push( PermissionsBitField.Flags.Connect );
            } else if ( isPrivacyGranted && "public" === dynamicChannelState ) {
                verifiedFlagsAllow.push( PermissionsBitField.Flags.Connect );
            }

            if ( "hidden" === dynamicChannelVisibilityState ) {
                verifiedFlagsDeny.push( PermissionsBitField.Flags.ViewChannel );
            } else if ( isPrivacyGranted && "shown" === dynamicChannelVisibilityState ) {
                verifiedFlagsAllow.push( PermissionsBitField.Flags.ViewChannel );
            }

            if ( dynamicChannelRegion ) {
                defaultProperties.rtcRegion = dynamicChannelRegion ?? null;
            }

            if ( verifiedFlagsDeny.length || verifiedFlagsAllow.length ) {
                // Ensure bot connectivity, only a deny can lock the bot out of the channel.
                //
                // This has to re-state the full master channel set rather than just `ViewChannel`
                // and `Connect`: it lands in the same overwrite array as the entry inherited from
                // the master channel and addresses the same id, so a narrower entry here would
                // strip the bot of everything else it was granted.
                if ( verifiedFlagsDeny.length && !PermissionsManager.$.isSelfAdministratorRole( masterChannel.guild ) ) {
                    permissionOverwrites.push( {
                        id: masterChannel.client.user?.id as string,
                        ...DEFAULT_MASTER_CHANNEL_CREATE_BOT_PERMISSIONS
                    } );
                }

                verifiedRoles.forEach( ( role: string ) => {
                    permissionOverwrites.push( {
                        id: role,
                        allow: verifiedFlagsAllow,
                        deny: verifiedFlagsDeny,
                        type: OverwriteType.Role
                    } );
                } );

                // An audience narrower than `@everyone` keeps `@everyone` out entirely, whatever
                // the restored state is. Without this a channel restored as public would be open to
                // everyone outside its own audience.
                //
                // This replaces the entry inherited from the master channel, which carries nothing
                // but the chat lock that inheritance already strips.
                const everyoneRoleId = masterChannel.guild.roles.everyone.id;

                if ( !verifiedRoles.includes( everyoneRoleId ) ) {
                    permissionOverwrites.push( {
                        id: everyoneRoleId,
                        deny: [ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect ],
                        type: OverwriteType.Role
                    } );
                }
            }

            dynamicChannelAllowedUserIds.forEach( ( userId: string ) => {
                permissionOverwrites.push( {
                    id: userId,
                    allow: DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                    type: OverwriteType.Member
                } );
            } );

            dynamicChannelBlockedUserIds.forEach( ( userId: string ) => {
                permissionOverwrites.push( {
                    id: userId,
                    deny: DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
                    type: OverwriteType.Member
                } );
            } );
        }

        if ( !dynamicChannelName ) {
            const dynamicChannelTemplateName = await MasterChannelDataManager.$.getChannelNameTemplate( masterChannelDB );

            if ( !dynamicChannelTemplateName ) {
                this.logger.error(
                    this.createDynamicChannel,
                    `Guild id: ${ guild.id } - Could not find master template name in database, master channel db id: '${ masterChannelDB.id }'`
                );
                return;
            }

            // Get the user's current game name
            const member = guild.members.cache.get( userOwnerId );
            const gameName = member ? this.getUserCurrentGame( member ) : null;

            const index = await this.getDynamicChannelTemplateIndex(
                guild.id,
                masterChannelDB.channelId,
                null,
                dynamicChannelTemplateName
            );

            dynamicChannelName = await this.assembleChannelNameTemplate( dynamicChannelTemplateName, {
                userDisplayName: displayName,
                state: null,
                gameName,
                index
            } );
        }

        this.logger.info(
            this.createDynamicChannel,
            `Guild id: '${ guild.id }' - Creating dynamic channel '${ dynamicChannelName }' for user '${ displayName }' ownerId: '${ userOwnerId }' version: '${ masterChannelDB.version }'`
        );

        // Extend from auto saved data, replacing the inherited entry for any role or member the
        // saved state also addresses.
        defaultProperties.permissionOverwrites = PermissionsManager.$.mergeChannelPermissionOverwrites(
            defaultProperties.permissionOverwrites,
            permissionOverwrites
        );

        // Create a channel for the user.
        const dynamic = await this.services.channelService.create( {
            ...defaultProperties,
            // ---
            guild,
            // ---
            name: dynamicChannelName,
            userLimit: dynamicChannelUserLimit,
            // ---
            userOwnerId: newState.id,
            ownerChannelId: masterChannel.id,
            // ---
            type: ChannelType.GuildVoice,
            parent: masterChannel.parent,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL,
            // ---
            version: masterChannelDB.version,
        } );

        if ( !dynamic ) {
            this.logger.error(
                this.createDynamicChannel,
                `Guild id: '${ guild.id }' - Could not create dynamic channel '${ dynamicChannelName }' for user '${ displayName }'`
            );
            return;
        }

        await this.log( undefined, newState.channel as VoiceChannel, this.createDynamicChannel, "", {
            ownerDisplayName: displayName,
            newState
        } );

        // Move the user into a new channel.
        await newState
            .setChannel( dynamic.channel.id )
            .then( () => {
                this.logger.log(
                    this.createDynamicChannel,
                    `Guild id: '${ guild.id }' - User '${ displayName }' moved to dynamic channel '${ dynamicChannelName }'`
                );
            } )
            .catch( () => {} );

        setTimeout( async() => {
            if ( dynamic.channel.isVoiceBased() ) {
                // newState.channel?.setRTCRegion( masterChannel.rtcRegion );

                const dynamicChannelDB = await dynamic.db;
                let primaryMessage;

                // Create a primary message.
                primaryMessage = await this.createPrimaryMessage( dynamic.channel, dynamicChannelDB );

                // Update the database.
                if ( primaryMessage?.id ) {
                    // TODO: Find better solution for data versioning.
                    ChannelModel.$.getModelByVersion( masterChannelDB.version )?.create(
                        {
                            where: {
                                id: dynamicChannelDB.id
                            }
                        },
                        {
                            key: "primaryMessageId"
                        },
                        primaryMessage.id
                    );
                }

                if ( primaryMessage?.channel?.id ) {
                    ChannelModel.$.getModelByVersion( masterChannelDB.version )?.create(
                        {
                            where: {
                                id: dynamicChannelDB.id
                            }
                        },
                        {
                            key: "primaryMessageChannelId"
                        },
                        primaryMessage.channel.id
                    );
                }

                // Ensure user exist.
                const user = await UserModel.$.ensure( {
                    data: {
                        userId: userOwnerId,
                        username: args.username
                    }
                } );

                await UserMasterChannelDataModel.$.setData( user.userId, masterChannelDB.id, {
                    dynamicChannelName,
                    dynamicChannelUserLimit: masterChannel.userLimit,
                    dynamicChannelState: await this.getChannelState( dynamic.channel ),
                    dynamicChannelVisibilityState: await this.getChannelVisibilityState( dynamic.channel ),
                    dynamicChannelAllowedUserIds: [],
                    dynamicChannelBlockedUserIds: []
                } );
            }
        }, 1000 );

        return dynamic;
    }

    public async createPrimaryMessage( channel: VoiceChannel, dynamicChannelDB: ChannelExtended ) {
        this.logger.log(
            this.createPrimaryMessage,
            `Guild id: '${ channel.guild.id }', channel id: '${ channel.id }' - ` +
                                `Creating primary message for owner id: '${ dynamicChannelDB.userOwnerId }'`
        );

        const masterChannelDB = await ChannelModel.$.getByChannelId( dynamicChannelDB.ownerChannelId as string );

        const sendArgs: {
            ownerId: string;
            channelId: string;
            dynamicChannelMentionable?: boolean;
            memberRoleIds?: string[];
        } = {
            ownerId: dynamicChannelDB.userOwnerId,
            channelId: channel.id
        };

        const memberRoleIds = await this.getMemberRoleIds( channel, dynamicChannelDB.userOwnerId );

        if ( memberRoleIds.length ) {
            sendArgs.memberRoleIds = memberRoleIds;
        }

        if ( masterChannelDB ) {
            sendArgs.dynamicChannelMentionable = await MasterChannelDataManager.$.getChannelMentionable(
                masterChannelDB,
                true
            );
        }

        return ( await this.services.uiVersioningAdapterService.get( "VertixBot/DynamicChannelAdapter", channel ) )?.send(
            channel,
            sendArgs
        );
    }

    public async editChannelName(
        initiator: ModalSubmitInteraction<"cached">,
        channel: VoiceChannel,
        newChannelName: string
    ): Promise<IDynamicEditChannelNameResult> {
        const result: IDynamicEditChannelNameResult = { code: DynamicEditChannelNameResultCode.Error },
            oldChannelName = channel.name,
            usedBadword = await GuildDataManager.$.hasSomeBadword( channel.guildId, newChannelName );

        if ( usedBadword ) {
            result.code = DynamicEditChannelNameResultCode.Badword;
            result.badword = usedBadword;

            await this.log( initiator, channel, this.editChannelName, "badword", {
                result,
                newChannelName,
                oldChannelName
            } );

            return result;
        }

        const editResult = await this.editChannelNameInternal( channel, newChannelName );

        switch ( editResult.code ) {
            case DynamicEditChannelNameInternalResultCode.Success:
                result.code = DynamicEditChannelNameResultCode.Success;

                await UserMasterChannelDataModel.$.setDataByDynamicChannel( initiator.user.id, channel, {
                    dynamicChannelName: newChannelName
                } );

                result.code = DynamicEditChannelNameResultCode.Success;

                await this.log( initiator, channel, this.editChannelName, "success", {
                    newChannelName,
                    oldChannelName
                } );

                this.editPrimaryMessageDebounce( channel );
                break;

            case DynamicEditChannelNameInternalResultCode.RateLimit:
                result.code = DynamicEditChannelNameResultCode.RateLimit;
                result.retryAfter = editResult.retryAfter;

                await this.log( initiator, channel, this.editChannelName, "limited", {
                    result,
                    newChannelName,
                    oldChannelName
                } );

                break;
        }

        return result;
    }

    public async editUserLimit( initiator: ModalSubmitInteraction<"cached">, channel: VoiceChannel, newLimit: number ) {
        let result = false;

        const oldLimit = channel.userLimit;

        await channel
            .setUserLimit( newLimit )
            .then( async() => {
                result = true;
            } )
            .catch( ( error ) => {
                this.logger.error( this.editUserLimit, "", error );
            } );

        await this.log( initiator, channel, this.editUserLimit, "", { result, oldLimit, newLimit } );

        if ( result ) {
            await UserMasterChannelDataModel.$.setDataByDynamicChannel( initiator.user.id, channel, {
                dynamicChannelUserLimit: newLimit
            } );

            this.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    public async editChannelState(
        initiator: MessageComponentInteraction<"cached">,
        channel: VoiceChannel,
        newState: ChannelState
    ) {
        const result: IDynamicEditChannelStateResult = {
                code: DynamicEditChannelStateResultCode.Error
            },
            roles = await this.getStateRoles( channel );

        let editStatePromise;

        switch ( newState ) {
            case "public":
                editStatePromise = PermissionsManager.$.editChannelAudiencePermissions( channel, roles, {
                    Connect: null
                } );
                break;

            case "private":
                await PermissionsManager.$.ensureChannelBotConnectivityPermissions( channel );

                editStatePromise = PermissionsManager.$.editChannelAudiencePermissions( channel, roles, {
                    Connect: false
                } );
                break;

            default:
                this.logger.error(
                    this.editChannelState,
                    `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
                                        `Could not change state of dynamic channel: '${ channel.name }' to state: '${ newState }'`
                );
        }

        await editStatePromise
            ?.catch( ( error ) => this.logger.error( this.editChannelState, "", error ) )
            .then( () => ( result.code = DynamicEditChannelStateResultCode.Success ) );

        await this.log( initiator, channel, this.editChannelState, newState, { result } );

        if ( result ) {
            // TODO: This is disabled, since of `Discord` rate limits, probably better use `status` message.
            // Rename channel if state is in the name template
            // const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( channel.id );
            //
            // if ( masterChannelDB ) {
            //     const channelNameTemplate = await MasterChannelDataManager.$.getChannelNameTemplate( masterChannelDB.id, false );
            //
            //     if ( channelNameTemplate?.includes( this.config.defaults.constants.dynamicChannelStateVar ) ) {
            //         const channelName = await this.assembleChannelNameTemplate( channelNameTemplate, {
            //             userDisplayName: await guildGetMemberDisplayName( channel.guild, initiator.user.id ),
            //             state: newState,
            //         } );
            //
            //         const renameResult = await this.editChannelNameInternal( channel, channelName );
            //
            //         // If failed due rate limit, send message to the initiator.
            //         if ( renameResult.code === DynamicEditChannelNameInternalResultCode.RateLimit ) {
            //             result.code = DynamicEditChannelStateResultCode.RenameChannelStateRateLimit;
            //             result.retryAfter = renameResult.retryAfter;
            //
            //             setTimeout( () => {
            //                 this.editChannelNameInternal( channel, channelName );
            //             }, ( ( result.retryAfter as number ) + 1 ) * 1000 );
            //         }
            //     }
            // }

            await UserMasterChannelDataModel.$.setDataByDynamicChannel( initiator.user.id, channel, {
                dynamicChannelState: newState
            } );

            this.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    public async editChannelVisibilityState(
        initiator: MessageComponentInteraction<"cached">,
        channel: VoiceChannel,
        newState: ChannelVisibilityState
    ) {
        let result = false;

        const roles = await this.getStateRoles( channel );

        switch ( newState ) {
            case "shown":
                await PermissionsManager.$.editChannelAudiencePermissions( channel, roles, {
                    ViewChannel: null
                } )
                    .catch( ( error ) => {
                        this.logger.error( this.editChannelVisibilityState, "", error );
                    } )
                    .then( () => {
                        result = true;
                    } );
                break;

            case "hidden":
                await PermissionsManager.$.ensureChannelBotConnectivityPermissions( channel );
                await PermissionsManager.$.editChannelAudiencePermissions( channel, roles, {
                    ViewChannel: false
                } )
                    .catch( ( error ) => {
                        this.logger.error( this.editChannelVisibilityState, "", error );
                    } )
                    .then( () => {
                        result = true;
                    } );
                break;

            default:
                this.logger.error(
                    this.editChannelVisibilityState,
                    `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
                                        `Could not change state of dynamic channel: '${ channel.name }' to state: '${ newState }'`
                );
        }

        await this.log( initiator, channel, this.editChannelVisibilityState, newState, { result } );

        if ( result ) {
            await UserMasterChannelDataModel.$.setDataByDynamicChannel( initiator.user.id, channel, {
                dynamicChannelVisibilityState: newState
            } );

            this.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    /**
    * @since 0.0.8
    */
    public async editChannelPrivacyState(
        initiator: MessageComponentInteraction<"cached">,
        channel: VoiceChannel,
        newState: ChannelPrivacyState
    ) {
        let result = false;
        let state: ChannelState = "unknown",
            visibilityState: ChannelVisibilityState = "unknown";

        const roles = await this.getStateRoles( channel );

        switch ( newState ) {
            case "public":
            case "private":
                state = newState;
                visibilityState = "shown";

                break;
            case "shown":
            case "hidden":
                state = "public";
                visibilityState = newState;

                break;
            default:
                this.logger.error(
                    this.editChannelPrivacyState,
                    `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
                                        `Could not change state of dynamic channel: '${ channel.name }' to state: '${ newState }'`
                );
        }

        // Check if the state is already the same
        const currentState = await this.getChannelState( channel ),
            currentVisibilityState = await this.getChannelVisibilityState( channel );

        this.logger.info(
            this.editChannelPrivacyState,
            `Guild id: '${ channel.guild.id }', channel id: ${ channel.id } - ` +
                                `Current state: '${ currentState }', current visibility state: '${ currentVisibilityState }', ` +
                                `New state: '${ state }', new visibility state: '${ visibilityState }'`
        );

        if ( currentState !== state || currentVisibilityState !== visibilityState ) {
            await PermissionsManager.$.ensureChannelBotConnectivityPermissions( channel );

            const editStatePromise = PermissionsManager.$.editChannelAudiencePermissions( channel, roles, {
                Connect: state === "public",
                ViewChannel: visibilityState === "shown"
            } );

            await editStatePromise
                .catch( ( error ) => this.logger.error( this.editChannelPrivacyState, "", error ) )
                .then( () => ( result = true ) );
        }

        await this.log( initiator, channel, this.editChannelPrivacyState, newState, { result } );

        if ( result ) {
            await UserMasterChannelDataModel.$.setDataByDynamicChannel( initiator.user.id, channel, {
                dynamicChannelState: state,
                dynamicChannelVisibilityState: visibilityState
            } );

            this.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    /**
                     * @since 0.0.8
                     */
    public async editChannelRegion(
        initiator: MessageComponentInteraction<"cached">,
        channel: VoiceChannel,
        newRegion: string
    ) {
        let result = false;

        if ( channel.rtcRegion !== newRegion ) {
            await channel
                .setRTCRegion( newRegion === "auto" ? null : newRegion )
                .catch( ( error ) => this.logger.error( this.editChannelRegion, "", error ) )
                .then( () => ( result = true ) );
        }

        await this.log( initiator, channel, this.editChannelRegion, newRegion, { result } );

        if ( result ) {
            await UserMasterChannelDataModel.$.setDataByDynamicChannel( initiator.user.id, channel, {
                dynamicChannelRegion: newRegion
            } );

            this.editPrimaryMessageDebounce( channel );
        }

        return result;
    }

    public async editChannelOwner(
        newOwnerId: string,
        previousOwnerId: string,
        channel: VoiceChannel,
        from: "claim" | "transfer"
    ) {
        const logError = () => {
            this.logger.error(
                this.editChannelOwner,
                `Guild id: '${ channel.guild.id }' channel id: ${ channel.id } - ` +
                                    `Could not change owner of dynamic channel: '${ channel.name }' from owner id: '${ previousOwnerId }' to owner id: '${ newOwnerId }'`
            );
        };

        if ( !newOwnerId || !previousOwnerId ) {
            return logError();
        }

        const masterChannel = await this.services.channelService.getMasterChannelByDynamicChannelId( channel.id );

        if ( !masterChannel ) {
            return logError();
        }

        const masterChannelDB = await ChannelModel.$.getByChannelId( masterChannel.id );
        if ( !masterChannelDB ) {
            return logError();
        }

        if ( !( await UserModel.$.transferData( previousOwnerId, newOwnerId, masterChannelDB.id ) ) ) {
            return logError();
        }

        // Delete cache.
        await this.services.channelService.update( {
            channel,
            userOwnerId: newOwnerId
        } );

        await this.updateChannelOwnership( channel, previousOwnerId, newOwnerId, from );
    }

    public async updateChannelOwnership(
        channel: VoiceChannel,
        previousOwnerId: string,
        newOwnerId: string,
        from: "claim" | "transfer"
    ) {
        this.logger.info(
            this.updateChannelOwnership,
            `Guild id: '${ channel.guild.id }' channel id: ${ channel.id } - ` +
                                `Changing owner of dynamic channel: '${ channel.name }' from owner id: '${ previousOwnerId }' to owner id: '${ newOwnerId }'`
        );

        const previousOwner = channel.guild.members.cache.get( previousOwnerId ),
            newOwner = channel.guild.members.cache.get( newOwnerId );

        await this.log( undefined, channel, this.editChannelOwner, from, { previousOwner, newOwner } );

        // Hand the channel over in place: keep what it already is - its privacy state, its trusted
        // and blocked users - drop the previous owner's grant and give the new owner theirs.
        //
        // This used to rebuild the overwrites from the master channel, which reset a private or
        // hidden channel back to public and discarded every trusted and blocked user, and it passed
        // no owner permissions at all, so the new owner was left holding an empty overwrite.
        const permissionOverwrites = PermissionsManager.$.mergeChannelPermissionOverwrites(
            [ ...channel.permissionOverwrites.cache.values() ].filter(
                ( overwrite ) => overwrite.id !== previousOwnerId
            ),
            [ {
                id: newOwnerId,
                ...DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
            } ]
        );

        // # NOTE: This is will trigger editPrimaryMessage() function, TODO: Such logic should be handled using command pattern.
        await channel.edit( { permissionOverwrites } );

        this.editPrimaryMessageDebounce( channel );
    }

    public async editPrimaryMessage( channel: VoiceChannel ) {
        this.logger.log(
            this.editPrimaryMessage,
            `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Editing primary message request, channel: '${ channel.name }'`
        );

        const message = await this.getPrimaryMessage( channel );

        if ( !message ) {
            this.logger.warn(
                this.editPrimaryMessage,
                `Guild id: '${ channel.guildId }' - Cannot find primary message in channel id: '${ channel.id }'`
            );
            return;
        }

        // If the owner not matching the owner from db, then we need to update the message.
        const dynamicChannelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( !dynamicChannelDB ) {
            this.logger.error(
                this.editPrimaryMessage,
                `Guild id: '${ channel.guildId }' - Failed to find channel id: '${ channel.id }' in database`
            );
            return;
        }

        const masterChannelDB = await ChannelModel.$.getByChannelId( dynamicChannelDB.ownerChannelId as string );

        const editMessageArgs: {
            ownerId: string;
            channel: VoiceChannel;
            dynamicChannelMentionable?: boolean;
            memberRoleIds?: string[];
        } = {
            ownerId: dynamicChannelDB.userOwnerId,
            channel
        };

        const memberRoleIds = await this.getMemberRoleIds( channel, dynamicChannelDB.userOwnerId );

        if ( memberRoleIds.length ) {
            editMessageArgs.memberRoleIds = memberRoleIds;
        }

        if ( masterChannelDB ) {
            editMessageArgs.dynamicChannelMentionable = await MasterChannelDataManager.$.getChannelMentionable(
                masterChannelDB,
                true
            );
        }

        const dynamicChannelAdapter = await this.services.uiVersioningAdapterService.get(
            "VertixBot/DynamicChannelAdapter",
            channel
        );

        await dynamicChannelAdapter
            ?.editMessage( message, editMessageArgs )
            .catch( ( e: any ) => this.logger.error( this.editPrimaryMessage, "", e ) )
            .then( () =>
                this.logger.info(
                    this.editPrimaryMessage,
                    `Guild id: '${ channel.guildId }' channel id: '${ channel.id }' - Editing primary message with id: '${ message.id }' succeeded`
                )
            );
    }

    public editPrimaryMessageDebounce( channel: VoiceChannel, delay = 800 ) {
        // TODO: Constant.
        this.logger.log(
            this.editPrimaryMessageDebounce,
            `Guild id: '${ channel.guildId }' - Editing primary message in channel id: '${ channel.id }'`
        );

        const callback = async() => {
            await this.editPrimaryMessage( channel );

            this.editMessageDebounceMap.delete( channel.id );
        };

        const key = channel.id;

        let timeoutId = this.editMessageDebounceMap.get( key );

        if ( timeoutId ) {
            this.editMessageDebounceMap.delete( channel.id );
            clearTimeout( timeoutId );
        }

        timeoutId = setTimeout( callback, delay );

        this.editMessageDebounceMap.set( key, timeoutId );
    }

    public async clearChat( initiator: MessageComponentInteraction<"cached">, channel: VoiceChannel ) {
        let result: IDynamicClearChatResult = {
            code: DynamicClearChatResultCode.Error
        };

        const error = ( e: any ) => {
            this.logger.error( this.clearChat, "", e );
        };

        await channel.messages
            .fetch()
            .then( async( messages ) => {
                // Remove non-embedded messages.
                const messagesToDelete = messages.filter( ( message ) => !message.embeds.length );

                if ( !messagesToDelete.size ) {
                    result.code = DynamicClearChatResultCode.NothingToDelete;
                    return;
                }

                // `.catch()` before `.then()` swallowed the rejection and then ran the success
                // branch anyway, so a delete the bot had no permission for was reported as done.
                //
                // `filterOld` drops anything past the two week bulk delete window instead of
                // rejecting the whole call over it, and the count comes from what discord actually
                // removed rather than from what was asked for.
                await channel
                    .bulkDelete( messagesToDelete, true )
                    .then( ( deletedMessages ) => {
                        result.code = DynamicClearChatResultCode.Success;
                        result.deletedCount = deletedMessages.size;
                    } )
                    .catch( error );
            } )
            .catch( error );

        await this.log( initiator, channel, this.clearChat, "", { result } );

        return result;
    }

    // Now need to see how it will know which model version to use.
    public async resetChannel(
        initiator: MessageComponentInteraction<"cached">,
        channel: VoiceChannel,
        options = {
            includeRegion: false,
            includePrimaryMessage: false
        }
    ): Promise<IDynamicResetChannelResult> {
        let result: IDynamicResetChannelResult = {
            code: DynamicResetChannelResultCode.Error
        };

        this.logger.log(
            this.resetChannel,
            `Guild id: '${ channel.guildId }', channel id: ${ channel.id } - Reset Channel button has been clicked, channel: '${ channel.name }'`
        );

        // Find the "master" channel.
        const master = await this.services.channelService.getMasterChannelAndDBbyDynamicChannelId( channel.id );

        if ( !master ) {
            this.logger.error(
                this.resetChannel,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Failed to find master channel in database`
            );
            return result;
        }

        const dynamicChannelDB = await ChannelModel.$.getByChannelId( channel.id );

        if ( !dynamicChannelDB ) {
            this.logger.error(
                this.resetChannel,
                `Guild id: '${ channel.guildId }', channel id: '${ channel.id }' - Failed to find channel in database`
            );
            return result;
        }

        // The owner of the channel being reset. `master.db.userOwnerId` is the admin who ran setup,
        // and reading it from there renamed the channel after them and handed them the owner grant.
        const userOwnerId = dynamicChannelDB.userOwnerId;

        const previousChannelState = await this.getChannelConfiguration( channel, userOwnerId, master.db.id, options ),
            defaultDynamicChannelTemplateName = await MasterChannelDataManager.$.getChannelNameTemplate(
                master.db,
                true
            );

        const ownerMember = channel.guild.members.cache.get( userOwnerId );
        const ownerGameName = ownerMember ? this.getUserCurrentGame( ownerMember ) : null;
        const defaultDynamicChannelName = await this.assembleChannelNameTemplate( defaultDynamicChannelTemplateName!, {
            userDisplayName: await guildGetMemberDisplayName( channel.guild, userOwnerId ),
            state: await this.getChannelState( channel ),
            gameName: ownerGameName,
            index: await this.getDynamicChannelTemplateIndex(
                channel.guild.id,
                master.db.channelId,
                channel.id,
                defaultDynamicChannelTemplateName!
            )
        } );

        const renameResult = await this.editChannelNameInternal( channel, defaultDynamicChannelName );

        if ( renameResult.code === DynamicEditChannelNameInternalResultCode.RateLimit ) {
            result.code = DynamicResetChannelResultCode.SuccessRenameRateLimit;
            result.rateLimitRetryAfter = renameResult.retryAfter;
        }

        // TODO: Ensure it works.
        result.code = DynamicResetChannelResultCode.Success;

        // Edit channel, Take defaults from master channel
        const success = await channel
            .edit( {
                ...PermissionsManager.$.getChannelDefaultPermissions(
                    userOwnerId,
                    master.channel,
                    DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS
                ),
                ...this.getChannelDefaultInheritedProperties( master.channel )
            } )
            .catch( ( e: any ) => this.logger.error( this.resetChannel, "", e ) )
            .then( () => true );

        if ( success ) {
            await this.log( initiator, channel, this.resetChannel, "done", {} );

            if ( options.includePrimaryMessage ) {
                const { dynamicChannelPrimaryMessageTitle, dynamicChannelPrimaryMessageDescription } =
                    this.configV3.data.constants;

                // TODO: `UserMasterChannelDataModel.$.setPrimaryMessageDefaults`
                // await UserChannelDataModelV3.$.setPrimaryMessage( userOwnerId, master.db.id, {
                //     title: dynamicChannelPrimaryMessageTitle,
                //     description: dynamicChannelPrimaryMessageDescription,
                // } );

                await UserMasterChannelDataModel.$.setPrimaryMessage( userOwnerId, master.db.id, {
                    title: dynamicChannelPrimaryMessageTitle,
                    description: dynamicChannelPrimaryMessageDescription
                } );
            }

            const currentChannelState = await this.getChannelConfiguration( channel, userOwnerId, master.db.id, options );

            result.oldState = previousChannelState;
            result.newState = currentChannelState;

            const userData: Partial<MasterChannelUserDataInterface> = {
                dynamicChannelName: currentChannelState.name,
                dynamicChannelUserLimit: currentChannelState.userLimit,
                dynamicChannelState: currentChannelState.state,
                dynamicChannelVisibilityState: currentChannelState.visibilityState,
                dynamicChannelAllowedUserIds: currentChannelState.allowedUserIds,
                dynamicChannelBlockedUserIds: currentChannelState.blockedUserIds
            };

            if ( options.includeRegion ) {
                userData.dynamicChannelRegion = currentChannelState.region;
            }

            await UserMasterChannelDataModel.$.setDataByDynamicChannel( initiator.user.id, channel, userData );

            this.editPrimaryMessageDebounce( channel );
        } else {
            await this.log( initiator, channel, this.resetChannel, "error", {} );
        }

        return result;
    }

    public async addUserAccess(
        initiator: MessageComponentInteraction<"cached">,
        channel: VoiceChannel,
        member: GuildMember,
        permissions: PermissionsBitField
    ): Promise<AddStatus> {
        let result: AddStatus = "error";

        if ( member.id === channel.client.user.id ) {
            result = "action-on-bot-user";

            await this.log( initiator, channel, this.addUserAccess, result, { member, permissions } );

            return result;
        }

        // Grant his self.
        if ( member.id === initiator.user.id ) {
            result = "self-grant";

            await this.log( initiator, channel, this.addUserAccess, result, { member, permissions } );

            return result;
        }

        // Already granted.
        if ( channel.permissionOverwrites.cache.get( member.id )?.allow.has( permissions ) ) {
            result = "already-granted";

            await this.log( initiator, channel, this.addUserAccess, result, { member, permissions } );

            return result;
        }

        // Transfer permissions to options.
        const permissionsOptions: PermissionOverwriteOptions = {};
        for ( const permission of permissions.toArray() ) {
            permissionsOptions[ permission ] = true;
        }

        await channel.permissionOverwrites
            .create( member, permissionsOptions )
            .then( () => ( result = "success" ) )
            .catch( ( e: any ) => this.logger.error( this.addUserAccess, "", e ) );

        if ( "error" !== result ) {
            await this.updateUserDataPermissionLists( initiator as Interaction, channel );
        }

        await this.log( initiator, channel, this.addUserAccess, result, { member, permissions } );

        return result;
    }

    public async editUserAccess(
        initiator: MessageComponentInteraction<"cached">,
        channel: VoiceChannel,
        member: GuildMember,
        permissions: PermissionsBitField,
        state: boolean
    ): Promise<EditStatus> {
        let result: EditStatus = "error";

        if ( member.id === channel.client.user.id ) {
            result = "action-on-bot-user";

            await this.log( initiator, channel, this.editUserAccess, result, { member, permissions, state } );

            return result;
        }

        // Edit his self.
        if ( member.id === initiator.user.id ) {
            result = "self-edit";

            await this.log( initiator, channel, this.editUserAccess, result, { member, permissions, state } );

            return result;
        }

        // Check if permissions are already set.
        const alreadyHave =
            ( state && channel.permissionOverwrites.cache.get( member.id )?.allow.has( permissions ) ) ||
                            ( !state && channel.permissionOverwrites.cache.get( member.id )?.deny.has( permissions ) );

        if ( alreadyHave ) {
            result = "already-have";

            await this.log( initiator, channel, this.editUserAccess, result, { member, permissions, state } );

            return result;
        }

        // Transform permissions to options.
        const permissionsOptions: PermissionOverwriteOptions = {};
        for ( const permission of permissions.toArray() ) {
            permissionsOptions[ permission ] = state;
        }

        await channel.permissionOverwrites
            .edit( member, permissionsOptions )
            .then( () => ( result = "success" ) )
            .catch( ( e: any ) => this.logger.error( this.editUserAccess, "", e ) );

        if ( "error" !== result ) {
            await this.updateUserDataPermissionLists( initiator as Interaction, channel );
        }

        await this.log( initiator, channel, this.editUserAccess, result, { member, permissions, state } );

        return result;
    }

    public async removeUserAccess(
        initiator: MessageComponentInteraction<"cached">,
        channel: VoiceChannel,
        member: GuildMember,
        force = false
    ): Promise<RemoveStatus> {
        let result: RemoveStatus = "error";

        if ( member.id === channel.client.user.id ) {
            result = "action-on-bot-user";

            await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

            return result;
        }

        // Grant his self.
        if ( member.id === initiator.user.id ) {
            result = "self-deny";

            await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

            return result;
        }

        // Not even granted.
        if ( !channel.permissionOverwrites.cache.has( member.id ) ) {
            result = "not-in-the-list";

            await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

            return result;
        }

        // Check if user permissions are set to deny.
        if (
            !force &&
                            channel.permissionOverwrites.cache.get( member.id )?.deny.has( DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS )
        ) {
            result = "user-blocked";

            await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

            return result;
        }

        await channel.permissionOverwrites
            .delete( member )
            .then( () => ( result = "success" ) )
            .catch( ( e: any ) => this.logger.error( this.removeUserAccess, "", e ) );

        if ( "error" !== result ) {
            await this.updateUserDataPermissionLists( initiator as Interaction, channel );
        }

        await this.log( initiator, channel, this.removeUserAccess, result, { member, force } );

        return result;
    }

    public async kickUser(
        initiator: MessageComponentInteraction<"cached">,
        channel: VoiceChannel,
        member: GuildMember
    ): Promise<ActStatus> {
        let result: ActStatus = "error";

        if ( member.id === channel.client.user.id ) {
            result = "action-on-bot-user";

            await this.log( initiator, channel, this.kickUser, result, { member } );

            return result;
        }

        // Kick his self.
        if ( member.id === initiator.user.id ) {
            result = "self-action";

            await this.log( initiator, channel, this.kickUser, result, { member } );

            return result;
        }

        // Check if a member is in the channel.
        if ( !channel.members.has( member.id ) ) {
            result = "not-in-the-list";

            await this.log( initiator, channel, this.kickUser, result, { member } );

            return result;
        }

        await member.voice
            .setChannel( null )
            .then( () => ( result = "success" ) )
            .catch( ( e: any ) => this.logger.error( this.kickUser, "", e ) );

        await this.log( initiator, channel, this.kickUser, result, { member } );

        return result;
    }

    public isPrimaryMessage( message: Message<true> | undefined ) {
        // TODO: Find better way to check if message is primary.
        return (
            message?.author?.id === this.services.appService.getClient().user.id &&
                            message?.embeds?.[ 0 ]?.title?.at( 0 ) === "༄"
        );
    }

    public async isChannelOwner( ownerId: string | undefined, channelId: string ) {
        this.logger.debug( this.isChannelOwner, `Channel id: '${ channelId }' - Checking if owner id: '${ ownerId }'` );

        if ( !ownerId ) {
            this.logger.error(
                this.isChannelOwner,
                `Channel id: '${ channelId }' - Could not find owner id: '${ ownerId }'`
            );
            return false;
        }

        // Check if an owner left the channel.
        const dynamicChannelDB = await ChannelModel.$.getByChannelId( channelId );
        if ( !dynamicChannelDB ) {
            this.logger.error(
                this.isChannelOwner,
                `Channel id: '${ channelId }' - Could not find dynamic channel in database`
            );
            return false;
        }

        return dynamicChannelDB.userOwnerId === ownerId;
    }

    private async getVerifiedRoles( dynamicChannel: VoiceBasedChannel ) {
        const roles = [],
            masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( dynamicChannel.id );

        if ( masterChannelDB ) {
            const verifiedRoles =
                ( await MasterChannelDataManager.$.getChannelVerifiedRoles( masterChannelDB, dynamicChannel.guildId ) ) ||
                                [];

            // If we found verified roles, use them
            if ( verifiedRoles.length > 0 ) {
                roles.push( ...verifiedRoles );
            } else {
                // Otherwise, fallback to the guild's everyone role
                roles.push( dynamicChannel.guild.roles.everyone.id );
            }
        } else {
            roles.push( dynamicChannel.guild.roles.everyone.id );
        }

        return roles;
    }

    /**
     * Function getStateRoles() :: The roles a privacy state change is written onto.
     *
     * The audience minus the staff roles. A role can be both, and being staff is the promise that
     * no state ever shuts it out, so writing the state deny onto it would take away the very thing
     * the staff list grants. Its overwrite is left as the staff grant put it.
     */
    private async getStateRoles( dynamicChannel: VoiceBasedChannel ) {
        const roles = await this.getVerifiedRoles( dynamicChannel ),
            masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( dynamicChannel.id );

        if ( ! masterChannelDB ) {
            return roles;
        }

        const staffRoles = await MasterChannelDataManager.$.getChannelStaffRoles( masterChannelDB );

        if ( ! staffRoles.length ) {
            return roles;
        }

        return roles.filter( ( roleId ) => ! staffRoles.includes( roleId ) );
    }

    private getDeniedFlagCount( channel: VoiceBasedChannel, roles: string[], flag: bigint ) {
        let count = 0;

        for ( const roleId of roles ) {
            const permissions = channel.permissionOverwrites.cache.get( roleId );

            if ( permissions?.deny.has( flag ) ) {
                count++;
            }
        }

        return count;
    }

    private async isVerifiedRolesDeniedFlag( channel: VoiceBasedChannel, flag: bigint ) {
        return this.isRolesDeniedFlag( channel, await this.getVerifiedRoles( channel ), flag );
    }

    /**
     * Function isRolesDeniedFlag() :: Tells whether the flag is denied for every one of the given
     * roles that carries an overwrite at all.
     *
     * Roles without an explicit overwrite are ignored, and a channel where none of them has one is
     * not denied - it is public by default.
     */
    private isRolesDeniedFlag( channel: VoiceBasedChannel, roles: string[], flag: bigint ) {
        const rolesWithOverrides = roles.filter( ( roleId ) => channel.permissionOverwrites.cache.has( roleId ) );

        if ( ! rolesWithOverrides.length ) {
            return false;
        }

        return this.getDeniedFlagCount( channel, rolesWithOverrides, flag ) === rolesWithOverrides.length;
    }

    private async updateUserDataPermissionLists( initiator: Interaction, channel: VoiceChannel ) {
        const allowedUsers = await this.getChannelUserIdsWithPermissionState(
            channel,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
            true,
            true
        );

        const blockedUsers = await this.getChannelUserIdsWithPermissionState(
            channel,
            DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS,
            false,
            true
        );

        await UserMasterChannelDataModel.$.setDataByDynamicChannel( initiator.user.id, channel, {
            dynamicChannelAllowedUserIds: allowedUsers,
            dynamicChannelBlockedUserIds: blockedUsers
        } );
    }

    private async log(
        initiator: ModalSubmitInteraction<"cached"> | MessageComponentInteraction<"cached"> | undefined,
        channel: VoiceChannel,
        caller: Function,
        action: string,
        meta: any
    ) {
        const initiatorDisplayName = initiator?.member.displayName || "not provided";

        let masterChannelId = "";

        let message = "";

        const adminLogSuffix = `'${ channel.name }'`,
            ownerLogSuffix = `${ adminLogSuffix } '${ channel.guild.name }' (${ channel.guild?.memberCount }) '${ channel.id }' '${ channel.guildId }'`;

        switch ( caller ) {
            case this.onLeaveDynamicChannel:
                message = `➖ Dynamic channel has been **deleted**, owner: \`${ meta.ownerDisplayName }\``;
                break;

            case this.onLeaveDynamicChannelEmpty:
                message = `➖ Dynamic channel has been **deleted**, owner: \`${ meta.ownerDisplayName }\``;
                break;

            case this.createDynamicChannel:
                if ( meta.newState.channel ) {
                    masterChannelId = meta.newState.channel.id;
                }

                message = `➕  Dynamic channel has been **created**, owner: \`${ meta.ownerDisplayName }\``;
                break;

            case this.editChannelName:
                switch ( action as "badword" | "limited" | "success" ) {
                    case "badword":
                        message = `✏️ \`${ initiatorDisplayName }\` tried to edit channel name from \`${ meta.oldChannelName }\` to \`${ meta.newChannelName }\` but failed 🙅 due bad-word: \`${ meta.result.badword }\``;
                        break;

                    case "limited":
                        message = `✏️ \`${ initiatorDisplayName }\` tried to edit channel name from \`${ meta.oldChannelName }\` to \`${ meta.newChannelName }\` but failed due rate limit, changed names too fast`;
                        break;

                    case "success":
                        message = `✏️ \`${ initiatorDisplayName }\` edited channel name from \`${ meta.oldChannelName }\` to \`${ meta.newChannelName }\``;
                        break;
                }
                break;

            case this.editUserLimit:
                if ( !meta.result ) {
                    message = `✋ \`${ initiatorDisplayName }\` tried to edit user limit but failed due unknown error`;
                    break;
                }

                message = `✋ \`${ initiatorDisplayName }\` edited user limit from \`${ meta.oldLimit }\` to \`${ meta.newLimit }\``;
                break;

            case this.editChannelState:
                if ( !meta.result ) {
                    message = `🌐/🚫 \`${ initiatorDisplayName }\` tried to set channel state but failed due unknown error`;
                    break;
                }

                switch ( action as ChannelState ) {
                    case "public":
                        message = `🌐 \`${ initiatorDisplayName }\` set channel to **public**`;
                        break;

                    case "private":
                        message = `🚫 \`${ initiatorDisplayName }\` set channel to **private**`;
                        break;
                }
                break;

            case this.editChannelVisibilityState:
                if ( !meta.result ) {
                    message = `🐵️/🙈 \`${ initiatorDisplayName }\` tried to set channel visibility but failed due unknown error`;
                    break;
                }

                switch ( action as ChannelVisibilityState ) {
                    case "shown":
                        message = `🐵️ \`${ initiatorDisplayName }\` set channel to visibility **shown**`;
                        break;

                    case "hidden":
                        message = `🙈 \`${ initiatorDisplayName }\` set channel to visibility **hidden**`;
                        break;
                }
                break;

            case this.editChannelPrivacyState:
                if ( !meta.result ) {
                    message = `🐵️/🙈/🌐/🚫 \`${ initiatorDisplayName }\` tried to set channel privacy state but failed due unknown error`;
                    break;
                }

                switch ( action as ChannelPrivacyState ) {
                    case "shown":
                    case "hidden":
                        await this.log( initiator, channel, this.editChannelVisibilityState, action, meta );
                        break;

                    case "public":
                    case "private":
                        await this.log( initiator, channel, this.editChannelState, action, meta );
                        break;
                }
                break;

            case this.editChannelRegion:
                if ( !meta.result ) {
                    message = `🌍 \`${ initiatorDisplayName }\` tried to set channel region but failed due unknown error`;
                    break;
                }

                message = `🌍 \`${ initiatorDisplayName }\` set channel region to **${ action }**`;
                break;

            case this.editChannelOwner:
                const previousOwner = meta.previousOwner?.displayName || "unknown",
                    newOwner = meta.newOwner?.displayName || "unknown";

                switch ( action as "claim" | "transfer" ) {
                    case "claim":
                        message = `😈 \`${ newOwner }\` has been claimed **ownership** of channel`;

                        if ( previousOwner === newOwner ) {
                            message += " the same owner, just reclaimed his channel";
                        } else {
                            message += ` \`${ previousOwner }\` is not channel owner anymore`;
                        }
                        break;

                    case "transfer":
                        message = `🔀 \`${ previousOwner }\` has been transfer **ownership** of channel to \`${ newOwner }\``;
                        break;
                }
                break;

            case this.clearChat:
                switch ( meta.result.code ) {
                    case "nothing-to-delete":
                        message = `🧹 \`${ initiatorDisplayName }\` trying to clear chat but there are no message to delete`;
                        break;

                    case "success":
                        message = `🧹 \`${ initiatorDisplayName }\` clear chat has been successfully cleared **${ meta.result.deletedCount }** messages`;
                        break;

                    default:
                        message = `🧹 \`${ initiatorDisplayName }\` trying to clear chat but it failed due unknown error`;
                }
                break;

            case this.resetChannel:
                switch ( action as "vote" | "done" | "error" ) {
                    case "error":
                        message = `🔄 \`${ initiatorDisplayName }\` tried to reset channel but failed due unknown error`;
                        break;

                    case "vote":
                        message = `🔄 \`${ initiatorDisplayName }\` requested to vote for using premium feature`;
                        break;

                    case "done":
                        message = `🔄 \`${ initiatorDisplayName }\` reset channel has been successfully **restored** the channel`;
                        break;
                }
                break;

            case this.addUserAccess:
                if ( DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS === meta.permissions ) {
                    // Blocking user access.
                    const tryingPrefix = `☝️ \`${ initiatorDisplayName }\` trying grant user access on: \`${ meta.member.displayName }\``;

                    switch ( action as AddStatus ) {
                        case "error":
                            message = `${ tryingPrefix } - Failed due unknown error`;
                            break;

                        case "action-on-bot-user":
                            message = `${ tryingPrefix } - Nothing done, doing that on **Vertix** are not allowed`;
                            break;

                        case "self-grant":
                            message = `${ tryingPrefix } - Nothing done, cannot do that on his **self**`;
                            break;

                        case "already-granted":
                            message = `${ tryingPrefix } - Nothing done, **already** granted`;
                            break;

                        case "success":
                            message = `☝️ \`${ initiatorDisplayName }\` has **granted** access for: \`${ meta.member.displayName }\``;
                            break;
                    }
                } else {
                    message = "Unknown error when trying to edit user access.";
                }
                break;

            case this.editUserAccess:
                if ( !meta.state && DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS === meta.permissions ) {
                    // Blocking user access.
                    const tryingPrefix = `🫵 \`${ initiatorDisplayName }\` trying block user access on: \`${ meta.member.displayName }\``;

                    switch ( action as EditStatus ) {
                        case "error":
                            message = `${ tryingPrefix } - Failed due unknown error`;
                            break;

                        case "action-on-bot-user":
                            message = `${ tryingPrefix } - Nothing done, doing that on **Vertix** are not allowed`;
                            break;

                        case "self-edit":
                            message = `${ tryingPrefix } - Nothing done, cannot do that on his **self**`;
                            break;

                        case "already-have":
                            message = `${ tryingPrefix } - Nothing done, **already** blocked`;
                            break;

                        case "success":
                            message = `🫵 \`${ initiatorDisplayName }\` has **blocked** access for: \`${ meta.member.displayName }\``;
                            break;
                    }
                } else {
                    message = "Unknown error when trying to edit user access.";
                }
                break;

            case this.removeUserAccess:
                const emoji = meta.force ? "🤙" : "👇",
                    context = meta.force ? "un-blocking" : "removing",
                    tryingPrefix = `${ emoji } \`${ initiatorDisplayName }\` trying ${ context } user access on: \`${ meta.member.displayName }\``;

                switch ( action as RemoveStatus ) {
                    case "error":
                        message = `${ tryingPrefix } - Failed due unknown error`;
                        break;

                    case "action-on-bot-user":
                        message = `${ tryingPrefix } - Nothing done, doing that on **Vertix** are not allowed`;
                        break;

                    case "self-deny":
                        message = `${ tryingPrefix } - Nothing done, cannot do that on his **self**`;
                        break;

                    case "not-in-the-list":
                        message = `${ tryingPrefix } - Nothing done, the user permissions **already** clear`;
                        break;

                    case "user-blocked":
                        message = `${ tryingPrefix } - Nothing done, the user is **blocked**`;
                        break;

                    case "success":
                        message = `${ emoji } \`${ initiatorDisplayName }\` **${ context }** access for: \`${ meta.member.displayName }\` succeeded`;
                        break;
                }
                break;

            case this.kickUser:
                const tryingKickPrefix = `👢 \`${ initiatorDisplayName }\` trying kick user: \`${ meta.member.displayName }\``;

                switch ( action as ActStatus ) {
                    case "error":
                        message = `${ tryingKickPrefix } - Failed due unknown error`;
                        break;

                    case "action-on-bot-user":
                        message = `${ tryingKickPrefix } - Nothing done, doing that on **Vertix** are not allowed`;
                        break;

                    case "self-action":
                        message = `${ tryingKickPrefix } - Nothing done, cannot do that on his **self**`;
                        break;

                    case "not-in-the-list":
                        message = `${ tryingKickPrefix } - Nothing done, the user not in the **channel**`;
                        break;

                    case "success":
                        message = `👢 \`${ initiatorDisplayName }\` has **kicked** user: \`${ meta.member.displayName }\``;
                }
                break;

            default:
                this.logger.error(
                    caller,
                    `Guild id:${ channel.guildId }, channel id: \`${ channel.id }\` - Unknown caller: \`${ caller.name }\``
                );
        }

        // Replace words that wrapped with **%word%** and wrap it with `pc.bold` for console.
        const messageForConsole = message
            .replace( /\*\*(.*?)\*\*/g, ( _match, p1 ) => pc.bold( p1 ) )
        // Replace words that wrapped with `` and wrap it with `pc.red` for console.
            .replace( /`(.*?)`/g, ( _match, p1 ) => pc.red( `"${ p1 }"` ) );

        this.logger.admin( caller, `${ messageForConsole } - ${ ownerLogSuffix }` );

        const masterChannelDB = masterChannelId
            ? await ChannelModel.$.getByChannelId( masterChannelId )
            : await ChannelModel.$.getMasterByDynamicChannelId( channel.id );

        if ( !masterChannelDB ) {
            this.logger.error(
                this.log,
                `Guild id:${ channel.guildId }, channel id: \`${ channel.id }\` - Cannot find master channel DB`
            );
            return;
        }

        await this.logInChannelDebounce( masterChannelDB, channel, message );
    }

    private async logInChannelDebounce(
        masterChannelDB: ChannelExtended,
        channel: VoiceChannel,
        message: string,
        defaultDebounceDelay = 3000
    ) {
        const logsChannelId = await MasterChannelDataManager.$.getChannelLogsChannelId( masterChannelDB );

        if ( !logsChannelId ) {
            return;
        }

        const logsChannel = channel.guild.channels.cache.get( logsChannelId ) as TextChannel;

        if ( !logsChannel ) {
            await MasterChannelDataManager.$.setChannelLogsChannel( masterChannelDB, null, false );

            this.logger.error(
                this.log,
                `Guild id:${ channel.guildId }, channel id: \`${ channel.id }\` - Cannot find logs channel`
            );
            return;
        }

        const embedBuilder = new EmbedBuilder();

        embedBuilder.setTimestamp( new Date() );
        embedBuilder.setDescription( "❯❯ " + message );
        embedBuilder.setColor( VERTIX_DEFAULT_COLOR_BRAND );
        embedBuilder.setFooter( {
            text: `Channel: \`${ channel.name }\` masterChannelId: \`${ masterChannelDB.channelId }\``
        } );

        const mapItem = this.logInChannelDebounceMap.get( logsChannelId );

        if ( !mapItem ) {
            this.logInChannelDebounceMap.set( logsChannel.id, {
                masterChannelDB,
                logsChannel,
                embeds: [ embedBuilder ],
                timer: setTimeout( this.logEmbeds.bind( this, logsChannelId ), defaultDebounceDelay )
            } );

            return;
        }

        clearTimeout( mapItem.timer );

        // If embeds reach 10, send them and reset the timer.
        if ( mapItem.embeds.length >= 10 ) {
            await this.logEmbeds( channel.id );
        }

        // Push embed and reset timer.
        mapItem.embeds.push( embedBuilder );

        mapItem.timer = setTimeout( this.logEmbeds.bind( this, logsChannelId ), defaultDebounceDelay );
    }

    private async logEmbeds( logsChannelId: string ) {
        const mapItem = this.logInChannelDebounceMap.get( logsChannelId );

        if ( !mapItem ) {
            this.logger.error( this.log, `Cannot find map item for logs channel id: \`${ logsChannelId }\`` );
            return;
        }

        if ( !mapItem.embeds.length ) {
            return;
        }

        const { masterChannelDB, logsChannel, embeds } = mapItem;

        await logsChannel.send( { embeds } ).catch( async( err ) => {
            this.logger.error( this.log, "", err );

            await MasterChannelDataManager.$.setChannelLogsChannel( masterChannelDB, null, false );
        } );

        mapItem.embeds = [];
    }

    private async editChannelNameInternal(
        channel: VoiceChannel,
        newChannelName: string
    ): Promise<IDynamicEditChannelNameInternalResult> {
        const result: IDynamicEditChannelNameInternalResult = {
            code: DynamicEditChannelNameInternalResultCode.Error
        };

        const promise = fetch( "https://discord.com/api/v10/" + Routes.channel( channel.id ), {
            method: "PATCH",
            headers: {
                Authorization: `Bot ${ gToken }`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify( {
                name: newChannelName
            } )
        } );

        const editResult: APIPartialChannel | RESTRateLimit = await promise
            .then( ( response ) => response.json() )
            .catch( ( error ) => this.logger.error( this.editChannelName, "", error ) );

        if ( "retry_after" in editResult ) {
            result.code = DynamicEditChannelNameInternalResultCode.RateLimit;
            result.retryAfter = editResult.retry_after;
        } else if ( "type" in editResult ) {
            result.code = DynamicEditChannelNameInternalResultCode.Success;
        }

        return result;
    }

    public async refreshControlPanels( client: Client<true>, chunkSize = 5, messageFetchLimit = 100 ) {
        this.logger.info( this.refreshControlPanels, "Starting control panels refresh..." );

        const guilds = [ ...client.guilds.cache.values() ];

        for ( let i = 0; i < guilds.length; i += chunkSize ) {
            const chunk = guilds.slice( i, i + chunkSize );

            await Promise.all( chunk.map( ( guild ) =>
                this.refreshControlPanelsForGuild( guild, messageFetchLimit )
            ) );
        }

        this.logger.info( this.refreshControlPanels, "Control panels refresh completed." );
    }

    public async refreshControlPanelsForGuild( guild: Guild, messageFetchLimit = 100 ) {
        const client = this.services.appService.getClient();
        const masterChannels = await ChannelModel.$.getMasters( guild.id );
        let refreshedCount = 0;

        for ( const masterChannelDB of masterChannels ) {
            const settings = await MasterChannelDataManager.$.getAllSettings( masterChannelDB );
            const controlChannelId = settings.dynamicChannelControlChannelId;

            if ( !controlChannelId ) {
                continue;
            }

            const controlChannel = guild.channels.cache.get( controlChannelId ) ??
                await guild.channels.fetch( controlChannelId ).catch( () => null );

            if ( !controlChannel || controlChannel.type !== ChannelType.GuildText ) {
                continue;
            }

            const panelAdapterName = masterChannelDB.version === VERSION_UI_V3
                ? "VertixBot/UI-V3/DynamicChannelPanelAdapter"
                : "VertixBot/UI-V2/DynamicChannelPanelAdapter";

            const panelAdapter = this.services.uiService.get( panelAdapterName );

            if ( !panelAdapter ) {
                continue;
            }

            const panelArgs = {
                dynamicChannelButtonsTemplate: settings.dynamicChannelButtonsTemplate,
                channelId: ""
            };

            const messages = await controlChannel.messages.fetch( { limit: messageFetchLimit } );
            const firstBotMessage = messages
                .filter( m => m.author.id === client.user.id )
                .sort( ( a, b ) => a.createdTimestamp - b.createdTimestamp )
                .first();

            if ( firstBotMessage ) {
                await panelAdapter.editMessage( firstBotMessage, panelArgs );
            } else {
                await panelAdapter.send( controlChannel, panelArgs );
            }

            refreshedCount++;
        }

        if ( refreshedCount > 0 ) {
            this.logger.info(
                this.refreshControlPanelsForGuild,
                `Guild '${ guild.name }' (${ guild.id }) - Refreshed ${ refreshedCount } control panel(s).`
            );
        }
    }

    /**
     * Handle refresh customization IPC action (called by ManagementIPCService).
     * Invalidates the customization cache and refreshes control panel messages
     * so dashboard-saved embed changes appear immediately on Discord.
     *
     * When guildId is "__default__", invalidates all caches and refreshes all guilds
     * because default customizations serve as the base layer for every guild.
     */
    public async handleRefreshCustomization( data: { guildId: string } ) {
        const { guildId } = data;

        this.logger.log(
            this.handleRefreshCustomization,
            `Refreshing customization for guild ${ guildId }`
        );

        if ( guildId === "__default__" ) {
            // Default customizations affect all guilds — invalidate everything
            GuildCustomizationManager.$.invalidateAllCache();

            // Refresh all control panels across all guilds
            const client = this.services.appService.getClient();
            await this.refreshControlPanels( client );

            // Refresh primary messages in all active dynamic channels across all guilds
            for ( const guild of client.guilds.cache.values() ) {
                await this.refreshDynamicChannelMessages( guild );
            }
            return;
        }

        // Invalidate customization cache so next build() reads fresh data from DB
        GuildCustomizationManager.$.invalidateCache( guildId );
        // Also invalidate __default__ since it's merged as a base layer
        GuildCustomizationManager.$.invalidateCache( "__default__" );

        this.logger.log(
            this.handleRefreshCustomization,
            `Cache invalidated for guild ${ guildId } and __default__`
        );

        // Refresh control panel messages with updated customization
        const guild = this.services.appService.getClient().guilds.cache.get( guildId );

        if ( guild ) {
            await this.refreshControlPanelsForGuild( guild );

            // Refresh primary messages in all active dynamic channels for this guild
            await this.refreshDynamicChannelMessages( guild );

            this.logger.log(
                this.handleRefreshCustomization,
                `Refreshed control panels and dynamic channel messages for guild ${ guildId }`
            );
        } else {
            this.logger.warn(
                this.handleRefreshCustomization,
                `Guild ${ guildId } not found in cache, skipping panel refresh`
            );
        }
    }

    /**
     * Refresh primary messages in all active dynamic channels for a guild.
     * Called after customization changes so existing channels pick up the new settings.
     */
    private async refreshDynamicChannelMessages( guild: Guild ) {
        try {
            const dynamicChannelsDB = await ChannelModel.$.getDynamics( guild.id );

            if ( !dynamicChannelsDB?.length ) {
                return;
            }

            let refreshedCount = 0;

            for ( const channelDB of dynamicChannelsDB ) {
                const channel = guild.channels.cache.get( channelDB.channelId );

                if ( !channel || !channel.isVoiceBased() ) {
                    continue;
                }

                try {
                    await this.editPrimaryMessage( channel as VoiceChannel );
                    refreshedCount++;
                } catch( error ) {
                    this.logger.warn(
                        this.refreshDynamicChannelMessages,
                        `Failed to refresh primary message for channel '${ channelDB.channelId }' in guild '${ guild.id }': ${ error }`
                    );
                }
            }

            if ( refreshedCount > 0 ) {
                this.logger.info(
                    this.refreshDynamicChannelMessages,
                    `Guild '${ guild.name }' (${ guild.id }) - Refreshed ${ refreshedCount } dynamic channel primary message(s).`
                );
            }
        } catch( error ) {
            this.logger.error(
                this.refreshDynamicChannelMessages,
                `Failed to refresh dynamic channel messages for guild '${ guild.id }': ${ error }`
            );
        }
    }

    private async onJoin( args: IChannelEnterGenericArgs ) {
        const { newState } = args;

        if ( await ChannelModel.$.isDynamic( newState.channelId! ) ) {
            await this.onJoinDynamicChannel( args );
        }
    }

    private async onLeave( args: IChannelLeaveGenericArgs ) {
        const { oldState } = args;

        if ( await ChannelModel.$.isDynamic( oldState.channelId! ) ) {
            await this.onLeaveDynamicChannel( args );
        }
    }

    private getUserCurrentGame( member: GuildMember ): string | null {
        const activity = member.presence?.activities.find( a => a.type === 0 && !!a.name ); // type 0 = Playing
        return activity?.name ?? null;
    }
}

export default DynamicChannelService;
