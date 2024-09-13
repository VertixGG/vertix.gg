import crypto from "node:crypto";

import { diff } from "jest-diff";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ErrorWithMetadata } from "@vertix.gg/base/src/errors";

import { DataVersioningModelFactory } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

import type { TVersionType } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

interface ConfigBaseDefaultsInterface {
    [ key: string ]: any;
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
    defaults: TDefaults;
    data: TData
    meta: TMeta;
}

export abstract class ConfigBase<
    TConfig extends ConfigBaseInterface
> extends InitializeBase {
    protected static configModel = new ( DataVersioningModelFactory<
        PrismaBot.Config,
        PrismaBot.Prisma.ConfigDelegate
    >( PrismaBotClient.getPrismaClient().config, {
        modelNamespace: "VertixBase/Models/Config"
    } ) );

    protected config: TConfig = {} as TConfig;

    public abstract getConfigName(): string;

    public abstract getVersion(): TVersionType;

    protected abstract getDefaults(): TConfig["defaults"];

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

        if ( ! currentConfig ) {
            await this.model.create<TConfig["defaults"]>( { key, version }, defaults );

            currentConfig = await this.model.get<TConfig>( { key, version } );

            if ( ! currentConfig ) {
                throw new Error( `Failed to initialize: '${ this.$$.getName() }'` );
            }
        }

        this.validateChecksum( defaults, currentConfig );

        this.config.data = currentConfig;
        this.config.defaults = defaults;
        this.config.meta = {
            name: this.$$.getName(),
            key,
            version
        };
    }

    public get<TKey extends keyof TConfig["data"]>( key: TKey ) {
        return this.data[ key ];
    };

    public get defaults() {
        return <TConfig["defaults"]> this.config.defaults;
    }

    public get meta() {
        return <TConfig["meta"]> this.config.meta;
    }

    public get data() {
        return <TConfig["data"]> this.config.data;
    }

    public getKeys<
        TSectionKey extends keyof TConfig["defaults"],
        TSectionKeys extends keyof TConfig["defaults"][TSectionKey]
    >( section: TSectionKey ) {
        return Object.fromEntries(
            Object.entries( this.defaults[ section ] ).map( ( [ key, ] ) => [ key, key ] )
        ) as Record<TSectionKeys, TSectionKeys>;
    }

    private get $$() {
        return this.constructor as typeof ConfigBase;
    }

    private validateChecksum( objA: Record<string, any>, objB: Record<string, any> ) {
        // Validate checksum
        const extractEntries = ( obj: Record<string, any>, prefix = "" ): [ string, any ][] => {
            return Object.entries( obj ).flatMap( ( [ key, value ] ) => {
                const newKey = prefix ? `${ prefix }.${ key }` : key;
                if ( typeof value === "object" && value !== null ) {
                    return extractEntries( value, newKey );
                }
                return [ [ newKey, value ] ];
            } );
        };

        const checksum = ( obj: Record<string, any> ) => {
            const entries = extractEntries( obj );
            const data = Buffer.from( entries.map( ( [ key, value ] ) => `${ key }:${ value }` ).join( ";" ) );

            return crypto.createHash( "sha256" )
                .update( data )
                .digest( "hex" );
        };

        const checksumA = checksum( objA ),
            checksumB = checksum( objB );

        if ( checksumA !== checksumB ) {
            console.log( diff( objA, objB, {
                contextLines: 0,
                expand: false,
                includeChangeCounts: true,
            } ) );
            throw new ErrorWithMetadata( `Checksum mismatch for: '${ this.$$.getName() }'`, {
                checksumA,
                checksumB
            } );
        }
    }
}

export type {
    ConfigBaseDefaultsInterface,
    ConfigBaseInterface
};
