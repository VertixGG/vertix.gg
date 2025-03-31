import axios from "axios";

import { useAsyncResource } from "@vertix.gg/flow/src/shared/utils/use-async-resource";

import type { FlowData } from "@vertix.gg/flow/src/features/flow-editor/types/flow";

// Create axios instance with default config
const api = axios.create( {
    baseURL: import.meta.env.VITE_API_URL || "", // Use API URL from .env or empty string for relative URLs
    headers: {
        "Content-Type": "application/json",
    },
} );

export function useFlowData( moduleName: string, flowName: string ) {
    return useAsyncResource(
        async() => {
            try {
                console.log( `Fetching flow data for moduleName=${ moduleName }, flowName=${ flowName }` );
                console.log( `Using API base URL: ${ api.defaults.baseURL }` );

                const response = await api.get<FlowData>( "/api/ui-flows", {
                    params: {
                        moduleName,
                        flowName,
                    },
                } );

                console.log( "Flow data response:", response );
                return response;
            } catch ( error ) {
                console.error( "Error fetching flow data:", error );
                throw error;
            }
        },
        [ moduleName, flowName ] // Cache key and dependencies
    );
}
