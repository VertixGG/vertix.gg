import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { EmbedBuilder } from "discord.js";

const LOGS_CHANNEL_ID = "830000000000000009",
    VOICE_CHANNEL_ID = "830000000000000001";

// Discord takes ten embeds in a message and no more, which is why the buffer is flushed at ten.
const MAX_EMBEDS_PER_MESSAGE = 10;

type Buffered = {
    masterChannelDB: unknown;
    logsChannel: { send: ( payload: { embeds: EmbedBuilder[] } ) => Promise<unknown> };
    embeds: EmbedBuilder[];
    timer: NodeJS.Timeout;
};

/**
 * Stands up only what the buffering actually touches: the map it fills, the logger it complains to,
 * and its own `logEmbeds`. Everything the service would otherwise drag in with it is left out, the
 * way `resolveTargetChannel` is tested next door.
 */
async function makeLogger() {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-service" );

    const { ConfigManager } = await import( "@vertix.gg/data/src/managers/config-manager" );

    // Stood in for rather than registered: registering a real config reads it out of the database,
    // and the manager below only wants one so that it can be constructed at all.
    jest.spyOn( ConfigManager.$, "get" ).mockReturnValue( { getKeys: () => ( {} ) } as never );

    const { MasterChannelDataManager } = await import( "@vertix.gg/data/src/managers/master-channel-data-manager" );

    jest.spyOn( MasterChannelDataManager.$, "getChannelLogsChannelId" )
        .mockResolvedValue( LOGS_CHANNEL_ID );

    const sent: EmbedBuilder[][] = [];

    const logsChannel = {
        id: LOGS_CHANNEL_ID,
        send: ( payload: { embeds: EmbedBuilder[] } ) => {
            sent.push( [ ... payload.embeds ] );

            return Promise.resolve( {} );
        }
    };

    const channel = {
        id: VOICE_CHANNEL_ID,
        guildId: "830000000000000100",
        name: "a room",
        guild: { channels: { cache: { get: () => logsChannel } } }
    };

    const prototype = DynamicChannelService.prototype as unknown as {
        logInChannelDebounce( masterChannelDB: unknown, channel: unknown, message: string ): Promise<void>;
        logEmbeds( logsChannelId: string ): Promise<void>;
    };

    const state = {
        logInChannelDebounceMap: new Map<string, Buffered>(),
        logger: { error: () => undefined },
        log: () => undefined,
        logEmbeds: prototype.logEmbeds
    };

    return {
        state,
        sent,
        write: ( message: string ) =>
            prototype.logInChannelDebounce.call( state, { channelId: "master-channel" }, channel, message )
    };
}

/**
 * Lines about a room are gathered up and sent to the guild's logs channel together, so a burst of
 * them is one message rather than twenty.
 *
 * The buffer is filed under the logs channel it is bound for. The flush at ten asked for it by the
 * room the line was about instead - a key nothing is ever stored at - so it found nothing and
 * returned, and the buffer went on filling. Discord takes ten embeds and no more, and the catch on
 * a failed send reads the failure as a logs channel that is no good any more and unsets the one the
 * guild configured.
 */
describe( "VertixBot/Services/DynamicChannel/log buffer", () => {
    beforeEach( () => {
        // So the debounce timer never fires; what is being tested is the other way the buffer empties.
        jest.useFakeTimers();
    } );

    afterEach( () => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    } );

    it( "should gather a few lines up rather than send each one", async() => {
        const { write, sent, state } = await makeLogger();

        await write( "first" );
        await write( "second" );

        expect( sent ).toHaveLength( 0 );
        expect( state.logInChannelDebounceMap.get( LOGS_CHANNEL_ID )?.embeds ).toHaveLength( 2 );
    } );

    it( "should send what it has once it reaches what discord takes", async() => {
        const { write, sent } = await makeLogger();

        for ( let index = 0; index < MAX_EMBEDS_PER_MESSAGE + 1; index++ ) {
            await write( `line ${ index }` );
        }

        expect( sent ).toHaveLength( 1 );
        expect( sent[ 0 ] ).toHaveLength( MAX_EMBEDS_PER_MESSAGE );
    } );

    it( "should never hold more than discord takes", async() => {
        const { write, state } = await makeLogger();

        for ( let index = 0; index < MAX_EMBEDS_PER_MESSAGE * 3; index++ ) {
            await write( `line ${ index }` );
        }

        const held = state.logInChannelDebounceMap.get( LOGS_CHANNEL_ID )?.embeds.length ?? 0;

        expect( held ).toBeLessThanOrEqual( MAX_EMBEDS_PER_MESSAGE );
    } );

    it( "should keep gathering after a send rather than stop", async() => {
        const { write, sent, state } = await makeLogger();

        for ( let index = 0; index < MAX_EMBEDS_PER_MESSAGE + 1; index++ ) {
            await write( `line ${ index }` );
        }

        await write( "after the send" );

        expect( sent ).toHaveLength( 1 );
        expect( state.logInChannelDebounceMap.get( LOGS_CHANNEL_ID )?.embeds ).toHaveLength( 2 );
    } );
} );
