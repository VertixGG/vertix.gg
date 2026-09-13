import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { IPC_CHANNELS, IPC_REQUEST_ACTIONS } from "@vertix.gg/definitions/src/ipc-definitions";

import { DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS } from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";

import { VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { ChannelType } from "discord.js";

import type { NewsChannel, TextChannel } from "discord.js";

import type { IPCService, IPCMessage, IPCRequest } from "@vertix.gg/base/src/modules/ipc";

import type {
    IPCManagementRequestPayload,
    GetGuildOptionsResponse,
    GetConfigLimitsResponse
} from "@vertix.gg/definitions/src/ipc-definitions";

import type { GetScalingChannelInfoResponse } from "@vertix.gg/definitions/src/scaling-channel-ipc-definitions";

import type {
    GetDynamicChannelInfoResponse,
    DynamicChannelIPCManagementPayload
} from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

import type { MasterChannelConfigInterfaceV3 } from "@vertix.gg/data/src/interfaces/master-channel-config";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";
import type { ScalingChannelService } from "@vertix.gg/bot/src/services/scaling-channel-service";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

/**
 * Central IPC handler service that routes management messages to the appropriate service.
 *
 * This service subscribes to IPC channels and delegates:
 * - Scaling-related actions to ScalingChannelService
 * - Dynamic-related actions to DynamicChannelService
 */
export class ManagementIPCService extends ServiceWithDependenciesBase<{
    ipcService: IPCService;
    appService: AppService;
    scalingChannelService: ScalingChannelService;
    dynamicChannelService: DynamicChannelService;
}> {
    private readonly debugger: Debugger;

    public static getName() {
        return "VertixBot/Services/ManagementIPC";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this, "", isDebugEnabled( "SERVICE", ManagementIPCService.getName() ) );
    }

    public getDependencies() {
        return {
            ipcService: "VertixBase/Modules/IPCService",
            appService: "VertixBot/Services/App",
            scalingChannelService: "VertixBot/Services/ScalingChannel",
            dynamicChannelService: "VertixBot/Services/DynamicChannel"
        };
    }

    protected async initialize() {
        await super.initialize();

        // Subscribe to IPC channels in background - don't block service startup
        this.subscribeToIPCChannels().catch( () => {
            // Error already logged in subscribeToIPCChannels
        } );
    }

    private async subscribeToIPCChannels() {
        if ( !this.services.ipcService.isReady() ) {
            this.logger.warn( this.subscribeToIPCChannels, "IPC service not available - dashboard management features will be disabled" );
            return;
        }

        try {
            // Subscribe to pub/sub management channel for actions
            await this.services.ipcService.subscribe<DynamicChannelIPCManagementPayload>(
                IPC_CHANNELS.MANAGEMENT,
                this.handleIPCMessage.bind( this )
            );

            // Register request handler for channel info queries
            await this.services.ipcService.onRequest<
                IPCManagementRequestPayload,
                GetScalingChannelInfoResponse | GetDynamicChannelInfoResponse | GetGuildOptionsResponse
                | GetConfigLimitsResponse
            >(
                IPC_CHANNELS.MANAGEMENT_REQUEST,
                IPC_CHANNELS.MANAGEMENT_RESPONSE,
                this.handleIPCRequest.bind( this )
            );

            this.logger.log( this.subscribeToIPCChannels, "Subscribed to management IPC channels" );
        } catch {
            this.logger.warn( this.subscribeToIPCChannels, "Failed to subscribe to IPC channels - dashboard management features will be disabled" );
        }
    }

    private async handleIPCMessage( message: IPCMessage<DynamicChannelIPCManagementPayload> ) {
        const { payload } = message;

        this.logger.log( this.handleIPCMessage, `Received IPC message: ${ payload.action }` );

        switch ( payload.action ) {
            // Scaling-related actions -> ScalingChannelService
            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.CREATE_SCALING_SETUP:
                await this.services.scalingChannelService.handleCreateScalingSetup( payload.data );
                break;

            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.UPDATE_SCALING_SETTINGS:
                await this.services.scalingChannelService.handleUpdateScalingSettings( payload.data );
                break;

            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.TRIGGER_REINDEX:
                await this.services.scalingChannelService.handleTriggerReindex( payload.data );
                break;

            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.TRIGGER_CLEANUP:
                await this.services.scalingChannelService.handleTriggerCleanup( payload.data );
                break;

            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.DELETE_SCALING_SETUP:
                await this.services.scalingChannelService.handleDeleteScalingSetup( payload.data );
                break;

            // Dynamic-related actions -> DynamicChannelService
            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.CREATE_DYNAMIC_SETUP:
                await this.services.dynamicChannelService.handleCreateDynamicSetup( payload.data );
                break;

            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.UPDATE_DYNAMIC_SETTINGS:
                await this.services.dynamicChannelService.handleUpdateDynamicSettings( payload.data );
                break;

            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.DELETE_DYNAMIC_SETUP:
                await this.services.dynamicChannelService.handleDeleteDynamicSetup( payload.data );
                break;

            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.UPDATE_GUILD_SETTINGS:
                await this.services.dynamicChannelService.handleUpdateGuildSettings( payload.data );
                break;

            // Customization-related actions -> DynamicChannelService
            case DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.REFRESH_CUSTOMIZATION:
                await this.services.dynamicChannelService.handleRefreshCustomization( payload.data );
                break;

            default:
                this.logger.warn( this.handleIPCMessage, `Unknown action: ${ ( payload as DynamicChannelIPCManagementPayload ).action }` );
        }
    }

    /**
     * Function getGuildOptions() :: The roles and text channels of a guild the bot is in.
     *
     * Read from the cache the client already keeps, so the dashboard's pickers cost nothing and
     * work regardless of which application the api's own token belongs to.
     */
    private async getGuildOptions( guildId: string ): Promise<GetGuildOptionsResponse> {
        const guild = this.services.appService.getClient()?.guilds.cache.get( guildId );

        if ( !guild ) {
            this.logger.warn( this.getGuildOptions, `Guild not found: ${ guildId }` );

            return { roles: [], textChannels: [] };
        }

        return {
            // `@everyone` carries the guild's own id and is the default verified role, so it stays;
            // a role an integration owns cannot be handed out, so it does not.
            roles: guild.roles.cache
                .filter( ( role ) => !role.managed )
                .sort( ( a, b ) => b.position - a.position )
                .map( ( role ) => ( {
                    id: role.id,
                    name: role.id === guildId ? "@everyone" : role.name,
                    color: role.color
                } ) ),

            textChannels: guild.channels.cache
                .filter( ( channel ): channel is TextChannel | NewsChannel =>
                    ChannelType.GuildText === channel.type || ChannelType.GuildAnnouncement === channel.type )
                .sort( ( a, b ) => a.position - b.position )
                .map( ( channel ) => ( {
                    id: channel.id,
                    name: channel.name
                } ) )
        };
    }

    /**
     * Function getConfigLimits() :: The limits the configuration sets, read out of it.
     *
     * Out of the master channel config and nowhere else, which is where the number is written and
     * what everything else already reads. It belongs to the configuration rather than to a guild,
     * so it is the same answer for every one of them and nothing is passed in to ask about.
     */
    private getConfigLimits(): GetConfigLimitsResponse {
        const { constants } = ConfigManager.$.get<MasterChannelConfigInterfaceV3>(
            "Vertix/Config/MasterChannel",
            VERSION_UI_V3
        ).data;

        return { maxMasterChannels: constants.masterChannelMaximumFreeChannels };
    }

    private async handleIPCRequest(
        request: IPCRequest<IPCManagementRequestPayload>
    ): Promise<
        GetScalingChannelInfoResponse | GetDynamicChannelInfoResponse | GetGuildOptionsResponse
        | GetConfigLimitsResponse
    > {
        const { payload } = request;

        this.logger.log( this.handleIPCRequest, `Received IPC request: ${ payload.action }` );

        switch ( payload.action ) {
            case IPC_REQUEST_ACTIONS.GET_SCALING_CHANNEL_INFO:
                return this.services.scalingChannelService.getScalingChannelInfo(
                    payload.guildId,
                    payload.masterChannelId,
                    payload.scalingChannelIds
                );

            case IPC_REQUEST_ACTIONS.GET_DYNAMIC_CHANNEL_INFO:
                return this.services.dynamicChannelService.getDynamicChannelInfo(
                    payload.guildId,
                    payload.masterChannelId,
                    payload.dynamicChannelIds
                );

            case IPC_REQUEST_ACTIONS.GET_GUILD_OPTIONS:
                return this.getGuildOptions( payload.guildId );

            case IPC_REQUEST_ACTIONS.GET_CONFIG_LIMITS:
                return this.getConfigLimits();

            default:
                throw new Error( `Unknown request action: ${ ( payload as IPCManagementRequestPayload ).action }` );
        }
    }
}

export default ManagementIPCService;
