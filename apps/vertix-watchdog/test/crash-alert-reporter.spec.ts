import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { CrashAlertReporter } from "@vertix.gg/watchdog/src/crash-alert-reporter";

const WEBHOOK_URL = "https://discord.test/api/webhooks/vertix/watchdog";

interface IPostedPayload {
    username: string;
    content?: string;
    allowed_mentions: { parse: string[] };
    embeds: Array<{
        title: string;
        description: string;
        color: number;
        fields: Array<{ name: string; value: string }>;
        footer?: { text: string };
    }>;
}

describe( "VertixWatchdog/CrashAlertReporter", () => {
    let fetchMock: jest.Mock;
    let consoleError: jest.SpiedFunction<typeof console.error>;

    function postedPayload(): IPostedPayload {
        const [ , init ] = fetchMock.mock.calls[ 0 ] as [ string, { body: string } ];

        return JSON.parse( init.body ) as IPostedPayload;
    }

    beforeEach( () => {
        fetchMock = jest.fn( async() => ( { ok: true, status: 204, statusText: "No Content" } ) );

        globalThis.fetch = fetchMock as unknown as typeof fetch;

        consoleError = jest.spyOn( console, "error" ).mockImplementation( () => undefined );

        process.env.DISCORD_ERROR_WEBHOOK_URL = WEBHOOK_URL;

        delete process.env.WATCHDOG_WEBHOOK_URL;
        delete process.env.WATCHDOG_ALERT_MENTION;
    } );

    afterEach( () => {
        consoleError.mockRestore();

        delete process.env.DISCORD_ERROR_WEBHOOK_URL;
        delete process.env.WATCHDOG_WEBHOOK_URL;
        delete process.env.WATCHDOG_ALERT_MENTION;
    } );

    describe( "report()", () => {
        it( "should post a crash embed to the webhook", async() => {
            await new CrashAlertReporter().report( {
                kind: "down",
                app: "vertix-api",
                detail: "pm2 is restarting it.",
                status: "stopped",
                exitCode: 1,
                restarts: 4
            } );

            expect( fetchMock ).toHaveBeenCalledTimes( 1 );
            expect( fetchMock.mock.calls[ 0 ][ 0 ] ).toBe( WEBHOOK_URL );

            const payload = postedPayload();

            expect( payload.username ).toBe( "vertix-watchdog" );
            expect( payload.embeds[ 0 ].title ).toBe( "vertix-api went down" );
            expect( payload.embeds[ 0 ].fields ).toEqual( [
                { name: "Status", value: "stopped", inline: true },
                { name: "Exit code", value: "1", inline: true },
                { name: "Restarts", value: "4", inline: true }
            ] );
        } );

        it( "should title each kind for what happened", async() => {
            const reporter = new CrashAlertReporter();

            for ( const kind of [ "gave-up", "revived", "recovered" ] as const ) {
                await reporter.report( { kind, app: "vertix-bot-1", detail: "" } );
            }

            const titles = fetchMock.mock.calls.map(
                ( [ , init ] ) => ( JSON.parse( ( init as { body: string } ).body ) as IPostedPayload ).embeds[ 0 ].title
            );

            expect( titles ).toEqual( [
                "pm2 gave up on vertix-bot-1",
                "vertix-bot-1 restarted by the watchdog",
                "vertix-bot-1 is back"
            ] );
        } );

        it( "should stay silent when no webhook is configured", async() => {
            delete process.env.DISCORD_ERROR_WEBHOOK_URL;

            await new CrashAlertReporter().report( { kind: "down", app: "vertix-api", detail: "" } );

            expect( fetchMock ).not.toHaveBeenCalled();
        } );

        it( "should prefer the watchdog's own webhook over the shared error one", async() => {
            process.env.WATCHDOG_WEBHOOK_URL = "https://discord.test/api/webhooks/vertix/own";

            await new CrashAlertReporter().report( { kind: "down", app: "vertix-api", detail: "" } );

            expect( fetchMock.mock.calls[ 0 ][ 0 ] ).toBe( "https://discord.test/api/webhooks/vertix/own" );
        } );

        it( "should ping only for a crash, not for the watchdog handling one", async() => {
            process.env.WATCHDOG_ALERT_MENTION = "<@1234>";

            const reporter = new CrashAlertReporter();

            await reporter.report( { kind: "gave-up", app: "vertix-api", detail: "" } );
            await reporter.report( { kind: "recovered", app: "vertix-api", detail: "" } );

            const payloads = fetchMock.mock.calls.map(
                ( [ , init ] ) => JSON.parse( ( init as { body: string } ).body ) as IPostedPayload
            );

            expect( payloads[ 0 ].content ).toBe( "<@1234>" );
            expect( payloads[ 0 ].allowed_mentions.parse ).toEqual( [ "users", "roles" ] );

            expect( payloads[ 1 ].content ).toBeUndefined();
            expect( payloads[ 1 ].allowed_mentions.parse ).toEqual( [] );
        } );

        it( "should note suppressed repeats in the footer", async() => {
            await new CrashAlertReporter().report( {
                kind: "down",
                app: "vertix-api",
                detail: "",
                suppressedRepeats: 7
            } );

            expect( postedPayload().embeds[ 0 ].footer ).toEqual( { text: "7 repeat(s) suppressed" } );
        } );

        it( "should swallow a refusal from the webhook", async() => {
            fetchMock.mockResolvedValue( { ok: false, status: 429, statusText: "Too Many Requests" } );

            await expect(
                new CrashAlertReporter().report( { kind: "down", app: "vertix-api", detail: "" } )
            ).resolves.toBeUndefined();

            expect( consoleError ).toHaveBeenCalled();
        } );

        it( "should swallow a webhook that never answers", async() => {
            fetchMock.mockRejectedValue( new Error( "The operation timed out." ) );

            await expect(
                new CrashAlertReporter().report( { kind: "down", app: "vertix-api", detail: "" } )
            ).resolves.toBeUndefined();

            expect( consoleError ).toHaveBeenCalled();
        } );
    } );

    describe( "flush()", () => {
        it( "should wait for an alert that is still on the wire", async() => {
            let release: () => void = () => undefined;

            fetchMock.mockImplementation( () => new Promise( ( resolve ) => {
                release = () => resolve( { ok: true, status: 204, statusText: "No Content" } );
            } ) );

            const reporter = new CrashAlertReporter();

            void reporter.report( { kind: "down", app: "vertix-api", detail: "" } );

            let flushed = false;

            const flushing = reporter.flush().then( () => {
                flushed = true;
            } );

            await Promise.resolve();

            expect( flushed ).toBe( false );

            release();

            await flushing;

            expect( flushed ).toBe( true );
        } );
    } );
} );
