import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { IGuildActivityStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface GuildActivityState {
    guildActivity: IGuildActivityStats | null;
}

/**
 * A server's rooms per day - `GET dashboard/stats/guild/:guildId/activity`.
 */
export class GuildActivityQuery extends QueryModuleBase<IGuildActivityStats> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "home/guild-activity";
    }

    protected getResourceName(): string {
        return "guild-activity";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<IGuildActivityStats, IGuildActivityStats>( "Home/GuildActivity", {
            method: "GET",
            path: "dashboard/stats/guild/:guildId/activity",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<IGuildActivityStats> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: IGuildActivityStats ) {
        context.setState( {
            ...context.getState<GuildActivityState>(),
            guildActivity: resource ?? null
        } );
    }
}
