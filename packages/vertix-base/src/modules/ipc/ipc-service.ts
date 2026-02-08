
import { RedisClient } from "./redis-client";

import { createIPCMessage, createIPCRequest, createIPCResponse } from "./ipc-messages";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import type { IPCChannel, IPCMessage, IPCRequest, IPCResponse } from "./ipc-messages";

type MessageHandler<T = unknown> = ( message: IPCMessage<T> ) => void | Promise<void>;
type RequestHandler<TReq = unknown, TRes = unknown> = ( request: IPCRequest<TReq> ) => Promise<TRes>;

interface PendingRequest<T> {
    resolve: ( value: T ) => void;
    reject: ( error: Error ) => void;
    timeout: NodeJS.Timeout;
}

export class IPCService extends ServiceBase {
    private handlers: Map<IPCChannel, Set<MessageHandler>> = new Map();
    private requestHandlers: Map<IPCChannel, RequestHandler> = new Map();
    private pendingRequests: Map<string, PendingRequest<unknown>> = new Map();
    private initializationSucceeded = false;
    private responseChannelSubscribed = false;

    public static getName(): string {
        return "VertixBase/Modules/IPCService";
    }

    protected async initialize(): Promise<void> {
        try {
            await RedisClient.$.connect();

            this.initializationSucceeded = true;
            this.logger.info( this.initialize, "IPC Service initialized" );
        } catch {
            this.initializationSucceeded = false;
            this.logger.warn( this.initialize, "IPC Service initialization failed - Redis not available" );
        }
    }

    public async shutdown(): Promise<void> {
        this.handlers.clear();
        await RedisClient.$.disconnect();

        this.logger.info( this.shutdown, "IPC Service shutdown complete" );
    }

    public async publish<T>( channel: IPCChannel, payload: T ): Promise<void> {
        const message = createIPCMessage( channel, payload );
        const serialized = JSON.stringify( message );

        await RedisClient.$.getClient().publish( channel, serialized );

        this.logger.log( this.publish, `Published message to ${ channel }: ${ message.id }` );
    }

    public async subscribe<T = unknown>( channel: IPCChannel, handler: MessageHandler<T> ): Promise<void> {
        if ( !this.handlers.has( channel ) ) {
            this.handlers.set( channel, new Set() );

            const subscriber = RedisClient.$.getSubscriber();

            subscriber.on( "message", ( receivedChannel, messageStr ) => {
                if ( receivedChannel !== channel ) {
                    return;
                }

                try {
                    const message = JSON.parse( messageStr ) as IPCMessage<T>;

                    this.logger.log( this.subscribe, `Received message on ${ channel }: ${ message.id }` );

                    const channelHandlers = this.handlers.get( channel );

                    if ( channelHandlers ) {
                        for ( const h of channelHandlers ) {
                            try {
                                const result = h( message );

                                if ( result instanceof Promise ) {
                                    result.catch( ( error ) => {
                                        this.logger.error( this.subscribe, `Handler error on ${ channel }`, error );
                                    } );
                                }
                            } catch( error ) {
                                this.logger.error( this.subscribe, `Handler error on ${ channel }`, error );
                            }
                        }
                    }
                } catch( error ) {
                    this.logger.error( this.subscribe, `Failed to parse message on ${ channel }`, error );
                }
            } );

            await subscriber.subscribe( channel );

            this.logger.log( this.subscribe, `Subscribed to channel: ${ channel }` );
        }

        this.handlers.get( channel )!.add( handler as MessageHandler );
    }

    public unsubscribe<T = unknown>( channel: IPCChannel, handler: MessageHandler<T> ): void {
        const channelHandlers = this.handlers.get( channel );

        if ( channelHandlers ) {
            channelHandlers.delete( handler as MessageHandler );

            this.logger.log( this.unsubscribe, `Unsubscribed handler from channel: ${ channel }` );
        }
    }

    public isReady(): boolean {
        return this.initializationSucceeded && RedisClient.$.isReady();
    }

