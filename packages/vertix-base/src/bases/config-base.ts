import crypto from "node:crypto";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ErrorWithMetadata } from "@vertix.gg/base/src/errors";

import { ConfigModel } from "@vertix.gg/base/src/models/config-model";

import type { VersionType } from "@vertix.gg/base/src/models/config-model";

interface ConfigBaseDefaultsInterface {
    [ key: string ]: any;
}

interface ConfigBaseMetaInterface {
    name: string;
    key: string;
    version: VersionType;
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
    protected config: TConfig = {} as TConfig;

    public abstract getConfigName(): string;

    public abstract getVersion(): VersionType;

    protected abstract getDefaults(): TConfig["defaults"];

    protected getConfigModel() {
        return ConfigModel.$;
    }

    protected get model() {
        return this.getConfigModel();
    }

    public constructor( shouldInitialize = true ) {
        super( shouldInitialize );
    }

    public async initialize() {
        const key = this.getConfigName(),
            defaults = this.getDefaults(),
            version = this.getVersion();

        let currentConfig = await this.model.get<TConfig>( key, version );

        if ( ! currentConfig ) {
            await this.model.create<TConfig["defaults"]>( key, defaults, version );

            currentConfig = await this.model.get<TConfig>( key, version );

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
        return <TConfig["defaults"]>this.config.defaults;
    }

    public get meta() {
        return <TConfig["meta"]>this.config.meta;
    }

    public get data() {
        return <TConfig["data"]>this.config.data;
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
        const checksum = ( obj: Record<string, any> ) => {
            const asArray = Object.entries( obj ),
                data = Buffer.from( asArray.map( i => i.join( ":" ) ).join( ";" ) );

            return crypto.createHash("sha256")
                .update(data)
                .digest("hex");
        };

        const checksumA = checksum( objA ),
            checksumB = checksum( objB );

        if ( checksumA !== checksumB ) {
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
