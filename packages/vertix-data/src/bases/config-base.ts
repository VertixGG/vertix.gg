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
     * Function `defaults()` - What the source ships, before this deployment was set.
     *
     * Not public, and that is the point of it: outside this class there is one configuration, and
     * it is the row. A setting read from here would be the value before anybody changed it, which
     * is never the question being asked - every caller that used to read it was after what a
     * generator gets when nothing else says otherwise, and that is what the row holds.
     *
     * Kept for the two things that are genuinely about the source: bringing a row into the shape
     * the code has, and naming the keys a section carries.
     */
    protected get defaults() {
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

    /**
     * Function `getKeys()` - The settings this configuration carries, as a map of name to name.
     *
     * Spelling a setting through this rather than as a string is what makes a rename a compile
     * error at every use site instead of a lookup that silently finds nothing.
     */
    public getKeys<TKeys extends keyof TConfig[ "defaults" ]>() {
        return Object.fromEntries(
            Object.entries( this.defaults ).map( ( [ key ] ) => [ key, key ] )
        ) as Record<TKeys, TKeys>;
    }

    private get $$() {
        return this.constructor as typeof ConfigBase;
    }

    /**
     * Function `syncWithDefaults()` - Gives the stored row the shape the defaults have, and leaves
     * every value it already held.
     *
     * The defaults decide which settings exist; the row decides what they are. A setting added
     * since the row was written is missing from it, and everything reading the config sees it as
     * unset - which is how a button added to the interface never reached the channels created from
     * it. One the defaults no longer carry is dead weight, and goes.
     *
     * What the row says a setting *is*, though, is left exactly as it is. That is the reason for
     * the row: changing a default in the source is a release, and changing it in the database is
     * how this deployment is set - a sync that rewrote values would undo the second every time the
     * bot restarted.
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
        // lives. What goes back is the defaults' shape carrying the stored values, so the keys are
        // the source's and the answers are the row's.
        await this.model.delete( keys );
        await this.model.create<TConfig[ "defaults" ]>( keys, this.reshapeToDefaults( defaults, stored ) );

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
    /**
     * Function `reshapeToDefaults()` - The defaults' shape, answered with what the row already said.
     *
     * Walked from the defaults, so a setting they dropped is left behind by not being asked for,
     * and one they added arrives carrying the value the source gives it. Everything else keeps
     * what the row held, including a value somebody set by hand.
     */
    private reshapeToDefaults( defaults: Record<string, any>, stored: Record<string, any> ): Record<string, any> {
        const reshaped: Record<string, any> = {};

        Object.entries( defaults ).forEach( ( [ key, value ] ) => {
            const held = ( stored as Record<string, any> )?.[ key ];

            if ( value && "object" === typeof value && !Array.isArray( value ) ) {
                reshaped[ key ] = this.reshapeToDefaults( value, held ?? {} );

                return;
            }

            reshaped[ key ] = undefined === held ? value : held;
        } );

        return reshaped;
    }

    /**
     * Function `compareToDefaults()` - Which settings the stored row is missing, and which it holds
     * that no longer exist.
     *
     * Paths only. A value that differs from the default is the whole point of the row being in the
     * database rather than in the source: it is what somebody set, and reporting it as drift would
     * be the first step to overwriting it.
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

        expected.forEach( ( _value, path ) => {
            if ( !actual.has( path ) ) {
                changes.push( `added '${ path }'` );
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
