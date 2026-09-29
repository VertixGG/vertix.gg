import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { GuildBranding } from "@vertix.gg/dashboard/src/features/branding/types";

export class BrandingQuery extends QueryModuleBase<GuildBranding> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "branding/guild-branding";
    }

    protected getResourceName(): string {
        return "guild-branding";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<GuildBranding, GuildBranding>( "Dashboard/Branding", {
            method: "GET",
            path: "management/guild/:guildId/branding",
            prepareData: ( response ) => response
        } );

        this.register( "PUT", "Dashboard/Branding/Save", "management/guild/:guildId/branding" );

        // The first half of a save that carries both images: the proxy in front of the api refuses a
        // body over a megabyte, so the two are sent apart and only the second asks the bot to apply.
        // The client fills in path parameters and nothing else, so the query is part of the route.
        this.register( "PUT", "Dashboard/Branding/SaveWithoutApply", "management/guild/:guildId/branding?apply=false" );

        this.register( "DELETE", "Dashboard/Branding/Remove", "management/guild/:guildId/branding" );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GuildBranding> {
        return await response.json();
    }
}
