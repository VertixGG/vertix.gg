import { URLSearchParams } from "url";

import { CookieJar } from "tough-cookie";

import fetch from "cross-fetch";

export class SimpleHttpCookieClient {
    private cookieJar: CookieJar;

    private url: string;

    public constructor ( url: string = "" ) {
        this.cookieJar = new CookieJar();
        this.url = url;
    }

    public async get ( url = this.url, headers: Record<string, string> = {} ): Promise<Response> {
        const requestOptions = {
                method: "GET",
                headers: { ...headers, ...this.getCookiesHeader( url ) }
            },
            response = await fetch( url, requestOptions );

        this.updateCookies( response );

        return response;
    }

    public async post (
        url = this.url,
        data: Record<string, any> | null = null,
        headers: Record<string, string> = {}
    ): Promise<Response> {
        const requestOptions = {
                method: "POST",
                headers: {
                    ...headers,
                    ...this.getCookiesHeader( url ),
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: this.serializeData( data )
            },
            response = await fetch( url, requestOptions );

        this.updateCookies( response );

        return response;
    }

    private getCookiesHeader ( url: string ): Record<string, string> {
        const cookieHeader = this.cookieJar.getCookieStringSync( url );
        return { Cookie: cookieHeader };
    }

    private updateCookies ( response: Response ): void {
        const setCookieHeader = response.headers.get( "set-cookie" );
        if ( setCookieHeader ) {
            this.cookieJar.setCookieSync( setCookieHeader, response.url );
        }
    }

    private serializeData ( data: Record<string, any> | null ): string {
        if ( !data ) return "";

        const searchParams = new URLSearchParams();
        for ( const [ key, value ] of Object.entries( data ) ) {
            searchParams.append( key, value );
        }

        return searchParams.toString();
    }
}
