import axios from "axios";

import { useAsyncResource } from "@vertix.gg/flow/src/hooks/use-async-resource";

export interface UIModuleFile {
    name: string;
    path: string;
    moduleInfo?: {
        name: string;
        adapters: string[];
        flows: string[];
    };
    content?: string;
}

export interface UIModulesResponse {
    files: UIModuleFile[];
}

export interface FlowData {
    transactions: string[];
    requiredData: Record<string, string[]>;
    schema: any;
}

// Create axios instance with default config
const api = axios.create( {
    baseURL: import.meta.env.VITE_API_URL || "", // Use API URL from .env or empty string for relative URLs
    headers: {
        "Content-Type": "application/json",
    },
} );

// Cache for flow data to prevent duplicate fetches
const flowDataCache = new Map<string, FlowData>();
const pendingRequests = new Map<string, Promise<FlowData | null>>();

export function useUIModules() {
    return useAsyncResource(
        async() => {
            const response = await api.get<{ files: UIModuleFile[] }>( "/api/ui-modules" );
            const files = Array.isArray( response.data?.files ) ? response.data.files : [];
            return { files };
        },
        [ "ui-modules" ] // Cache key
    );
}

export function useUIModuleContent( filePath: string ) {
    return useAsyncResource(
        async() => {
            const response = await api.get<UIModuleFile>( `/api/ui-modules/${ filePath }` );
            return response.data;
        },
        [ `ui-module-content-${ filePath }` ] // Cache key based on file path
    );
}

export function useFlowData( modulePath: string, flowName: string ) {
    return useAsyncResource(
        async() => {
            if ( !modulePath || !flowName ) {
                return null;
            }

            // Normalize paths for consistent caching
            const normalizedPath = modulePath.startsWith( '/' ) ? modulePath.substring( 1 ) : modulePath;

            // Create a unique cache key
            const cacheKey = `flow-data-${ normalizedPath }-${ flowName }`;

            // Return cached data if available
            if ( flowDataCache.has( cacheKey ) ) {
                return flowDataCache.get( cacheKey )!;
            }

            // Check if there's already a pending request for this data
            if ( pendingRequests.has( cacheKey ) ) {
                return await pendingRequests.get( cacheKey )!;
            }

            // Create new request
            const request = ( async() => {
                try {
                    // Use query parameters instead of path parameters
                    const response = await api.get<FlowData>( `/api/ui-flows`, {
                        params: {
                            modulePath: normalizedPath,
                            flowName: flowName
                        }
                    } );

                    // Cache the result
                    if ( response.data ) {
                        flowDataCache.set( cacheKey, response.data );
                    }

                    return response.data;
                } catch ( error ) {
                    console.error( `Error fetching flow data for ${ normalizedPath }/${ flowName }:`, error );
                    return null;
                } finally {
                    // Clean up pending request
                    pendingRequests.delete( cacheKey );
                }
            } )();

            // Store the pending request
            pendingRequests.set( cacheKey, request );

            return await request;
        },
        [ `flow-data-${ modulePath }-${ flowName }` ] // Cache key based on module path and flow name
    );
}
