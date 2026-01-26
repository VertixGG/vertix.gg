import Redis from "ioredis";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const CONNECTION_TIMEOUT = 2000;

export class RedisClient extends InitializeBase {
    private static instance: RedisClient;

    private client: Redis | null = null;
    private subscriber: Redis | null = null;
    private isConnected = false;
    private connectionFailed = false;

    public static getName() {
        return "VertixBase/Modules/RedisClient";
    }

    public static get $(): RedisClient {
        if ( !RedisClient.instance ) {
            RedisClient.instance = new RedisClient();
        }

        return RedisClient.instance;
    }

    public async connect(): Promise<void> {
        if ( this.isConnected ) {
            return;
        }

        if ( this.connectionFailed ) {
            throw new Error( "Redis connection previously failed" );
        }

        const redisOptions = {
            maxRetriesPerRequest: 1,
            connectTimeout: CONNECTION_TIMEOUT,
            enableOfflineQueue: false,
            retryStrategy() {
                // Don't retry - fail fast
                return null;
            },
            lazyConnect: true
        };

        this.client = new Redis( REDIS_URL, redisOptions );
        this.subscriber = new Redis( REDIS_URL, redisOptions );

        // Suppress error events to prevent unhandled rejections
        this.client.on( "error", () => {
            // Silently handle - errors are caught in connect()
        } );

        this.subscriber.on( "error", () => {
            // Silently handle - errors are caught in connect()
        } );

        const connectWithTimeout = ( client: Redis, name: string ): Promise<void> => {
            return new Promise( ( resolve, reject ) => {
                const timeout = setTimeout( () => {
                    this.connectionFailed = true;
                    reject( new Error( `${ name } connection timeout` ) );
                }, CONNECTION_TIMEOUT );

                client.connect()
                    .then( () => {
                        clearTimeout( timeout );
                        resolve();
                    } )
                    .catch( ( error ) => {
                        clearTimeout( timeout );
                        this.connectionFailed = true;
                        reject( error );
                    } );
            } );
        };

        try {
            await Promise.all( [
                connectWithTimeout( this.client, "Client" ),
                connectWithTimeout( this.subscriber, "Subscriber" )
            ] );

            this.isConnected = true;

            this.logger.info( this.connect, `Connected to Redis at ${ REDIS_URL }` );
        } catch( error ) {
            // Clean up on failure
            this.client?.disconnect();
            this.subscriber?.disconnect();
            this.client = null;
            this.subscriber = null;
            this.connectionFailed = true;
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if ( !this.isConnected ) {
            return;
        }

        try {
            await Promise.all( [
                this.client?.quit(),
                this.subscriber?.quit()
            ] );

            this.client = null;
            this.subscriber = null;
            this.isConnected = false;

            this.logger.info( this.disconnect, "Disconnected from Redis" );
        } catch( error ) {
            this.logger.error( this.disconnect, "Error during disconnect", error );
        }
    }

    public getClient(): Redis {
        if ( !this.client || !this.isConnected ) {
            throw new Error( "RedisClient not connected. Call connect() first." );
        }

        return this.client;
    }

    public getSubscriber(): Redis {
        if ( !this.subscriber || !this.isConnected ) {
            throw new Error( "RedisClient not connected. Call connect() first." );
        }

        return this.subscriber;
    }

    public isReady(): boolean {
        return this.isConnected;
    }
}

export default RedisClient;
