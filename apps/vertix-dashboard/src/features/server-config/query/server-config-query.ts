import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { ServerConfig, GuildDiscordOptions } from "@vertix.gg/dashboard/src/features/server-config/types";
import type { ServerConfigState } from "@vertix.gg/dashboard/src/features/server-config/commands/base";

export class ServerConfigQuery extends QueryModuleBase<ServerConfig> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "server-config/server-config";
    }

    protected getResourceName(): string {
        return "server-config";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<ServerConfig, ServerConfig>( "Dashboard/ServerConfig", {
            method: "GET",
            path: "management/guild/:guildId/settings",
            prepareData: ( response ) => response
        } );

        this.defineEndpoint<GuildDiscordOptions, GuildDiscordOptions>( "Dashboard/ServerConfig/GetDiscordOptions", {
            method: "GET",
            path: "management/guild/:guildId/discord-options",
            prepareData: ( response ) => response
        } );

        this.register( "PUT", "Dashboard/ServerConfig/Update", "management/guild/:guildId/settings" );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<ServerConfig> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: ServerConfig ) {
        context.setState( {
            ...context.getState<ServerConfigState>(),
            config: resource ?? null,
            isLoading: false
        } );
    }

    protected onUnmount() {
        // No cleanup needed
    }
}
