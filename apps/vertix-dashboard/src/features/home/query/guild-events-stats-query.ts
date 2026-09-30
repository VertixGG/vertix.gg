import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { IGuildEventsStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface GuildEventsStatsState {
    guildEventsStats: IGuildEventsStats | null;
}

/**
 * How a server's events went - `GET dashboard/stats/guild/:guildId/events`.
 */
export class GuildEventsStatsQuery extends QueryModuleBase<IGuildEventsStats> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "home/guild-events-stats";
    }

    protected getResourceName(): string {
        return "guild-events-stats";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<IGuildEventsStats, IGuildEventsStats>( "Home/GuildEventsStats", {
            method: "GET",
            path: "dashboard/stats/guild/:guildId/events",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<IGuildEventsStats> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: IGuildEventsStats ) {
        context.setState( {
            ...context.getState<GuildEventsStatsState>(),
            guildEventsStats: resource ?? null
        } );
    }
}
