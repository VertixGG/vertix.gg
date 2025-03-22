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
                console.warn( "useFlowData called without modulePath or flowName" );
                return null;
            }

            console.log( `Fetching flow data for ${ modulePath } / ${ flowName }` );

            // Normalize paths for consistent caching
            const normalizedPath = modulePath.startsWith( '/' ) ? modulePath.substring( 1 ) : modulePath;

            // Create a unique cache key
            const cacheKey = `flow-data-${ normalizedPath }-${ flowName }`;

            // Return cached data if available
            if ( flowDataCache.has( cacheKey ) ) {
                console.log( `Using cached data for ${ cacheKey }` );
                return validateFlowData( flowDataCache.get( cacheKey )! );
            }

            // Check if there's already a pending request for this data
            if ( pendingRequests.has( cacheKey ) ) {
                console.log( `Using pending request for ${ cacheKey }` );
                const result = await pendingRequests.get( cacheKey )!;
                return validateFlowData( result );
            }

            // Create new request
            const request = ( async() => {
                try {
                    console.log( `Making API request for ${ normalizedPath }/${ flowName }` );
                    // Use query parameters instead of path parameters
                    const response = await api.get<FlowData>( `/api/ui-flows`, {
                        params: {
                            modulePath: normalizedPath,
                            flowName: flowName
                        }
                    } );

                    console.log( `API response received for ${ normalizedPath }/${ flowName }:`, response.status );

                    // Validate the response data
                    const validatedData = validateFlowData( response.data );

                    // Cache the result if it's valid
                    if ( validatedData ) {
                        flowDataCache.set( cacheKey, validatedData );
                    }

                    return validatedData;
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

// Function to validate flow data structure
function validateFlowData( data: FlowData | null ): FlowData | null {
    if ( !data ) return null;

    // Create a validated copy with defaults for missing properties
    const validated: FlowData = {
        transactions: Array.isArray( data.transactions ) ? data.transactions : [],
        requiredData: data.requiredData && typeof data.requiredData === 'object' ? data.requiredData : {},
        schema: data.schema || null
    };

    return validated;
}
