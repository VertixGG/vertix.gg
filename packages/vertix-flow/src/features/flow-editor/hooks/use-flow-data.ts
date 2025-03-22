import axios from "axios";

import { useAsyncResource } from "@vertix.gg/flow/src/shared/utils/use-async-resource";

import type { FlowData } from "@vertix.gg/flow/src/shared/types/flow";

// Create axios instance with default config
const api = axios.create( {
    baseURL: import.meta.env.VITE_API_URL || "", // Use API URL from .env or empty string for relative URLs
    headers: {
        "Content-Type": "application/json",
    },
} );

export function useFlowData( modulePath: string, flowName: string ) {
    return useAsyncResource(
        async() => {
            return api.get<FlowData>( "/api/ui-flows", {
                params: {
                    modulePath,
                    flowName,
                },
            } );
        },
        [ modulePath, flowName ] // Cache key and dependencies
    );
}
