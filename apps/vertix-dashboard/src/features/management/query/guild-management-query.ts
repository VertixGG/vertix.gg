import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { GuildManagementDetails } from "@vertix.gg/dashboard/src/features/management/types";

interface GuildManagementState {
    managementDetails: GuildManagementDetails | null;
}

export class GuildManagementQuery extends QueryModuleBase<GuildManagementDetails> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "management/guild-management";
    }

    protected getResourceName(): string {
        return "guild-management";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<GuildManagementDetails, GuildManagementDetails>( "Dashboard/GuildManagement", {
            method: "GET",
            path: "management/guild/:guildId",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GuildManagementDetails> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: GuildManagementDetails ) {
        context.setState( {
            ...context.getState<GuildManagementState>(),
            managementDetails: resource ?? null
        } );
    }
}
