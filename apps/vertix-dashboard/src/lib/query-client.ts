import zCore from "@zenflux/core";

import { QueryClient } from "@zenflux/react-commander/query/client";

import type { QueryCache } from "@zenflux/react-commander/query/cache";

const logger = zCore.modules.createLogger( "query-client" );

/**
 * The one method that reads rather than changes something - the only one a failure can be answered
 * with nothing at all.
 */
const READ_METHOD = "GET";

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
     * A failed request carries an error, not the thing that was asked for - and a read and a write
     * need opposite things done about that.
     *
     * A read that fails has somewhere to fall back to. The API answers a failure with
     * `{ error, message }`, and handing that to the response handler parks it in state under the
     * name of the resource - where it is an object, so every `if ( ! state.guildStats )` guard in
     * the app waves it through, and the first component to read a field off it dies reading
     * undefined. Null is the truthful answer: every query module stores a missing resource as null
     * already, and every component that reads one renders something for it.
     *
     * A write that fails has nowhere to fall back to. Nothing on screen changes to say it did not
     * happen, so returning quietly reads exactly like success - the modal closes, the spinner
     * stops, and the setting the person just pressed save on is not saved. So it is raised, and
     * the command that asked for it puts the reason where they can see it.
     */
    private async handleResponse(
        method: string,
        path: string,
        response: Response,
        handler: ( response: Response ) => Promise<unknown>
    ) {
        if ( ! response.ok ) {
            if ( READ_METHOD === method ) {
                logger.error( this.handleResponse, `${ method } ${ path } answered ${ response.status } - no resource` );
                return null;
            }

            const reason = await this.readFailureReason( response );

            logger.error( this.handleResponse, `${ method } ${ path } answered ${ response.status } - ${ reason }` );

            throw new Error( reason );
        }

        return handler( response );
    }

    /**
     * Function readFailureReason() :: The clearest sentence the server gave for refusing.
     *
     * `message` first, since that is the half that names the particular thing that was wrong, and
     * `error` behind it as the summary it was filed under. A failure that answers with neither -
     * or with something that is not json at all, which is what a proxy standing in front of the
     * API returns - leaves the status to speak for itself.
     */
    private async readFailureReason( response: Response ): Promise<string> {
        try {
            const body = await response.json() as { error?: string; message?: string };

            for ( const candidate of [ body?.message, body?.error ] ) {
                if ( "string" === typeof candidate && candidate.length ) {
                    return candidate;
                }
            }
        } catch {
            // Not every failure answers in json, and a failure to read one is not worth reporting
            // over the failure that was already being reported.
        }

        return `The server answered ${ response.status }`;
    }
}
