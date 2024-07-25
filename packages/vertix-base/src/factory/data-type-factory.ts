import "@vertix.gg/prisma/bot-client";

import type { TObjectMixinBase } from "@vertix.gg/base/src/bases/object-base";

const dataTypes = {
    string: "string",
    number: "number",
    boolean: "boolean",
    object: "object",
    array: "array"
} as const;

type TDefaultTypesMapping = {
    [ dataTypes.string ]: string;
    [ dataTypes.number ]: number;
    [ dataTypes.boolean ]: boolean;
    [ dataTypes.object ]: object;
    [ dataTypes.array ]: any[];
};

type keys = keyof typeof dataTypes;

type TDataType = {
    [Key in keys]: TDefaultTypesMapping[typeof dataTypes[Key]];
}[keys];

export interface TDefaultResult {
    object: PrismaBot.Prisma.JsonValue | null
    value: string | null
    values: string[]
    type: TDataType,
    version: string
    key: string
};

// TODO: Make this extendable/configurable.
export function DataTypeFactory<TExtendClass extends typeof TObjectMixinBase>( ExtendClass: TExtendClass ) {
    abstract class DataTypeAbstract extends ExtendClass {
        public static getName() {
            return "VertixBase/Models/DataType";
        }

        protected constructor( ... args: any[]) {
            super( ... args );
        }

        protected getValueField( type: TDataType ) {
            switch ( type ) {
                default:
                    return "value";

                case dataTypes.object:
                    return "object";

                case dataTypes.array:
                    return "values";
            }
        }

        protected getDataType( value: TDataType ) {
            switch ( typeof value ) {
                case "string":
                    return dataTypes.string;
                case "number":
                    return dataTypes.number;
                case "boolean":
                    return dataTypes.boolean;
                case "object":
                    return Array.isArray( value ) ? dataTypes.array : dataTypes.object;
            }
        };

        /**
         * Function getValuesAsType() : Returns the value as the specified type.
         * The function extracts the value from `config` filed according to the `type` field.
         *
         * EG: `dataTypeEnum.object` will use `config.object`
         * EG: `dataTypeEnum.array` will use `config.array`
         */
        protected getValueAsType<T extends TDataType>( result: TDefaultResult ) {
            switch ( result.type ) {
                case dataTypes.string:
                    return result.value!.toString() as TDefaultTypesMapping[typeof dataTypes.string] as T;
                case dataTypes.number:
                    return Number( result.value ) as TDefaultTypesMapping[typeof dataTypes.number] as T;
                case dataTypes.boolean:
                    return Boolean( result.value ) as TDefaultTypesMapping[typeof dataTypes.boolean] as T;
                case dataTypes.object:
                    return result.object as TDefaultTypesMapping[typeof dataTypes.object] as T;
                case dataTypes.array:
                    return result.values as TDefaultTypesMapping[typeof dataTypes.array] as T;
            }

            throw new Error( `Unknown type: ${ result.type }` );
        }
    }

    return DataTypeAbstract;
}
