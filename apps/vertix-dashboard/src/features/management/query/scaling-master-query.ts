import { QueryModuleBase } from "@zenflux/react-commander/query/module-base";

import type { DCommandFunctionComponent, DCommandSingleComponentContext } from "@zenflux/react-commander/definitions";
import type { QueryClient } from "@zenflux/react-commander/query/client";
import type { ScalingMasterDetails } from "@vertix.gg/dashboard/src/features/management/types";

interface ScalingMasterState {
    scalingMasterDetails: ScalingMasterDetails | null;
}

export class ScalingMasterQuery extends QueryModuleBase<ScalingMasterDetails> {

    public constructor( client: QueryClient ) {
        super( client );
    }

    public static getName(): string {
        return "management/scaling-master";
    }

    protected getResourceName(): string {
        return "scaling-master";
    }

    protected registerEndpoints(): void {
        this.defineEndpoint<ScalingMasterDetails, ScalingMasterDetails>( "Dashboard/ScalingMaster", {
            method: "GET",
            path: "management/guild/:guildId/scaling/:masterChannelId",
            prepareData: ( response ) => response
        } );
    }

    protected async requestHandler( _element: DCommandFunctionComponent, request: Record<string, unknown> ): Promise<Record<string, unknown>> {
        return request;
    }

    protected async responseHandler( _element: DCommandFunctionComponent, response: Response ): Promise<ScalingMasterDetails> {
        return await response.json();
    }

    protected onMount( context: DCommandSingleComponentContext, resource?: ScalingMasterDetails ) {
        context.setState( {
            ...context.getState<ScalingMasterState>(),
            scalingMasterDetails: resource ?? null
        } );
    }
}
