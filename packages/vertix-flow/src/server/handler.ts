import { createApp } from "@vertix.gg/flow/src/server/app";
import { environment } from "@vertix.gg/flow/src/server/config/environment";

import type { InjectOptions, LightMyRequestResponse } from "fastify";

// Export handler for Bun's hot reloading
export const handler = {
    port: environment.getPort(),
    async fetch( request: Request ) {
        try {
            const { app } = await createApp();
            const url = new URL( request.url );

            const method = request.method.toUpperCase();
            const allowedMethods = [ "DELETE", "GET", "HEAD", "PATCH", "POST", "PUT", "OPTIONS" ] as const;
            const validMethod = allowedMethods.find( m => m === method );
            if ( !validMethod ) {
                return new Response( "Method Not Allowed", { status: 405 } );
            }

            const injectOptions: Partial<InjectOptions> = {
                method: validMethod,
                url: url.pathname + url.search,
                headers: Object.fromEntries( request.headers ),
                ...( method !== "GET" && method !== "HEAD" && {
                    payload: await request.text()
                } )
            };

            const response = await app.inject( injectOptions as InjectOptions ) as LightMyRequestResponse;

            // Convert response to format Bun expects
            const headers = new Headers();
            for ( const [ key, value ] of Object.entries( response.headers ) ) {
                if ( value ) {
                    headers.set( key, Array.isArray( value ) ? value.join( ", " ) : String( value ) );
                }
            }

            return new Response( String( response.payload ), {
                status: response.statusCode,
                headers
            } );
        } catch ( error ) {
            console.error( "Server error:", error );
            return new Response( "Internal Server Error", { status: 500 } );
        }
    }
};
