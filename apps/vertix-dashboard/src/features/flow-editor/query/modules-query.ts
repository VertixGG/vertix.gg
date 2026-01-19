import { QueryListModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { ModuleInfo } from "@vertix.gg/dashboard/src/lib/api-client";
import type { QueryClient } from "@zenflux/react-commander/query/client";

interface ModulesListState {
    modules: ModuleInfo[];
}

export class ModulesQuery extends QueryListModuleBase<ModuleInfo> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "modules";
    }

    protected getResourceName(): string {
        return "modules";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<{ modules: ModuleInfo[] }, ModuleInfo[]>( "Dashboard/FlowEditor", {
            method: "GET",
            path: "modules",
            prepareData: ( apiResponse ) => apiResponse.modules
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<{ modules: ModuleInfo[] }> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: ModuleInfo[] ) {
        context.setState( {
            ...context.getState<ModulesListState>(),
            modules: resource ?? []
        } );
    }
}
