import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { ModelBaseCached } from "@vertix.gg/base/src/bases/model-base";

const client = PrismaBotClient.getPrismaClient();

const E_DATA_TYPES = PrismaBot.E_DATA_TYPES;

type DataTypesMapping = {
    [ E_DATA_TYPES.STRING ]: string;
    [ E_DATA_TYPES.NUMBER ]: number;
    [ E_DATA_TYPES.BOOLEAN ]: boolean;
    [ E_DATA_TYPES.OBJECT ]: object;
    [ E_DATA_TYPES.ARRAY ]: any[];
};

type keys = keyof typeof E_DATA_TYPES;

type DataType = {
    [Key in keys]: DataTypesMapping[typeof E_DATA_TYPES[Key]];
}[keys];

type VersionType = `${ number }.${ number }.${ number }`;

const CONFIG_DEFAULT_VERSION: VersionType = "0.0.0";

export class ConfigModel extends ModelBaseCached<typeof client, PrismaBot.Config> {
    private static instance: ConfigModel | null = null;

    public static getName() {
        return "VertixBase/Models/ConfigModel";
    }

    public static getInstance() {
        if ( ! this.instance ) {
            this.instance = new ConfigModel();
        }

        return this.instance;
    }

    public static get $() {
        return this.getInstance();
    }

    public constructor(
        shouldDebugCache = isDebugEnabled( "CACHE", ConfigModel.getName() ),
        shouldDebugModel = isDebugEnabled( "MODEL", ConfigModel.getName() )
    ) {
        super( shouldDebugCache, shouldDebugModel );
    }

    public async get<T extends DataType>( key: string, version = CONFIG_DEFAULT_VERSION, cache = true ) {
        const cacheKey = this.generateCacheKey(key, version);

        let result = cache ? this.getCache(cacheKey) : null;

        if ( ! result ) {
            result = await this.getClient().config.findUnique( {
                where: {
                    key_version: {
                        key,
                        version
                    }
                }
            } );

            if ( result ) {
                this.setCache( cacheKey, result );
            }
        }

        return result ? this.getValueAsType<T>( result ) : null;
    }

    public async create<T extends DataType>( key: string, value: T, version = CONFIG_DEFAULT_VERSION ) {
        // Check if exists
        if ( await this.get( key, version, true ) ) {
            this.logger.error( this.create, `Key: '${ key }', version: '${ version }' already exists, skipping creation.` );
        }

        const dataType = this.getDataType( value );

        const result = await this.getClient().config.create( {
            data: {
                key,
                version,
                type: dataType,
                [ this.getValueField( dataType ) ]: value
            }
        } );

        if ( result ) {
            this.setCache( this.generateCacheKey( result.key, result.version ), result );
        }

        return result ? this.getValueAsType<T>( result ) : null;
    }

    protected getClient() {
        return client;
    }

    protected getValueField( type: PrismaBot.E_DATA_TYPES ) {
        switch ( type ) {
            default:
                return "value";

            case E_DATA_TYPES.OBJECT:
                return "object";

            case E_DATA_TYPES.ARRAY:
                return "values";
        }
    }

    protected getDataType( value: DataType ) {
        switch ( typeof value ) {
            case "string":
                return E_DATA_TYPES.STRING;
            case "number":
                return E_DATA_TYPES.NUMBER;
            case "boolean":
                return E_DATA_TYPES.BOOLEAN;
            case "object":
                return Array.isArray( value ) ? E_DATA_TYPES.ARRAY : E_DATA_TYPES.OBJECT;
        }
    };

    /**
     * Function getValuesAsType() : Returns the value as the specified type.
     * The function extracts the value from `config` filed according to the `type` field.
     *
     * EG: `E_DATA_TYPES.OBJECT` will use `config.object`
     * EG: `E_DATA_TYPES.ARRAY` will use `config.array`
     */
    protected getValueAsType<T extends DataType>( config: PrismaBot.Config ) {
        switch ( config.type ) {
            case E_DATA_TYPES.STRING:
                return config.value!.toString() as DataTypesMapping[typeof E_DATA_TYPES.STRING] as T;
            case E_DATA_TYPES.NUMBER:
                return Number( config.value ) as DataTypesMapping[typeof E_DATA_TYPES.NUMBER] as T;
            case E_DATA_TYPES.BOOLEAN:
                return Boolean( config.value ) as DataTypesMapping[typeof E_DATA_TYPES.BOOLEAN] as T;
            case E_DATA_TYPES.OBJECT:
                return config.object as DataTypesMapping[typeof E_DATA_TYPES.OBJECT] as T;
            case E_DATA_TYPES.ARRAY:
                return config.values as DataTypesMapping[typeof E_DATA_TYPES.ARRAY] as T;
        }
    }

    private generateCacheKey( key: string, version: string ) {
        return key + "|" + version;
    }
}

export {
    CONFIG_DEFAULT_VERSION
};

export type {
    VersionType
};
