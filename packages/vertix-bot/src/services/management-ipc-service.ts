import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import {
    IPC_CHANNELS,
    MANAGEMENT_ACTIONS,
    MANAGEMENT_REQUEST_ACTIONS
} from "@vertix.gg/base/src/modules/ipc";

import type {
    IPCService,
    IPCMessage,
    IPCRequest,
    ManagementPayload,
    ManagementRequestPayload,
    GetScalingChannelInfoResponse,
    GetDynamicChannelInfoResponse
} from "@vertix.gg/base/src/modules/ipc";

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
            await this.services.ipcService.subscribe<ManagementPayload>(
                IPC_CHANNELS.MANAGEMENT,
                this.handleIPCMessage.bind( this )
            );

            // Register request handler for channel info queries
            await this.services.ipcService.onRequest<ManagementRequestPayload, GetScalingChannelInfoResponse | GetDynamicChannelInfoResponse>(
                IPC_CHANNELS.MANAGEMENT_REQUEST,
                IPC_CHANNELS.MANAGEMENT_RESPONSE,
                this.handleIPCRequest.bind( this )
            );

            this.logger.log( this.subscribeToIPCChannels, "Subscribed to management IPC channels" );
        } catch ( error ) {
            this.logger.warn( this.subscribeToIPCChannels, "Failed to subscribe to IPC channels - dashboard management features will be disabled" );
        }
    }

    private async handleIPCMessage( message: IPCMessage<ManagementPayload> ) {
        const { payload } = message;

        this.logger.log( this.handleIPCMessage, `Received IPC message: ${ payload.action }` );

        switch ( payload.action ) {
            // Scaling-related actions -> ScalingChannelService
            case MANAGEMENT_ACTIONS.CREATE_SCALING_SETUP:
                await this.services.scalingChannelService.handleCreateScalingSetup( payload.data );
                break;

            case MANAGEMENT_ACTIONS.UPDATE_SCALING_SETTINGS:
                await this.services.scalingChannelService.handleUpdateScalingSettings( payload.data );
                break;

            case MANAGEMENT_ACTIONS.TRIGGER_REINDEX:
                await this.services.scalingChannelService.handleTriggerReindex( payload.data );
                break;

            case MANAGEMENT_ACTIONS.TRIGGER_CLEANUP:
                await this.services.scalingChannelService.handleTriggerCleanup( payload.data );
                break;

            case MANAGEMENT_ACTIONS.DELETE_SCALING_SETUP:
                await this.services.scalingChannelService.handleDeleteScalingSetup( payload.data );
                break;

            // Dynamic-related actions -> DynamicChannelService
            case MANAGEMENT_ACTIONS.CREATE_DYNAMIC_SETUP:
                await this.services.dynamicChannelService.handleCreateDynamicSetup( payload.data );
                break;

            case MANAGEMENT_ACTIONS.UPDATE_DYNAMIC_SETTINGS:
                await this.services.dynamicChannelService.handleUpdateDynamicSettings( payload.data );
                break;

            case MANAGEMENT_ACTIONS.DELETE_DYNAMIC_SETUP:
                await this.services.dynamicChannelService.handleDeleteDynamicSetup( payload.data );
                break;

            default:
                this.logger.warn( this.handleIPCMessage, `Unknown action: ${ ( payload as ManagementPayload ).action }` );
        }
    }

    private async handleIPCRequest(
        request: IPCRequest<ManagementRequestPayload>
    ): Promise<GetScalingChannelInfoResponse | GetDynamicChannelInfoResponse> {
        const { payload } = request;

        this.logger.log( this.handleIPCRequest, `Received IPC request: ${ payload.action }` );

        switch ( payload.action ) {
            case MANAGEMENT_REQUEST_ACTIONS.GET_SCALING_CHANNEL_INFO:
                return this.services.scalingChannelService.getScalingChannelInfo(
                    payload.guildId,
                    payload.masterChannelId,
                    payload.scalingChannelIds
                );

            case MANAGEMENT_REQUEST_ACTIONS.GET_DYNAMIC_CHANNEL_INFO:
                return this.services.dynamicChannelService.getDynamicChannelInfo(
                    payload.guildId,
                    payload.masterChannelId,
                    payload.dynamicChannelIds
                );

            default:
                throw new Error( `Unknown request action: ${ ( payload as ManagementRequestPayload ).action }` );
        }
    }
}

export default ManagementIPCService;
