import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { IUsageStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface UsageStatsState {
    usageStats: IUsageStats | null;
}

/**
 * How much the bot is used across every server - `GET dashboard/stats/usage`, which answers the owner only.
 */
export class UsageStatsQuery extends QueryModuleBase<IUsageStats> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "statistics/usage-stats";
    }

    protected getResourceName(): string {
        return "usage-stats";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<IUsageStats, IUsageStats>( "Statistics/UsageStats", {
            method: "GET",
            path: "dashboard/stats/usage",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<IUsageStats> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: IUsageStats ) {
        context.setState( {
            ...context.getState<UsageStatsState>(),
            usageStats: resource ?? null
        } );
    }
}
