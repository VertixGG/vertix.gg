import { CACHE_IPC_CHANNELS } from "@vertix.gg/definitions/src/cache-ipc-definitions";

import { CacheBase, setCacheInvalidationPublisher } from "@vertix.gg/base/src/bases/cache-base";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import type { ICacheInvalidationMessage } from "@vertix.gg/definitions/src/cache-ipc-definitions";

import type { IPCService } from "@vertix.gg/base/src/modules/ipc/ipc-service";

/**
 * Connects the caches to the wire.
 *
 * `CacheBase` announces an eviction through a hook and applies one through a static, and knows
 * about neither Redis nor this class. That separation is what lets a model be constructed at import
 * time, long before any service exists, and what keeps a process with no Redis working exactly as
 * it did before - it simply never installs a publisher.
 */
export class CacheInvalidation extends InitializeBase {
    private static instance: CacheInvalidation;

    /**
     * Identifies this process on the wire.
     *
     * Redis hands a published message back to the process that sent it, so without something to
     * recognise our own by, every eviction would return and drop an entry we had already dropped.
     */
    private readonly origin: string;

    private isInstalled = false;

    public static getName(): string {
        return "VertixBase/Modules/CacheInvalidation";
    }

    public static getInstance(): CacheInvalidation {
        if ( ! CacheInvalidation.instance ) {
            CacheInvalidation.instance = new CacheInvalidation();
        }

        return CacheInvalidation.instance;
    }

    public static get $(): CacheInvalidation {
        return CacheInvalidation.getInstance();
    }

    public constructor() {
        super();

        this.origin = `${ process.pid }-${ Math.random().toString( 36 ).substring( 2, 9 ) }`;
    }

    public getOrigin(): string {
        return this.origin;
    }

    public getIsInstalled(): boolean {
        return this.isInstalled;
    }

    /**
     * Function install() :: Starts announcing evictions, and applying the ones other processes
     * announce.
     *
     * Call it once the IPC service is ready. If it is not, nothing is installed and the caches keep
     * working on their ttl alone - which is the reason the ttl exists.
     */
    public async install( ipcService: IPCService ): Promise<void> {
        if ( this.isInstalled ) {
            return;
        }

        if ( ! ipcService.isReady() ) {
            this.logger.warn(
                this.install,
                "IPC is not ready - cache invalidation will not be announced across processes, " +
                "and each cache falls back to expiring on its own ttl"
            );

            return;
        }

        await ipcService.subscribe<ICacheInvalidationMessage>(
            CACHE_IPC_CHANNELS.INVALIDATE,
            ( message ) => {
                const payload = message.payload;

                if ( ! payload || payload.origin === this.origin ) {
                    return;
                }

                CacheBase.applyInvalidation( payload );
            }
        );

        // Installed only after the subscription is up, so that a process cannot start announcing
        // evictions it would not itself receive.
        setCacheInvalidationPublisher( ( message ) => {
            void ipcService
                .publish<ICacheInvalidationMessage>( CACHE_IPC_CHANNELS.INVALIDATE, {
                    ... message,
                    origin: this.origin
                } )
                .catch( ( error ) => {
                    // A write already succeeded and the local entry is already gone; the only thing
                    // lost is other processes hearing about it sooner than their ttl.
                    this.logger.warn(
                        this.install,
                        `Could not announce a cache invalidation for '${ message.cache }'`,
                        error
                    );
                } );
        } );

        this.isInstalled = true;

        this.logger.info( this.install, `Cache invalidation installed, origin: '${ this.origin }'` );
    }

    /**
     * Stops announcing. The subscription stays, because a process that is shutting down has nothing
     * to gain from unsubscribing and `IPCService.shutdown()` drops it anyway.
     */
    public uninstall(): void {
        setCacheInvalidationPublisher( null );

        this.isInstalled = false;
    }
}

export default CacheInvalidation;
