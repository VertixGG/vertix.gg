import axios from "axios";

import { useAsyncResource } from "@vertix.gg/flow/src/shared/utils/use-async-resource";

import type { UIModulesResponse } from "@vertix.gg/flow/src/server/routes/ui-modules-route";

// Create axios instance with default config
const api = axios.create( {
    baseURL: import.meta.env.VITE_API_URL || "", // Use API URL from .env or empty string for relative URLs
    headers: {
        "Content-Type": "application/json",
    },
} );

export function useUIModules() {
    return useAsyncResource(
        async() => {
            return api.get<UIModulesResponse>( "/api/ui-modules" );
        },
        [ "ui-modules" ] // Cache key
    );
}

