const DISCORD_ERROR_UNKNOWN_CHANNEL = 10003,
    DISCORD_ERROR_UNKNOWN_GUILD = 10004,
    DISCORD_ERROR_RATE_LIMITED = 429;

type TLookupResult = { state: string; value?: unknown };

type TLookup = {
    lookup<TValue>( fetch: () => Promise<TValue>, goneCode: number ): Promise<TLookupResult>;
};

/**
 * Reads nothing off the worker but its logger, so it is called against the prototype rather than
 * standing one up - which would want a discord client and a database connection.
 */
async function makeLookup() {
    const { CleanupWorker } = await import( "@vertix.gg/bot/src/_workers/cleanup-worker" );

    const prototype = CleanupWorker.prototype as unknown as TLookup;

    const errors: unknown[] = [];

    const state = {
        logger: { error: ( ...args: unknown[] ) => void errors.push( args ) },
        lookup: prototype.lookup
    };

    return {
        errors,
        lookup: <TValue>( fetch: () => Promise<TValue>, goneCode: number ) =>
            ( state as unknown as TLookup ).lookup( fetch, goneCode )
    };
}

const discordError = ( code: number ) => Object.assign( new Error( `discord ${ code }` ), { code } );

/**
 * The sweep deletes a row when discord says the thing behind it is gone. It used to read every
 * failure that way too - a rate limit, a bad minute, a request that never arrived all arrived as
 * `null`, and `null` meant delete. `ChannelData` cascades, so that took live servers' settings with
 * it. Telling "gone" from "could not ask" is the whole of the fix.
 */
describe( "VertixBot/Workers/CleanupWorker/lookup", () => {
    it( "should report what it found", async() => {
        const { lookup } = await makeLookup();

        const result = await lookup( () => Promise.resolve( "a-guild" ), DISCORD_ERROR_UNKNOWN_GUILD );

        expect( result.state ).toBe( "found" );
        expect( result.value ).toBe( "a-guild" );
    } );

    it( "should report a guild discord says is not there as gone", async() => {
        const { lookup } = await makeLookup();

        const result = await lookup(
            () => Promise.reject( discordError( DISCORD_ERROR_UNKNOWN_GUILD ) ),
            DISCORD_ERROR_UNKNOWN_GUILD
        );

        expect( result.state ).toBe( "gone" );
    } );

    it( "should report a channel discord says is not there as gone", async() => {
        const { lookup } = await makeLookup();

        const result = await lookup(
            () => Promise.reject( discordError( DISCORD_ERROR_UNKNOWN_CHANNEL ) ),
            DISCORD_ERROR_UNKNOWN_CHANNEL
        );

        expect( result.state ).toBe( "gone" );
    } );

    // The case that used to read as "delete this row".
    it( "should report a rate limit as unreachable, not as gone", async() => {
        const { lookup, errors } = await makeLookup();

        const result = await lookup(
            () => Promise.reject( discordError( DISCORD_ERROR_RATE_LIMITED ) ),
            DISCORD_ERROR_UNKNOWN_GUILD
        );

        expect( result.state ).toBe( "unreachable" );
        expect( errors ).toHaveLength( 1 );
    } );

    it( "should report a request that never reached discord as unreachable", async() => {
        const { lookup } = await makeLookup();

        const result = await lookup(
            () => Promise.reject( new Error( "socket hang up" ) ),
            DISCORD_ERROR_UNKNOWN_GUILD
        );

        expect( result.state ).toBe( "unreachable" );
    } );

    // An unknown channel is not an unknown guild: asking about one and being refused for the other
    // is still discord failing to answer the question that was put to it.
    it( "should not treat another kind of not-found as gone", async() => {
        const { lookup } = await makeLookup();

        const result = await lookup(
            () => Promise.reject( discordError( DISCORD_ERROR_UNKNOWN_CHANNEL ) ),
            DISCORD_ERROR_UNKNOWN_GUILD
        );

        expect( result.state ).toBe( "unreachable" );
    } );
} );
