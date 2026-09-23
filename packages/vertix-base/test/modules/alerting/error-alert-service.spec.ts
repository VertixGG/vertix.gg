import { jest } from "@jest/globals";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { withAlertContext } from "@vertix.gg/base/src/modules/alerting/alert-context";

import { ErrorAlertService } from "@vertix.gg/base/src/modules/alerting/error-alert-service";

const WEBHOOK_URL = "https://discord.test/api/webhooks/vertix/error-alerts";

interface ISentEmbed {
    title: string;
    description?: string;
    fields: { name: string; value: string }[];
    footer?: { text: string };
}

describe( "VertixBase/Modules/ErrorAlertService", () => {
    let service: ErrorAlertService;
    let logger: Logger;
    let fetchMock: jest.Mock;
    let now: number;
    let loggerDisabled: string | undefined;
    let originalFetch: typeof globalThis.fetch;

    const sentEmbeds = (): ISentEmbed[] =>
        fetchMock.mock.calls.map( ( [ , init ] ) => JSON.parse( init.body ).embeds[ 0 ] );

    const raise = async( message: string, ...params: unknown[] ) => {
        logger.error( raise, message, ...params );

        await service.flush();
    };

    beforeEach( async() => {
        loggerDisabled = process.env.LOGGER_DISABLED;
        originalFetch = globalThis.fetch;

        process.env.LOGGER_DISABLED = "false";

        now = 1_700_000_000_000;

        jest.spyOn( Date, "now" ).mockImplementation( () => now );

        jest.spyOn( console, "log" ).mockImplementation( () => undefined );
        jest.spyOn( console, "error" ).mockImplementation( () => undefined );

        fetchMock = jest.fn().mockResolvedValue( { ok: true, status: 204, statusText: "No Content" } );

        globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;

        process.env.DISCORD_ERROR_WEBHOOK_URL = WEBHOOK_URL;
        process.env.ERROR_ALERT_DEDUPE_WINDOW_MS = "60000";
        process.env.ERROR_ALERT_MAX_PER_MINUTE = "3";

        logger = new Logger( "VertixBase/Test/AlertSource" );

        service = new ErrorAlertService();

        await service.getInitialization().promise;
    } );

    afterEach( async() => {
        await service.stop();

        globalThis.fetch = originalFetch;

        if ( undefined === loggerDisabled ) {
            delete process.env.LOGGER_DISABLED;
        } else {
            process.env.LOGGER_DISABLED = loggerDisabled;
        }

        delete process.env.DISCORD_ERROR_WEBHOOK_URL;
        delete process.env.ERROR_ALERT_DEDUPE_WINDOW_MS;
        delete process.env.ERROR_ALERT_MAX_PER_MINUTE;

        jest.restoreAllMocks();
    } );

    describe( "which lines it reports", () => {
        it( "should post an error line to the webhook", async() => {
            // Act.
            await raise( "Database went away" );

            // Assert.
            expect( fetchMock ).toHaveBeenCalledTimes( 1 );

            const [ url, init ] = fetchMock.mock.calls[ 0 ];

            expect( url ).toBe( WEBHOOK_URL );
            expect( init.method ).toBe( "POST" );
            expect( sentEmbeds()[ 0 ].title ).toBe( "Database went away" );
        } );

        it( "should ignore every level other than error", async() => {
            // Act.
            logger.log( raise, "a log line" );
            logger.info( raise, "an info line" );
            logger.debug( raise, "a debug line" );
            logger.warn( raise, "a warn line" );
            logger.admin( raise, "an admin line" );

            await service.flush();

            // Assert.
            expect( fetchMock ).not.toHaveBeenCalled();
        } );

        it( "should stay silent when no webhook is configured", async() => {
            // Arrange.
            delete process.env.DISCORD_ERROR_WEBHOOK_URL;

            // Act.
            await raise( "Database went away" );

            // Assert.
            expect( fetchMock ).not.toHaveBeenCalled();
        } );

        /**
         * `logger.error( caller, "", error )` is how fifty-one call sites report something that
         * threw, and discord draws an embed with an empty title as having no heading at all - a
         * red box with a stack in it and nothing saying what happened.
         */
        it( "should title a line logged without a message by the error it carried", async() => {
            // Act.
            await raise( "", new Error( "Missing Permissions" ) );

            // Assert.
            expect( sentEmbeds()[ 0 ].title ).toBe( "Error: Missing Permissions" );
        } );

        it( "should fall back to the source when there is no message and no error either", async() => {
            // Act.
            await raise( "" );

            // Assert.
            expect( sentEmbeds()[ 0 ].title ).toBe( "VertixBase/Test/AlertSource::raise" );
        } );

        it( "should prefer the logged message over the error it carried", async() => {
            // Act.
            await raise( "Could not build the room", new Error( "Missing Permissions" ) );

            // Assert.
            expect( sentEmbeds()[ 0 ].title ).toBe( "Could not build the room" );
        } );

        it( "should carry the source and an error's stack", async() => {
            // Arrange.
            const error = new Error( "Connection reset" );

            error.stack = "Error: Connection reset\n    at somewhere";

            // Act.
            await raise( "Database went away", error );

            // Assert.
            const embed = sentEmbeds()[ 0 ];

            expect( embed.fields[ 0 ].value ).toContain( "VertixBase/Test/AlertSource" );
            expect( embed.description ).toContain( "at somewhere" );
        } );
    } );

    describe( "what it says", () => {
        const fieldNamed = ( embed: ISentEmbed, name: string ) =>
            embed.fields.find( ( field ) => field.name === name )?.value;

        it( "should not print the heading again as the first line under it", async() => {
            // Act.
            await raise( "", new Error( "Missing Permissions" ) );

            // Assert.
            const embed = sentEmbeds()[ 0 ];

            expect( embed.title ).toBe( "Error: Missing Permissions" );
            expect( embed.description ).not.toContain( "Error: Missing Permissions" );
        } );

        it( "should keep an error's own text when the line was given a message of its own", async() => {
            // Act.
            await raise( "Could not build the room", new Error( "Missing Permissions" ) );

            // Assert.
            expect( sentEmbeds()[ 0 ].description ).toContain( "Error: Missing Permissions" );
        } );

        it( "should cut a frame back to its place in the repo", async() => {
            // Arrange.
            const error = new Error( "Missing Permissions" );

            error.stack = [
                "Error: Missing Permissions",
                "    at onLeave (/Users/someone/dev/vertix.gg/packages/vertix-bot/src/services/channel-service.ts:88:12)"
            ].join( "\n" );

            // Act.
            await raise( "", error );

            // Assert.
            const description = sentEmbeds()[ 0 ].description ?? "";

            expect( description ).toContain( "packages/vertix-bot/src/services/channel-service.ts:88:12" );
            expect( description ).not.toContain( "/Users/someone" );
        } );

        it( "should drop the frames that are node's own", async() => {
            // Arrange.
            const error = new Error( "Missing Permissions" );

            error.stack = [
                "Error: Missing Permissions",
                "    at onLeave (/repo/apps/vertix-bot/src/services/channel-service.ts:88:12)",
                "    at run (/repo/node_modules/discord.js/src/client.js:1:1)",
                "    at process (node:internal/process/task_queues:95:5)"
            ].join( "\n" );

            // Act.
            await raise( "", error );

            // Assert.
            const description = sentEmbeds()[ 0 ].description ?? "";

            expect( description ).toContain( "channel-service.ts:88:12" );
            expect( description ).not.toContain( "node_modules" );
            expect( description ).not.toContain( "task_queues" );
        } );
    } );

    describe( "where it happened", () => {
        const fieldNamed = ( embed: ISentEmbed, name: string ) =>
            embed.fields.find( ( field ) => field.name === name )?.value;

        it( "should say which guild, channel and user the failure came from", async() => {
            // Act.
            await withAlertContext( {
                guildId: "1110248409761316944",
                guildName: "Vertix Testing",
                channelId: "1110248409761316948",
                channelName: "Join to create",
                userId: "967842504024383508",
                userName: "leo"
            }, () => raise( "Could not build the room" ) );

            // Assert.
            const where = fieldNamed( sentEmbeds()[ 0 ], "Where" ) ?? "";

            expect( where ).toContain( "Vertix Testing (1110248409761316944)" );
            expect( where ).toContain( "Join to create (1110248409761316948)" );
            expect( where ).toContain( "leo (967842504024383508)" );
        } );

        it( "should follow the failure down through the awaits below it", async() => {
            // Arrange - the failure is raised three awaits deep, which is where one actually is.
            const deep = async() => {
                await Promise.resolve();
                await Promise.resolve();

                await raise( "Could not build the room" );
            };

            // Act.
            await withAlertContext( { guildId: "1110248409761316944", guildName: "Vertix Testing" }, deep );

            // Assert.
            expect( fieldNamed( sentEmbeds()[ 0 ], "Where" ) ).toContain( "Vertix Testing" );
        } );

        it( "should still print an id that arrived without a name", async() => {
            // Act.
            await withAlertContext( { guildId: "1110248409761316944" }, () => raise( "Could not build the room" ) );

            // Assert.
            expect( fieldNamed( sentEmbeds()[ 0 ], "Where" ) ).toContain( "1110248409761316944" );
        } );

        it( "should leave the field off for a failure with no interaction behind it", async() => {
            // Act - a background job, outside any context.
            await raise( "Cleanup worker failed" );

            // Assert.
            expect( fieldNamed( sentEmbeds()[ 0 ], "Where" ) ).toBeUndefined();
        } );
    } );

    describe( "what happened just before", () => {
        const fieldNamed = ( embed: ISentEmbed, name: string ) =>
            embed.fields.find( ( field ) => field.name === name )?.value;

        it( "should carry the lines logged before the error, whatever their level", async() => {
            // Arrange.
            logger.info( raise, "Member joined the generator" );
            logger.log( raise, "Building the room" );
            logger.warn( raise, "Category is nearly full" );

            // Act.
            await raise( "Could not build the room" );

            // Assert.
            const before = fieldNamed( sentEmbeds()[ 0 ], "Just before" ) ?? "";

            expect( before ).toContain( "[INFO]" );
            expect( before ).toContain( "Member joined the generator" );
            expect( before ).toContain( "Building the room" );
            expect( before ).toContain( "Category is nearly full" );
        } );

        it( "should not open with a copy of the error it is reporting", async() => {
            // Arrange.
            logger.info( raise, "Member joined the generator" );

            // Act.
            await raise( "Could not build the room" );

            // Assert.
            const before = fieldNamed( sentEmbeds()[ 0 ], "Just before" ) ?? "";

            expect( before ).not.toContain( "Could not build the room" );
        } );

        it( "should report only the most recent few", async() => {
            // Arrange.
            for ( let i = 0; i < 20; i++ ) {
                logger.info( raise, `line ${ i }` );
            }

            // Act.
            await raise( "Could not build the room" );

            // Assert.
            const before = fieldNamed( sentEmbeds()[ 0 ], "Just before" ) ?? "";

            expect( before ).toContain( "line 19" );
            expect( before ).not.toContain( "line 11" );
        } );

        it( "should leave the field off when there is nothing to say", async() => {
            // Act.
            await raise( "Could not build the room" );

            // Assert.
            expect( fieldNamed( sentEmbeds()[ 0 ], "Just before" ) ).toBeUndefined();
        } );
    } );

    describe( "dedupe", () => {
        it( "should report the same failure once inside the window", async() => {
            // Act.
            await raise( "Database went away" );
            await raise( "Database went away" );
            await raise( "Database went away" );

            // Assert.
            expect( fetchMock ).toHaveBeenCalledTimes( 1 );
        } );

        it( "should still report a different failure", async() => {
            // Act.
            await raise( "Database went away" );
            await raise( "Discord refused the request" );

            // Assert.
            expect( fetchMock ).toHaveBeenCalledTimes( 2 );
        } );

        it( "should report again once the window has passed, saying how many it held back", async() => {
            // Act.
            await raise( "Database went away" );
            await raise( "Database went away" );
            await raise( "Database went away" );

            now += 60000;

            await raise( "Database went away" );

            // Assert.
            expect( fetchMock ).toHaveBeenCalledTimes( 2 );
            expect( sentEmbeds()[ 1 ].footer?.text ).toContain( "2 repeat(s) suppressed" );
        } );

        it( "should not claim repeats it never held back", async() => {
            // Act.
            await raise( "Database went away" );

            // Assert.
            expect( sentEmbeds()[ 0 ].footer ).toBeUndefined();
        } );
    } );

    describe( "rate limit", () => {
        it( "should stop sending once the cap is reached", async() => {
            // Act.
            await raise( "First" );
            await raise( "Second" );
            await raise( "Third" );
            await raise( "Fourth" );
            await raise( "Fifth" );

            // Assert.
            expect( fetchMock ).toHaveBeenCalledTimes( 3 );
        } );

        it( "should say how many it dropped on the next line it does send", async() => {
            // Act.
            await raise( "First" );
            await raise( "Second" );
            await raise( "Third" );
            await raise( "Fourth" );
            await raise( "Fifth" );

            now += 60000;

            await raise( "Sixth" );

            // Assert.
            expect( fetchMock ).toHaveBeenCalledTimes( 4 );
            expect( sentEmbeds()[ 3 ].footer?.text ).toContain( "2 other alert(s) dropped by the rate limit" );
        } );

        it( "should let the cap refill after a minute", async() => {
            // Act.
            await raise( "First" );
            await raise( "Second" );
            await raise( "Third" );

            now += 60000;

            await raise( "Fourth" );
            await raise( "Fifth" );

            // Assert.
            expect( fetchMock ).toHaveBeenCalledTimes( 5 );
        } );
    } );

    describe( "failure of its own", () => {
        it( "should not alert on lines it logged itself", async() => {
            // Arrange.
            const ownLogger = new Logger( "VertixBase/Modules/ErrorAlertService" );

            // Act.
            ownLogger.error( raise, "failed to deliver an alert" );

            await service.flush();

            // Assert.
            expect( fetchMock ).not.toHaveBeenCalled();
        } );

        it( "should swallow a refusal from the webhook", async() => {
            // Arrange.
            fetchMock.mockResolvedValue( { ok: false, status: 429, statusText: "Too Many Requests" } );

            // Act.
            await raise( "Database went away" );

            // Assert.
            expect( console.error ).toHaveBeenCalled();
        } );

        it( "should swallow a webhook that never answers", async() => {
            // Arrange.
            fetchMock.mockRejectedValue( new Error( "socket hang up" ) );

            // Act.
            await raise( "Database went away" );

            // Assert.
            expect( console.error ).toHaveBeenCalled();
        } );
    } );

    describe( "flush", () => {
        it( "should not answer until an already-logged alert has been delivered", async() => {
            // Arrange.
            let delivered = false;
            let release = () => undefined as void;

            const inTransit = new Promise<void>( ( resolve ) => {
                release = () => {
                    delivered = true;

                    resolve();
                };
            } );

            fetchMock.mockImplementation( () =>
                inTransit.then( () => ( { ok: true, status: 204, statusText: "No Content" } ) )
            );

            // Act.
            logger.error( raise, "Database went away" );

            setTimeout( release, 10 );

            await service.flush();

            // Assert.
            expect( delivered ).toBe( true );
        } );
    } );

    describe( "stop", () => {
        it( "should stop reporting once it has been stopped", async() => {
            // Arrange.
            await service.stop();

            // Act.
            logger.error( raise, "Database went away" );

            await service.flush();

            // Assert.
            expect( fetchMock ).not.toHaveBeenCalled();
        } );
    } );
} );
