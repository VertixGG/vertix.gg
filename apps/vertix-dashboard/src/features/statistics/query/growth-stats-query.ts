import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { IGrowthStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface GrowthStatsState {
    growthStats: IGrowthStats | null;
}

/**
 * What became of every install - `GET dashboard/stats/growth`, which answers the owner only.
 */
export class GrowthStatsQuery extends QueryModuleBase<IGrowthStats> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "statistics/growth-stats";
    }

    protected getResourceName(): string {
        return "growth-stats";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<IGrowthStats, IGrowthStats>( "Statistics/GrowthStats", {
            method: "GET",
            path: "dashboard/stats/growth",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<IGrowthStats> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: IGrowthStats ) {
        context.setState( {
            ...context.getState<GrowthStatsState>(),
            growthStats: resource ?? null
        } );
    }
}
