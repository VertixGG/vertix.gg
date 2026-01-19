import { QueryClient } from "@zenflux/react-commander/query/client";

import type { QueryCache } from "@zenflux/react-commander/query/cache";

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

        return promise.then( handler );
    }
}
