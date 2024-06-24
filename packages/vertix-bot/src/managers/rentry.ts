import { SimpleHttpCookieClient } from "@vertix.gg/utils/src/simple-http-cookie-client";
import { CookieJar } from "tough-cookie";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

const RENTRY_BASE_URL = "https://rentry.co",
    RENTRY_BASE_HEADER = { "Referer": RENTRY_BASE_URL };

export class RentryManager extends InitializeBase {
    private static instance: RentryManager;

    public static getName() {
        return "Managers/Rentry";
    }

    public static getInstance() {
        if ( ! this.instance ) {
            this.instance = new RentryManager();
        }

        return this.instance;
    }

    public static get $() {
        return this.getInstance();
    }

    public async raw( url: string ): Promise<{
        "url": string,
        "edit_code": string,
        "text": string,
    }> {
        const client = new SimpleHttpCookieClient( `${ RENTRY_BASE_URL }/api/raw/${ url }` ),
            response = await client.get();

        return response.json();
    }

    public async new( url: string, editCode: string, text: string ): Promise<{
        "url": string,
        "edit_code": string,
    }> {
        const client = new SimpleHttpCookieClient( RENTRY_BASE_URL ),
            response = await client.get(),
            setCookieHeader = response.headers.get( "set-cookie" );

        if ( ! setCookieHeader ) {
            throw new Error( "Failed to fetch CSRF token" );
        }

        const csrftoken = new CookieJar().setCookieSync( setCookieHeader, RENTRY_BASE_URL ),
            payload = {
                "csrfmiddlewaretoken": csrftoken.value,
                "url": url,
                "edit_code": editCode,
                "text": text,
            },
            headers = { ... RENTRY_BASE_HEADER, "Content-Type": "application/x-www-form-urlencoded" },
            postResponse = await client.post( `${ RENTRY_BASE_URL }/api/new`, payload, headers );

        return postResponse.json().then( ( json ) => {
            this.logger.debug( this.new,
                `URL: '${ url }', Edit Code: '${ editCode }', CSRFToken: '${ csrftoken.value } - response:`,
                json
            );

            return json;
        } );
    }

    public async edit( url: string, editCode: string, text: string ): Promise<{
        "url": string,
        "edit_code": string,
    }> {
        const client = new SimpleHttpCookieClient( RENTRY_BASE_URL ),
            response = await client.get(),
            setCookieHeader = response.headers.get( "set-cookie" );

        if ( ! setCookieHeader ) {
            throw new Error( "Failed to fetch CSRF token" );

        }

        const csrftoken = new CookieJar().setCookieSync( setCookieHeader, RENTRY_BASE_URL ),
            payload = {
                "csrfmiddlewaretoken": csrftoken.value,
                "edit_code": editCode,
                "text": text,
            },
            headers = { ... RENTRY_BASE_HEADER, "Content-Type": "application/x-www-form-urlencoded" };

        const postResponse = await client.post( `${ RENTRY_BASE_URL }/api/edit/${ url }`, payload, headers );

        return postResponse.json().then( ( json ) => {
            this.logger.debug( this.edit,
                `URL: '${ url }', Edit Code: '${ editCode }', CSRFToken: '${ csrftoken.value } - response:`,
                json
            );

            return json;
        } );
    }
}
