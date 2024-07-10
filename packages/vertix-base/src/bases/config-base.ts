import { ConfigModel  } from "@vertix.gg/base/src/models/config-model";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

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

        this.config.data = currentConfig;
        this.config.defaults = this.getDefaults();
        this.config.meta = {
            name: this.$$.getName(),
            key,
            version
        };
    }

    public get( key: string ) {
        return this.config.data[ key ];
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

    private get $$() {
        return this.constructor as typeof ConfigBase;
    }
}

export type {
    ConfigBaseDefaultsInterface,
    ConfigBaseInterface
};
