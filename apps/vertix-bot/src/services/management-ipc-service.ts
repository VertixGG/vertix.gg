import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { isUnlimitedAllowance } from "@vertix.gg/definitions/src/billing-definitions";

import { IPC_CHANNELS, IPC_REQUEST_ACTIONS } from "@vertix.gg/definitions/src/ipc-definitions";

import { DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS } from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

import { ConfigManager } from "@vertix.gg/data/src/managers/config-manager";
import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";

import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { ChannelType } from "discord.js";

import { IPC_NO_RESPONSE } from "@vertix.gg/base/src/modules/ipc/ipc-service";

import { VoiceRoleManager } from "@vertix.gg/bot/src/managers/voice-role-manager";

import { ownsGuild, ownsSingletonWork } from "@vertix.gg/bot/src/definitions/sharding";

import type { EntitlementService } from "@vertix.gg/bot/src/services/entitlement-service";

import type { NewsChannel, TextChannel } from "discord.js";

import type { IPCService, IPCMessage, IPCRequest } from "@vertix.gg/base/src/modules/ipc";

import type {
    IPCManagementRequestPayload,
    GetGuildOptionsResponse,
    GetConfigLimitsResponse,
    GetGeneratorDefaultsResponse
} from "@vertix.gg/definitions/src/ipc-definitions";

import type {
    MasterChannelConfigInterface,
    MasterChannelConfigInterfaceV3
} from "@vertix.gg/data/src/interfaces/master-channel-config";

import type { GetScalingChannelInfoResponse } from "@vertix.gg/definitions/src/scaling-channel-ipc-definitions";

import type {
    GetDynamicChannelInfoResponse,
    DynamicChannelIPCManagementPayload
} from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

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
                | GetConfigLimitsResponse | GetGeneratorDefaultsResponse
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

        // Every process the bot runs in is subscribed to this channel, so without this a single
        // dashboard action would be carried out once per process - including the destructive ones.
        // Each of these payloads names a guild, and discord gives that guild to exactly one shard.
        const guildId = ( payload.data as { guildId?: string } )?.guildId;

        if ( guildId && ! ownsGuild( guildId ) ) {
            this.logger.log(
                this.handleIPCMessage,
                `Ignoring '${ payload.action }' for guild '${ guildId }' - another shard holds it`
            );

            return;
        }

        try {
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
        } catch( error ) {
            // Nothing travels back over this channel - the publish is fire-and-forget, so the
            // dashboard reports success whether or not the action happened. This line is the only
            // record that it was asked for and did not, and the transport's own catch names the
            // channel alone, which is the same for every action there is.
            const guildId = ( payload.data as { guildId?: string } | undefined )?.guildId ?? "unknown";

            this.logger.error(
                this.handleIPCMessage,
                `Action '${ payload.action }' failed for guild '${ guildId }'`,
                error
            );
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
            // Every role the guild has, each saying whether it is managed, rather than the managed
            // ones being dropped here. Whether that disqualifies a role is the caller's to decide:
            // a setting the bot hands a role out for cannot use one, while a setting that only
            // asks whether a member already holds it can - which is how a generator gives its
            // boosters their own buttons.
            //
            // `@everyone` carries the guild's own id and is the default verified role, so it stays
            // in and is named rather than shown by whatever discord calls it.
            roles: guild.roles.cache
                .sort( ( a, b ) => b.position - a.position )
                .map( ( role ) => {
                    // Answered here rather than worked out again on the other side: this is the
                    // same rule the bot applies before it hands the role to anybody, so a picker
                    // that greys a role out and the join that would have failed cannot disagree.
                    const { assignable, reason } = VoiceRoleManager.$.isRoleAssignable( role );

                    return {
                        id: role.id,
                        name: role.id === guildId ? "@everyone" : role.name,
                        color: role.color,
                        managed: role.managed,
                        assignable,
                        reason
                    };
                } ),

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
     * Function getConfigLimits() :: What this guild is allowed, for the screen that refuses at it.
     *
     * Through `EntitlementService`, which is the one place a grant, the configured default and a
     * tier somebody pays for are reconciled - so the dashboard refuses at the same number discord
     * does. Read straight out of the config here instead, this answered one number for every guild,
     * and an allowance belonging to a server applied in discord and not in the dashboard.
     *
     * The channels a generator may have open are read from the same settings row the refusal in
     * `findChannelCreateRefusal()` reads, for the same reason: the number the dashboard measures a
     * generator against has to be the one that turns the next member away.
     */
    private async getConfigLimits( guildId: string ): Promise<GetConfigLimitsResponse> {
        const maxMasterChannels = await ServiceLocator.$.get<EntitlementService>(
            "VertixBot/Services/Entitlement"
        ).getMaxMasterChannels( guildId );

        const { maxActiveDynamicChannels } = await GuildDataManager.$.getAllSettings( guildId );

        return {
            // `JSON.stringify( Infinity )` is `null`, so an unlimited allowance is sent as null on
            // purpose rather than by accident. The reader already treats null as nothing to hold
            // anybody to, which is what unlimited means there.
            maxMasterChannels: isUnlimitedAllowance( maxMasterChannels ) ? null : maxMasterChannels,
            maxActiveDynamicChannels
        };
    }

    /**
     * Function getGeneratorDefaults() :: What a generator of this version is created with.
     *
     * The configuration as it stands, which is the row as this deployment set it rather than what
     * the source ships - the same answer the bot itself creates a generator from, so a dashboard
     * filling a form with it fills it with what would actually happen.
     */
    private getGeneratorDefaults( version: string ): GetGeneratorDefaultsResponse {
        const config = VERSION_UI_V3 === version
            ? ConfigManager.$.get<MasterChannelConfigInterfaceV3>( "Vertix/Config/MasterChannel", VERSION_UI_V3 )
            : ConfigManager.$.get<MasterChannelConfigInterface>( "Vertix/Config/MasterChannel", VERSION_UI_V2 );

        return { settings: { ... config.data } };
    }

    private async handleIPCRequest(
        request: IPCRequest<IPCManagementRequestPayload>
    ): Promise<
        GetScalingChannelInfoResponse | GetDynamicChannelInfoResponse | GetGuildOptionsResponse
        | GetConfigLimitsResponse | GetGeneratorDefaultsResponse | typeof IPC_NO_RESPONSE
    > {
        const { payload } = request;

        this.logger.log( this.handleIPCRequest, `Received IPC request: ${ payload.action }` );

        // Same reasoning as the message handler, but a request also has to be *answered* exactly
        // once: this publishes a response for whatever a handler returns, so a shard that is not
        // the owner has to decline rather than return nothing. `GET_GENERATOR_DEFAULTS` is the one
        // question with no guild in it, so it goes to whoever holds shard 0 instead.
        const requestGuildId = ( payload as { guildId?: string } ).guildId;

        if ( requestGuildId ? ! ownsGuild( requestGuildId ) : ! ownsSingletonWork() ) {
            this.logger.log(
                this.handleIPCRequest,
                `Declining '${ payload.action }'${ requestGuildId ? ` for guild '${ requestGuildId }'` : "" } - not this process`
            );

            return IPC_NO_RESPONSE;
        }

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
                return this.getConfigLimits( payload.guildId );

            case IPC_REQUEST_ACTIONS.GET_GENERATOR_DEFAULTS:
                return this.getGeneratorDefaults( payload.version );

            default:
                throw new Error( `Unknown request action: ${ ( payload as IPCManagementRequestPayload ).action }` );
        }
    }
}

export default ManagementIPCService;
