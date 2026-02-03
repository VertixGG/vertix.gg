import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { GuildCustomizationData, ComponentCustomization } from "@vertix.gg/definitions/src/ui-customization-definitions";

export type { GuildCustomizationData, ComponentCustomization, EmbedOverrides } from "@vertix.gg/definitions/src/ui-customization-definitions";

export interface CustomizationState {
    customization: GuildCustomizationData | null;
    isLoadingCustomization: boolean;
    customizationError: string | null;
}

export const CUSTOMIZATION_INITIAL_STATE: CustomizationState = {
    customization: null,
    isLoadingCustomization: false,
    customizationError: null
};

export class CustomizationQuery extends QueryModuleBase<GuildCustomizationData> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "customization";
    }

    protected getResourceName(): string {
        return "customization";
    }

    protected registerEndpoints(): void {
        // GET guild customization
        this.defineEndpoint<GuildCustomizationData, GuildCustomizationData>( "Dashboard/Customization/GetGuild", {
            method: "GET",
            path: "customization/guild/:guildId",
            prepareData: ( response ) => response
        } );

        // PUT update all guild customizations
        this.register( "PUT", "Dashboard/Customization/UpdateGuild", "customization/guild/:guildId" );

        // PUT update single component customization
        this.register( "PUT", "Dashboard/Customization/UpdateComponent", "customization/guild/:guildId/component" );

        // DELETE component customization
        this.register( "DELETE", "Dashboard/Customization/DeleteComponent", "customization/guild/:guildId/component" );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<GuildCustomizationData> {
        if ( !response.ok ) {
            if ( response.status === 403 ) {
                throw new Error( "Access denied" );
            }
            if ( response.status === 404 ) {
                throw new Error( "No customization found" );
            }
            throw new Error( "Request failed" );
        }
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: GuildCustomizationData ) {
        context.setState( {
            ...context.getState<CustomizationState>(),
            customization: resource ?? null,
            isLoadingCustomization: false
        } );
    }

    protected onUnmount() {
        // No cleanup needed
    }
}
