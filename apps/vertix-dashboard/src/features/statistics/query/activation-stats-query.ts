import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { IActivationStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface ActivationStatsState {
    activationStats: IActivationStats | null;
}

/**
 * Where every install got to, how fast, and how long it kept going - `GET dashboard/stats/activation`,
 * which answers the owner only.
 */
export class ActivationStatsQuery extends QueryModuleBase<IActivationStats> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "statistics/activation-stats";
    }

    protected getResourceName(): string {
        return "activation-stats";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<IActivationStats, IActivationStats>( "Statistics/ActivationStats", {
            method: "GET",
            path: "dashboard/stats/activation",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<IActivationStats> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: IActivationStats ) {
        context.setState( {
            ...context.getState<ActivationStatsState>(),
            activationStats: resource ?? null
        } );
    }
}
