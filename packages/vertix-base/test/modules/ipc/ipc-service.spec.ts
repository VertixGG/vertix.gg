import { jest } from "@jest/globals";

import { IPC_NO_RESPONSE, IPCService } from "@vertix.gg/base/src/modules/ipc/ipc-service";

import { RedisClient } from "@vertix.gg/base/src/modules/ipc/redis-client";

import { signIPCEnvelope } from "@vertix.gg/base/src/modules/ipc/ipc-auth";

const SECRET = "a-shared-secret-for-tests",
    REQUEST_CHANNEL = "vertix:management:request",
    RESPONSE_CHANNEL = "vertix:management:response";

/**
 * Stands up `onRequest()` against a redis that records rather than connects.
 *
 * The subscriber's `message` listener is captured so a request can be delivered by hand, which is
 * the only way to observe what the service does - or does not - publish in reply.
 */
async function withRequestHandler( handler: () => Promise<unknown> ) {
    const published: { channel: string; message: string }[] = [];

    let deliver: ( ( channel: string, message: string ) => void ) | null = null;

    jest.spyOn( RedisClient.$, "getSubscriber" ).mockReturnValue( {
        on: ( event: string, listener: ( channel: string, message: string ) => void ) => {
            if ( "message" === event ) {
                deliver = listener;
            }
        },
        subscribe: async() => undefined
    } as never );

    jest.spyOn( RedisClient.$, "getClient" ).mockReturnValue( {
        publish: async( channel: string, message: string ) => {
            published.push( { channel, message } );

            return 1;
        }
    } as never );

    const service = Object.create( IPCService.prototype ) as IPCService;

    Object.assign( service, {
        logger: { log: () => {}, info: () => {}, warn: () => {}, error: () => {} },
        handlers: new Map(),
        requestHandlers: new Map(),
        pendingRequests: new Map()
    } );

    await service.onRequest( REQUEST_CHANNEL, RESPONSE_CHANNEL, handler as never );

    const send = async() => {
        const request = {
            id: "req-1",
            requestId: "req-1",
            timestamp: Date.now(),
            channel: REQUEST_CHANNEL,
            payload: { action: "get_guild_options", guildId: "1110248409761316944" }
        };

        const signed = { ...request, signature: signIPCEnvelope( request ) };

        deliver!( REQUEST_CHANNEL, JSON.stringify( signed ) );

        // The listener is async and not awaited by the emitter, so yield until it has settled.
        await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
    };

    return { published, send };
}

describe( "VertixBase/Modules/IPCService", () => {
    const originalSecret = process.env.IPC_SHARED_SECRET;

    beforeEach( () => {
        process.env.IPC_SHARED_SECRET = SECRET;
    } );

    afterEach( () => {
        jest.restoreAllMocks();

        if ( undefined === originalSecret ) {
            delete process.env.IPC_SHARED_SECRET;
        } else {
            process.env.IPC_SHARED_SECRET = originalSecret;
        }
    } );

    it( "should publish a response when the handler answers", async() => {
        const { published, send } = await withRequestHandler( async() => ( { ok: true } ) );

        await send();

        expect( published ).toHaveLength( 1 );
        expect( published[ 0 ].channel ).toBe( RESPONSE_CHANNEL );
        expect( JSON.parse( published[ 0 ].message ).payload ).toEqual( { ok: true } );
    } );

    // The reason `IPC_NO_RESPONSE` exists. Every shard runs the handler, so a shard that is not the
    // owner has to say nothing at all - returning null would put a successful, empty answer on the
    // wire alongside the real one, and the caller resolves on whichever lands first.
    it( "should publish nothing when the handler declines", async() => {
        const { published, send } = await withRequestHandler( async() => IPC_NO_RESPONSE );

        await send();

        expect( published ).toEqual( [] );
    } );

    // A declining handler is not a failing one - an error response would resolve the caller with a
    // failure rather than let the owning shard answer.
    it( "should not report a declined request as an error either", async() => {
        const { published, send } = await withRequestHandler( async() => IPC_NO_RESPONSE );

        await send();

        expect( published.some( ( p ) => false === JSON.parse( p.message ).success ) ).toBe( false );
    } );

    it( "should still publish a failure when the handler throws", async() => {
        const { published, send } = await withRequestHandler( async() => {
            throw new Error( "handler blew up" );
        } );

        await send();

        expect( published ).toHaveLength( 1 );

        const response = JSON.parse( published[ 0 ].message );

        expect( response.success ).toBe( false );
        expect( response.error ).toBe( "handler blew up" );
    } );
} );
