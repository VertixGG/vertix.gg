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
            /*
             * A read the api refused arrives here as null, which the client does deliberately so a
             * screen can render the absence of a resource rather than an error body wearing its
             * name. This is the one screen that cannot: the module list is what every panel in the
             * editor is built from, and an empty one is a bot that declares no modules - a
             * different thing from an api that could not be asked, and the two looked identical
             * for a day. So it is raised, and the boundary around the page says which it was.
             */
            prepareData: ( apiResponse ) => {
                if ( ! apiResponse ) {
                    throw new Error( "The api could not be asked for the interface definitions" );
                }

                return apiResponse.modules;
            }
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
