import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { GuildStats } from "@vertix.gg/dashboard/src/features/dashboard/types";

interface GuildStatsState {
    guildStats: GuildStats | null;
}

export class GuildStatsQuery extends QueryModuleBase<GuildStats> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "dashboard/guild-stats";
    }

    protected getResourceName(): string {
        return "guild-stats";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<GuildStats, GuildStats>( "Dashboard/GuildStats", {
            method: "GET",
            path: "dashboard/stats/guild/:guildId",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GuildStats> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: GuildStats ) {
        context.setState( {
            ...context.getState<GuildStatsState>(),
            guildStats: resource ?? null
        } );
    }
}
