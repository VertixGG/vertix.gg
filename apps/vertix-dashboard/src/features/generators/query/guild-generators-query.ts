import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type {
    GuildGeneratorsDetails,
    GuildDiscordOptions,
    ScalingMasterDetails,
    DynamicMasterDetails
} from "@vertix.gg/dashboard/src/features/generators/types";
import type { GeneratorsState } from "@vertix.gg/dashboard/src/features/generators/commands/base";

export class GuildGeneratorsQuery extends QueryModuleBase<GuildGeneratorsDetails> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "generators/guild-generators";
    }

    protected getResourceName(): string {
        return "guild-generators";
    }

    protected registerEndpoints(): void {
        // GET endpoints
        this.defineEndpoint<GuildGeneratorsDetails, GuildGeneratorsDetails>( "Dashboard/Generators", {
            method: "GET",
            path: "management/guild/:guildId",
            prepareData: ( response ) => response
        } );

        this.defineEndpoint<ScalingMasterDetails, ScalingMasterDetails>( "Dashboard/Generators/GetScalingDetails", {
            method: "GET",
            path: "management/guild/:guildId/scaling/:masterChannelId",
            prepareData: ( response ) => response
        } );

        this.defineEndpoint<DynamicMasterDetails, DynamicMasterDetails>( "Dashboard/Generators/GetDynamicDetails", {
            method: "GET",
            path: "management/guild/:guildId/dynamic/:masterChannelId",
            prepareData: ( response ) => response
        } );

        this.defineEndpoint<GuildDiscordOptions, GuildDiscordOptions>( "Dashboard/Generators/GetDiscordOptions", {
            method: "GET",
            path: "management/guild/:guildId/discord-options",
            prepareData: ( response ) => response
        } );

        // Scaling mutations
        this.register( "POST", "Dashboard/Generators/CreateScalingSetup", "management/guild/:guildId/scaling" );
        this.register( "PUT", "Dashboard/Generators/UpdateScalingSettings", "management/guild/:guildId/scaling/:masterChannelId" );
        this.register( "POST", "Dashboard/Generators/TriggerReindex", "management/guild/:guildId/scaling/:masterChannelId/reindex" );
        this.register( "POST", "Dashboard/Generators/TriggerCleanup", "management/guild/:guildId/scaling/:masterChannelId/cleanup" );
        this.register( "DELETE", "Dashboard/Generators/DeleteScalingSetup", "management/guild/:guildId/scaling/:masterChannelId" );

        // Dynamic mutations
        this.register( "POST", "Dashboard/Generators/CreateDynamicSetup", "management/guild/:guildId/dynamic" );
        this.register( "PUT", "Dashboard/Generators/UpdateDynamicSettings", "management/guild/:guildId/dynamic/:masterChannelId" );
        this.register( "DELETE", "Dashboard/Generators/DeleteDynamicSetup", "management/guild/:guildId/dynamic/:masterChannelId" );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GuildGeneratorsDetails> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: GuildGeneratorsDetails ) {
        context.setState( {
            ...context.getState<GeneratorsState>(),
            generatorsDetails: resource ?? null,
            isLoading: false
        } );
    }

    protected onUnmount() {
        // No cleanup needed
    }
}
