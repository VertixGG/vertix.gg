import axios from "axios";

import { useAsyncResource } from "@vertix.gg/flow/src/shared/utils/use-async-resource";

import type { UIModuleFile } from "@vertix.gg/flow/src/shared/types/flow";

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
            return api.get<{ files: UIModuleFile[] }>( "/api/ui-modules" );
        },
        [ "ui-modules" ] // Cache key
    );
}

export function useUIModuleContent( filePath: string ) {
    return useAsyncResource(
        async() => {
            if ( !filePath ) return null;

            return await api.get<{ content: string }>( "/api/ui-module-content", {
                params: { filePath },
            } );
        },
        [ filePath ] // Cache key and dependencies
    );
}
