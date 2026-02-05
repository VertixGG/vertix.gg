import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { LanguageInfo } from "@vertix.gg/dashboard/src/lib/api-client";

export type { LanguageInfo } from "@vertix.gg/dashboard/src/lib/api-client";

export interface LanguageTranslations {
    embeds: Record<string, { title?: string; description?: string }>;
    elements: Record<string, { label?: string }>;
    modals: Record<string, { title?: string }>;
}

export interface LanguageState {
    languages: LanguageInfo[];
    isLoadingLanguages: boolean;
}

export const LANGUAGE_INITIAL_STATE: LanguageState = {
    languages: [],
    isLoadingLanguages: false
};

export class LanguageQuery extends QueryModuleBase<LanguageInfo[]> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "languages";
    }

    protected getResourceName(): string {
        return "languages";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<LanguageInfo[], LanguageInfo[]>( "Dashboard/Languages/GetAll", {
            method: "GET",
            path: "languages",
            prepareData: ( response ) => response
        } );

        this.defineEndpoint<LanguageTranslations, LanguageTranslations>( "Dashboard/Languages/GetTranslations", {
            method: "GET",
            path: "languages/translations/:code",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<LanguageInfo[]> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: LanguageInfo[] ) {
        context.setState( {
            ...context.getState<LanguageState>(),
            languages: resource ?? [],
            isLoadingLanguages: false
        } );
    }

    protected onUnmount() {
        // No cleanup needed
    }
}
