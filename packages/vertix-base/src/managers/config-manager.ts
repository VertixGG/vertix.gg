import { SingletonBase } from "@vertix.gg/base/src/bases/singleton-base";

import { ConfigBase } from "@vertix.gg/base/src/bases/config-base";

import type { ConfigBaseInterface } from "@vertix.gg/base/src/bases/config-base";
import type { TVersionType } from "@vertix.gg/base/src/factory/data-versioning-model-factory";

export class ConfigManager extends SingletonBase {
    private configs: Map<string, ConfigBase<ConfigBaseInterface>> = new Map();

    public static getName() {
        return "VertixBase/Managers/ConfigManager";
    }

    public static get $() {
        return this.getInstance<ConfigManager>();
    }

    public constructor() {
        super();
    }

    public async register<T extends ConfigBase<ConfigBaseInterface>>( Config: new ( ...args: any []) => T ) {
        const config = new Config( false ),
            key = this.generateKey( config );

        if ( this.configs.has( key ) ) {
            throw new Error( `Config with name ${ config.getName() } already exists` );
        }

        await config.initialize();

        this.configs.set( key, config );
    }

    public get<T extends ConfigBaseInterface>( name: string, version: TVersionType ) {
        const key = this.generateKey( name, version );

        if ( !this.configs.has( key ) ) {
            throw new Error( `Config with name: '${ name }', version: '${ version }' does not exist` );
        }

        return this.configs.get( key ) as ConfigBase<T>;
    }

    private generateKey( name: string, version: string ): string;
    private generateKey( Config: ConfigBase<ConfigBaseInterface> ): string;

    private generateKey( ... args: any[] ): string {
        if ( args[0] instanceof ConfigBase ) {
            return `${ args[0].getConfigName() }_${ args[0].getVersion() }`;
        }

        return `${ args[0] }_${ args[1] }`;
    }
}
