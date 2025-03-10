import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

export abstract class CacheBase<CacheResult> extends InitializeBase {
    private readonly cache: Map<string, CacheResult>;

    private cacheDebugger: Debugger;

    protected constructor ( shouldDebugCache = true ) {
        super();

        this.cacheDebugger = new Debugger( this, undefined, shouldDebugCache );

        this.cache = new Map<string, CacheResult>();
    }

    protected getCache ( key: string ) {
        this.cacheDebugger.log( this.getCache, `Getting cache for key: '${ key }'` );

        const result = this.cache.get( key );

        if ( result ) {
            this.cacheDebugger.log( this.getCache, `Got cache for key: '${ key }'` );
            this.cacheDebugger.dumpDown( this.setCache, result );
        }

        return result;
    }

    protected getCacheMap () {
        return this.cache;
    }

    protected setCache ( key: string, value: CacheResult ): void {
        this.cacheDebugger.log( this.setCache, `Setting cache for key: '${ key }'` );

        this.cacheDebugger.dumpDown( this.setCache, value );

        this.cache.set( key, value );
    }

    protected deleteCache ( key: string ): boolean {
        this.cacheDebugger.log( this.deleteCache, `Deleting cache for key: '${ key }'` );

        if ( !this.cache.has( key ) ) {
            this.cacheDebugger.log( this.deleteCache, `Cache for key: '${ key }' does not exist` );

            return false;
        }

        return this.cache.delete( key );
    }

    protected deleteCacheWithPrefix ( prefix: string ): void {
        this.cacheDebugger.log( this.deleteCacheWithPrefix, `Deleting cache prefix: '${ prefix }'` );

        for ( const key of this.cache.keys() ) {
            if ( key.startsWith( prefix ) ) {
                this.deleteCache( key );
            }
        }
    }
}
