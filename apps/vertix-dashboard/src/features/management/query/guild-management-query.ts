import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type {
    GuildManagementDetails,
    ScalingMasterDetails,
    DynamicMasterDetails
} from "@vertix.gg/dashboard/src/features/management/types";
import type { ManagementState } from "@vertix.gg/dashboard/src/features/management/commands/base";

export class GuildManagementQuery extends QueryModuleBase<GuildManagementDetails> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "management/guild-management";
    }

    protected getResourceName(): string {
        return "guild-management";
    }

    protected registerEndpoints(): void {
        // GET endpoints
        this.defineEndpoint<GuildManagementDetails, GuildManagementDetails>( "Dashboard/Management", {
            method: "GET",
            path: "management/guild/:guildId",
            prepareData: ( response ) => response
        } );

        this.defineEndpoint<ScalingMasterDetails, ScalingMasterDetails>( "Dashboard/Management/GetScalingDetails", {
            method: "GET",
            path: "management/guild/:guildId/scaling/:masterChannelId",
            prepareData: ( response ) => response
        } );

        this.defineEndpoint<DynamicMasterDetails, DynamicMasterDetails>( "Dashboard/Management/GetDynamicDetails", {
            method: "GET",
            path: "management/guild/:guildId/dynamic/:masterChannelId",
            prepareData: ( response ) => response
        } );

        // Scaling mutations
        this.register( "POST", "Dashboard/Management/CreateScalingSetup", "management/guild/:guildId/scaling" );
        this.register( "PUT", "Dashboard/Management/UpdateScalingSettings", "management/guild/:guildId/scaling/:masterChannelId" );
        this.register( "POST", "Dashboard/Management/TriggerReindex", "management/guild/:guildId/scaling/:masterChannelId/reindex" );
        this.register( "POST", "Dashboard/Management/TriggerCleanup", "management/guild/:guildId/scaling/:masterChannelId/cleanup" );
        this.register( "DELETE", "Dashboard/Management/DeleteScalingSetup", "management/guild/:guildId/scaling/:masterChannelId" );

        // Dynamic mutations
        this.register( "POST", "Dashboard/Management/CreateDynamicSetup", "management/guild/:guildId/dynamic" );
        this.register( "PUT", "Dashboard/Management/UpdateDynamicSettings", "management/guild/:guildId/dynamic/:masterChannelId" );
        this.register( "DELETE", "Dashboard/Management/DeleteDynamicSetup", "management/guild/:guildId/dynamic/:masterChannelId" );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GuildManagementDetails> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: GuildManagementDetails ) {
        context.setState( {
            ...context.getState<ManagementState>(),
            managementDetails: resource ?? null,
            isLoading: false
        } );
    }

    protected onUnmount() {
        // No cleanup needed
    }
}
