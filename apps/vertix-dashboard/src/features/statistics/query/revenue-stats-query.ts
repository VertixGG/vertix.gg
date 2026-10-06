import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { IRevenueStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface RevenueStatsState {
    revenueStats: IRevenueStats | null;
}

/**
 * What the servers pay for, and how their trials went - `GET dashboard/stats/revenue`, which answers the
 * owner only.
 */
export class RevenueStatsQuery extends QueryModuleBase<IRevenueStats> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "statistics/revenue-stats";
    }

    protected getResourceName(): string {
        return "revenue-stats";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<IRevenueStats, IRevenueStats>( "Statistics/RevenueStats", {
            method: "GET",
            path: "dashboard/stats/revenue",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<IRevenueStats> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: IRevenueStats ) {
        context.setState( {
            ...context.getState<RevenueStatsState>(),
            revenueStats: resource ?? null
        } );
    }
}
