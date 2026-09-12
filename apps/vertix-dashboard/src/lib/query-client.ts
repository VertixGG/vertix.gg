import zCore from "@zenflux/core";

import { QueryClient } from "@zenflux/react-commander/query/client";

import type { QueryCache } from "@zenflux/react-commander/query/cache";

const logger = zCore.modules.createLogger( "query-client" );

export class AuthenticatedQueryClient extends QueryClient {
    private readonly _baseURL: string;

    public constructor( baseURL: string, cache?: QueryCache ) {
        super( baseURL, cache );
        this._baseURL = baseURL;
    }

    public fetch(
        method: string,
        route: string,
        args: Record<string, unknown>,
        handler: ( response: Response ) => Promise<unknown>
    ) {
        const url = new URL( `${ this._baseURL }/${ route }` );

        for ( const key in args ) {
            url.pathname = url.pathname.replace( `:${ key }`, String( args[ key ] ) );
        }

        const promise = globalThis.fetch( url.toString(), {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: method === "GET" ? undefined : JSON.stringify( args ),
        } );

        return promise.then( ( response ) => this.handleResponse( method, url.pathname, response, handler ) );
    }

    /**
     * A failed request carries an error, not the thing that was asked for.
     *
     * The API answers a failure with `{ statusCode, error, message }`, and handing that to the
     * response handler parks it in state under the name of the resource - where it is an object,
     * so every `if ( ! state.guildStats )` guard in the app waves it through, and the first
     * component to read a field off it dies reading undefined. Nothing is a truthful answer here,
     * and every query module already stores a missing resource as null.
     */
    private async handleResponse(
        method: string,
        path: string,
        response: Response,
        handler: ( response: Response ) => Promise<unknown>
    ) {
        if ( ! response.ok ) {
            logger.error( this.handleResponse, `${ method } ${ path } answered ${ response.status } - no resource` );
            return null;
        }

        return handler( response );
    }
}
