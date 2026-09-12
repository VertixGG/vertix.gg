import { diff } from "jest-diff";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { DataVersioningModelFactory } from "@vertix.gg/data/src/factory/data-versioning-model-factory";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

import type { TVersionType } from "@vertix.gg/data/src/factory/data-versioning-model-factory";

interface ConfigBaseDefaultsInterface {
    [key: string]: any;
}

interface ConfigBaseMetaInterface {
    name: string;
    key: string;
    version: TVersionType;
}

interface ConfigBaseInterface<
    TDefaults extends ConfigBaseDefaultsInterface = ConfigBaseDefaultsInterface,
    TData extends TDefaults = TDefaults,
    TMeta extends ConfigBaseMetaInterface = ConfigBaseMetaInterface
> {
    /**
     * Initial hardcoded defaults for the configuration.
     */
    defaults: TDefaults;

    /**
     * The actual configuration data.
     */
    data: TData;

    /**
     * Metadata about the configuration.
     */
    meta: TMeta;
}

/**
 * Class `ConfigBase` - An abstract class serving as a base for configuration management across different models.
 * Handles initialization, keeping the stored row in step with the defaults, and access to configuration
 * data, defaults, and metadata.
 */
export abstract class ConfigBase<TConfig extends ConfigBaseInterface> extends InitializeBase {
    protected static configModel = new ( DataVersioningModelFactory<PrismaBot.Config, PrismaBot.Prisma.ConfigDelegate>(
        PrismaBotClient.getPrismaClient().config,
        {
            modelNamespace: "VertixData/Models/Config"
        }
    ) )();

    protected config: TConfig = {} as TConfig;

    public abstract getConfigName(): string;

    public abstract getVersion(): TVersionType;

    protected abstract getDefaults(): TConfig[ "defaults" ];

    protected get model() {
        return this.$$.configModel;
    }

    public constructor( shouldInitialize = true ) {
        super( shouldInitialize );
    }

    public async initialize() {
        const key = this.getConfigName(),
            defaults = this.getDefaults(),
            version = this.getVersion();

        let currentConfig = await this.model.get<TConfig>( { key, version } );

        if ( !currentConfig ) {
            await this.model.create<TConfig[ "defaults" ]>( { key, version }, defaults );
        } else if ( await this.syncWithDefaults( { key, version }, defaults, currentConfig ) ) {
            // Rewritten, so what is in hand is the row as it was rather than as it is now.
            currentConfig = null;
        }

        if ( !currentConfig ) {
            currentConfig = await this.model.get<TConfig>( { key, version } );

            if ( !currentConfig ) {
                throw new Error( `Failed to initialize: '${ this.$$.getName() }'` );
            }
        }

        this.config.data = currentConfig;
        this.config.defaults = defaults;
        this.config.meta = {
            name: this.$$.getName(),
            key,
            version
        };
    }

    public get<TKey extends keyof TConfig[ "data" ]>( key: TKey ) {
        return this.data[ key ];
    }

    /**
     * Function `defaults()` - Retrieves configuration defaults
     *
     * @note: The difference between `defaults()` and `data()` is that `defaults()` returns the initial hardcoded defaults
     * while `data()` returns the current configuration from the database.
     */
    public get defaults() {
        return <TConfig[ "defaults" ]> this.config.defaults;
    }

    /**
     * Function `meta()` - Retrieves configuration metadata of current configuration
     */
    public get meta() {
        return <TConfig[ "meta" ]> this.config.meta;
    }

    /**
     * Function `data()` - Retrieves configuration data
     * @note: The difference between `defaults()` and `data()` is that `defaults()` returns the initial hardcoded defaults
     * both have the same interface.
     */
    public get data() {
        return <TConfig[ "data" ]> this.config.data;
    }

    public getKeys<
        TSectionKey extends keyof TConfig[ "defaults" ],
        TSectionKeys extends keyof TConfig[ "defaults" ][ TSectionKey ]
    >( section: TSectionKey ) {
        return Object.fromEntries( Object.entries( this.defaults[ section ] ).map( ( [ key ] ) => [ key, key ] ) ) as Record<
            TSectionKeys,
            TSectionKeys
        >;
    }

    private get $$() {
        return this.constructor as typeof ConfigBase;
    }

    /**
     * Function `syncWithDefaults()` - Brings a stored row back in line with the defaults it mirrors.
     *
     * Nothing writes a config row but this, so a row that differs from `getDefaults()` was left
     * behind by a release rather than chosen by anyone. A setting added since the row was written
     * is simply missing from it, and everything reading the stored config sees it as unset - which
     * is how a button added to the interface never reached the channels created from it.
     *
     * The row is rewritten rather than merged for the same reason: the defaults are the whole
     * truth, so a key they no longer carry is dead weight rather than something to preserve.
     *
     * Answers whether it rewrote, so the caller can read back what it now holds.
     */
    private async syncWithDefaults(
        keys: { key: string; version: TVersionType },
        defaults: TConfig[ "defaults" ],
        stored: TConfig
    ): Promise<boolean> {
        const changes = this.compareToDefaults( defaults, stored );

        if ( !changes.length ) {
            return false;
        }

        this.logger.warn(
            this.syncWithDefaults,
            `Config '${ keys.key }' version '${ keys.version }' is behind its defaults - ${ changes.join( ", " ) }`
        );

        if ( Logger.isDebugEnabled() ) {
            console.log( diff( defaults, stored, { contextLines: 0, expand: false, includeChangeCounts: true } ) );
        }

        // An escape hatch for looking at a row as it was left, rather than as it should be.
        if ( process.argv.includes( "--config-skip-sync" ) ) {
            this.logger.warn( this.syncWithDefaults, `Config '${ keys.key }' left as it is - '--config-skip-sync'` );

            return false;
        }

        // Dropped and written again rather than updated: `update()` deep merges with what is
        // there, which would keep a setting the defaults no longer carry for as long as the row
        // lives. `initialize()` writes it back immediately, and would write it back on the next
        // boot regardless - the defaults are the only source it has ever been built from.
        await this.model.delete( keys );
        await this.model.create<TConfig[ "defaults" ]>( keys, defaults );

        this.logger.info( this.syncWithDefaults, `Config '${ keys.key }' brought up to date` );

        return true;
    }

    /**
     * Function `compareToDefaults()` - What a stored row is missing, holding differently, or holding
     * beyond the defaults.
     *
     * Leaves are compared rather than whole objects, so an array that gained an entry reads as the
     * one index that appeared rather than as the whole array having changed.
     */
    private compareToDefaults( defaults: Record<string, any>, stored: Record<string, any> ) {
        const flatten = ( value: Record<string, any>, prefix = "" ): Array<[ string, unknown ]> =>
            Object.entries( value ).flatMap( ( [ key, entry ] ) => {
                const path = prefix ? `${ prefix }.${ key }` : key;

                return entry && "object" === typeof entry ? flatten( entry, path ) : [ [ path, entry ] as [ string, unknown ] ];
            } );

        const expected = new Map( flatten( defaults ) ),
            actual = new Map( flatten( stored ) );

        const changes: string[] = [];

        expected.forEach( ( value, path ) => {
            if ( !actual.has( path ) ) {
                changes.push( `added '${ path }'` );
            } else if ( actual.get( path ) !== value ) {
                changes.push( `changed '${ path }'` );
            }
        } );

        actual.forEach( ( _value, path ) => {
            if ( !expected.has( path ) ) {
                changes.push( `removed '${ path }'` );
            }
        } );

        return changes;
    }

}

export type { ConfigBaseDefaultsInterface, ConfigBaseInterface };
