import { ChannelType } from "discord.js";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { isExportRuntime } from "@vertix.gg/gui/src/runtime/ui-runtime-flags";

export type ChannelTypeLike = ChannelType | keyof typeof ChannelType | number | string;

export class UIRuntimeChannelTypeNormalizer extends InitializeBase {
    public static override getName() {
        return "VertixGUI/Runtime/UIRuntimeChannelTypeNormalizer";
    }

    public static normalizeChannelTypesForRuntime( values: readonly ChannelTypeLike[] ): ChannelTypeLike[] {
        return isExportRuntime() ? values.map( this.normalizeOne ) : [ ...values ];
    }

    private static normalizeOne( value: ChannelTypeLike ): ChannelTypeLike {
        if ( typeof value === "string" ) {
            const mapped = ( ChannelType as unknown as Record<string, ChannelType> )[ value ];
            if ( mapped !== undefined ) {
                return mapped;
            }

            const numeric = Number( value );
            if ( Number.isInteger( numeric ) ) {
                return numeric as ChannelType;
            }
        }

        return value as ChannelType;
    }
}

export function normalizeChannelTypesForRuntime( values: readonly ChannelTypeLike[] ): ChannelTypeLike[] {
    return UIRuntimeChannelTypeNormalizer.normalizeChannelTypesForRuntime( values );
}
