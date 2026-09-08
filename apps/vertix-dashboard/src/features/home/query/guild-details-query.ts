import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { GuildDetails } from "@vertix.gg/dashboard/src/features/home/types";

interface GuildDetailsState {
    guildDetails: GuildDetails | null;
}

/**
 * The guild with its generators, which is what the stats summarize.
 *
 * The stats endpoint answers "how many", this one answers "which" - each master channel with the
 * dynamic channels standing under it right now.
 */
export class GuildDetailsQuery extends QueryModuleBase<GuildDetails> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "home/guild-details";
    }

    protected getResourceName(): string {
        return "guild-details";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<GuildDetails, GuildDetails>( "Home/GuildDetails", {
            method: "GET",
            path: "dashboard/guild/:guildId",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GuildDetails> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: GuildDetails ) {
        context.setState( {
            ...context.getState<GuildDetailsState>(),
            guildDetails: resource ?? null
        } );
    }
}
