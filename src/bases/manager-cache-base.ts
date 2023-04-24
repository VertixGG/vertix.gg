import Debugger from "@dynamico/utils/debugger";

import InitializeBase from "@internal/bases/initialize-base";

export abstract class ManagerCacheBase<CacheResult> extends InitializeBase {
    private cache: Map<string, CacheResult>;

    private cacheDebugger: Debugger;

    public constructor( debugState = true  ) {
        super();

        this.cacheDebugger = new Debugger( this, undefined, debugState );

        this.cache = new Map<string, CacheResult>();
    }

    protected getCache( key: string ) {
        this.logger.log( this.getCache, `Getting cache for key: '${ key }'` );

        const result = this.cache.get( key );

        if ( result ) {
            this.cacheDebugger.log( this.getCache, `Got cache for key: '${ key }'` );
            this.cacheDebugger.dumpDown( this.setCache, result );
        }

        return result;
    }

    protected setCache( key: string, value: any ): void {
        this.logger.log( this.setCache, `Setting cache for key: '${ key }'` );

        this.cacheDebugger.dumpDown( this.setCache, value );

        this.cache.set( key, value );
    }

    protected deleteCache( key: string ): boolean {
        this.logger.log( this.deleteCache, `Deleting cache for key: '${ key }'` );

        return this.cache.delete( key );
    }

    protected deleteCacheWithPrefix( prefix: string ): void {
        this.logger.log( this.deleteCacheWithPrefix, `Deleting cache prefix: '${ prefix }'` );

        for ( const key of this.cache.keys() ) {
            if ( key.startsWith( prefix ) ) {
                this.deleteCache( key );
            }
        }
    }
}