    public async request<TReq, TRes>(
        requestChannel: IPCChannel,
        responseChannel: IPCChannel,
        payload: TReq,
        timeoutMs: number = 10000
    ): Promise<TRes> {
        await this.ensureResponseChannelSubscribed( responseChannel );

        const request = createIPCRequest( requestChannel, payload );
        const serialized = JSON.stringify( request );

        return new Promise<TRes>( ( resolve, reject ) => {
            const timeout = setTimeout( () => {
                this.pendingRequests.delete( request.requestId );
                reject( new Error( `Request timed out after ${ timeoutMs }ms` ) );
            }, timeoutMs );

            this.pendingRequests.set( request.requestId, {
                resolve: resolve as ( value: unknown ) => void,
                reject,
                timeout
            } );

            RedisClient.$.getClient().publish( requestChannel, serialized ).catch( ( error ) => {
                this.pendingRequests.delete( request.requestId );
                clearTimeout( timeout );
                reject( error );
            } );

            this.logger.log( this.request, `Sent request ${ request.requestId } to ${ requestChannel }` );
        } );
    }

    public async onRequest<TReq, TRes>(
        requestChannel: IPCChannel,
        responseChannel: IPCChannel,
        handler: RequestHandler<TReq, TRes>
    ): Promise<void> {
        this.requestHandlers.set( requestChannel, handler as RequestHandler );

        const subscriber = RedisClient.$.getSubscriber();

        subscriber.on( "message", async( receivedChannel, messageStr ) => {
            if ( receivedChannel !== requestChannel ) {
                return;
            }

            try {
                const request = JSON.parse( messageStr ) as IPCRequest<TReq>;

                this.logger.log( this.onRequest, `Received request ${ request.requestId } on ${ requestChannel }` );

                const requestHandler = this.requestHandlers.get( requestChannel );

                if ( !requestHandler ) {
                    return;
                }

                try {
                    const result = await requestHandler( request );
                    const response = createIPCResponse( responseChannel, request.requestId, result, true );
                    const serialized = JSON.stringify( response );

                    await RedisClient.$.getClient().publish( responseChannel, serialized );

                    this.logger.log( this.onRequest, `Sent response for ${ request.requestId } to ${ responseChannel }` );
                } catch( error ) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    const response = createIPCResponse( responseChannel, request.requestId, null, false, errorMessage );
                    const serialized = JSON.stringify( response );

                    await RedisClient.$.getClient().publish( responseChannel, serialized );

                    this.logger.error( this.onRequest, `Error handling request ${ request.requestId }`, error );
                }
            } catch( error ) {
                this.logger.error( this.onRequest, `Failed to parse request on ${ requestChannel }`, error );
            }
        } );

        await subscriber.subscribe( requestChannel );

        this.logger.log( this.onRequest, `Listening for requests on ${ requestChannel }` );
    }

    private async ensureResponseChannelSubscribed( responseChannel: IPCChannel ): Promise<void> {
        if ( this.responseChannelSubscribed ) {
            return;
        }

        const subscriber = RedisClient.$.getSubscriber();

        subscriber.on( "message", ( receivedChannel, messageStr ) => {
            if ( receivedChannel !== responseChannel ) {
                return;
            }

            try {
                const response = JSON.parse( messageStr ) as IPCResponse<unknown>;

                this.logger.log( this.ensureResponseChannelSubscribed, `Received response for ${ response.requestId }` );

                const pending = this.pendingRequests.get( response.requestId );

                if ( pending ) {
                    clearTimeout( pending.timeout );
                    this.pendingRequests.delete( response.requestId );

                    if ( response.success ) {
                        pending.resolve( response.payload );
                    } else {
                        pending.reject( new Error( response.error || "Request failed" ) );
                    }
                }
            } catch( error ) {
                this.logger.error( this.ensureResponseChannelSubscribed, "Failed to parse response", error );
            }
        } );

        await subscriber.subscribe( responseChannel );
        this.responseChannelSubscribed = true;

        this.logger.log( this.ensureResponseChannelSubscribed, `Subscribed to response channel: ${ responseChannel }` );
    }
}

export default IPCService;
