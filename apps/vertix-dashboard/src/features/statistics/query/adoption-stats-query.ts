import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { IAdoptionStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface AdoptionStatsState {
    adoptionStats: IAdoptionStats | null;
}

/**
 * Which features the servers use - `GET dashboard/stats/adoption`, which answers the owner only.
 */
export class AdoptionStatsQuery extends QueryModuleBase<IAdoptionStats> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "statistics/adoption-stats";
    }

    protected getResourceName(): string {
        return "adoption-stats";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<IAdoptionStats, IAdoptionStats>( "Statistics/AdoptionStats", {
            method: "GET",
            path: "dashboard/stats/adoption",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<IAdoptionStats> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: IAdoptionStats ) {
        context.setState( {
            ...context.getState<AdoptionStatsState>(),
            adoptionStats: resource ?? null
        } );
    }
}
