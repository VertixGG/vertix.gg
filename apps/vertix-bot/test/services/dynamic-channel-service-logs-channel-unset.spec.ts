import { jest } from "@jest/globals";

import { RESTJSONErrorCodes } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { EmbedBuilder } from "discord.js";

const LOGS_CHANNEL_ID = "830000000000000009",
    MASTER_CHANNEL_ID = "830000000000000002";

type Flusher = { logEmbeds( logsChannelId: string ): Promise<void> };

/**
 * Stands up only what the flush touches: the buffer it reads, the channel it sends to, and the
 * logger it complains to. Whether the send goes through is the whole subject, so it is handed in.
 */
async function makeFlusher( sendResult: () => Promise<unknown> ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );

    const { ConfigManager } = await import( "@vertix.gg/data/src/managers/config-manager" );

    jest.spyOn( ConfigManager.$, "get" ).mockReturnValue( { getKeys: () => ( {} ) } as never );

    const { MasterChannelDataManager } = await import( "@vertix.gg/data/src/managers/master-channel-data-manager" );

    const unset = jest.spyOn( MasterChannelDataManager.$, "setChannelLogsChannel" )
        .mockResolvedValue( undefined as never );

    const masterChannelDB = { id: "master-db-id", channelId: MASTER_CHANNEL_ID };

    const buffered = {
        masterChannelDB,
        logsChannel: { id: LOGS_CHANNEL_ID, send: () => sendResult() },
        embeds: [ {} as EmbedBuilder ],
        timer: undefined as unknown as NodeJS.Timeout
    };

    const state = {
        logInChannelDebounceMap: new Map( [ [ LOGS_CHANNEL_ID, buffered ] ] ),
        logger: { error: () => undefined, admin: () => undefined },
        log: () => undefined,
        logEmbeds: ( DynamicChannelService.prototype as unknown as Flusher ).logEmbeds
    };

    return {
        unset,
        buffered,
        flush: () => ( state as unknown as Flusher ).logEmbeds( LOGS_CHANNEL_ID )
    };
}

const aDiscordError = ( code: number ) => Object.assign( new Error( `discord said ${ code }` ), { code } );

/**
 * A failed send used to be read one way only: the logs channel is no good, so unset the one the
 * server configured. Most failures say nothing about the channel - discord rate limiting us, discord
 * having a bad minute, a payload it would not take - and a single bad second turned a server's
 * logging off for good without telling anybody.
 */
describe( "VertixBot/Services/DynamicChannel/logs channel unset", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    describe( "keeps the channel", () => {
        it( "when the send went through", async() => {
            const { flush, unset } = await makeFlusher( () => Promise.resolve( {} ) );

            await flush();

            expect( unset ).not.toHaveBeenCalled();
        } );

        it( "when discord refused for a reason that is not about the channel", async() => {
            const { flush, unset } = await makeFlusher( () =>
                Promise.reject( aDiscordError( RESTJSONErrorCodes.CannotSendAnEmptyMessage ) )
            );

            await flush();

            expect( unset ).not.toHaveBeenCalled();
        } );

        it( "when the request never reached discord at all", async() => {
            const { flush, unset } = await makeFlusher( () => Promise.reject( new Error( "socket hang up" ) ) );

            await flush();

            expect( unset ).not.toHaveBeenCalled();
        } );
    } );

    describe( "unsets the channel", () => {
        const unusable = [
            [ "the channel is gone", RESTJSONErrorCodes.UnknownChannel ],
            [ "the bot cannot see it", RESTJSONErrorCodes.MissingAccess ],
            [ "the bot cannot post in it", RESTJSONErrorCodes.MissingPermissions ]
        ] as const;

        it.each( unusable )( "when %s", async( _reason, code ) => {
            const { flush, unset } = await makeFlusher( () => Promise.reject( aDiscordError( code ) ) );

            await flush();

            expect( unset ).toHaveBeenCalledTimes( 1 );
            expect( unset.mock.calls[ 0 ][ 1 ] ).toBeNull();
        } );
    } );

    /**
     * Held onto, a channel that keeps refusing would gather lines until the send carried more embeds
     * than discord takes - which is the failure this path had until recently.
     */
    it( "should empty the buffer whether the send went or not", async() => {
        const { flush, buffered } = await makeFlusher( () =>
            Promise.reject( aDiscordError( RESTJSONErrorCodes.MissingAccess ) )
        );

        await flush();

        expect( buffered.embeds ).toHaveLength( 0 );
    } );
} );
