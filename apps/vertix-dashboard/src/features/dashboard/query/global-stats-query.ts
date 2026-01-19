import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { GlobalStats } from "@vertix.gg/dashboard/src/features/dashboard/types";

interface GlobalStatsState {
    globalStats: GlobalStats | null;
}

export class GlobalStatsQuery extends QueryModuleBase<GlobalStats> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "dashboard/global-stats";
    }

    protected getResourceName(): string {
        return "global-stats";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<GlobalStats, GlobalStats>( "Dashboard/GlobalStats", {
            method: "GET",
            path: "dashboard/stats/global",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GlobalStats> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: GlobalStats ) {
        context.setState( {
            ...context.getState<GlobalStatsState>(),
            globalStats: resource ?? null
        } );
    }
}
