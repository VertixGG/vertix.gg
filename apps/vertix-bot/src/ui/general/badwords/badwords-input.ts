import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DEFAULT_BADWORDS_PLACEHOLDER } from "@vertix.gg/bot/src/definitions/badwords";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { SerializationContext } from "@vertix.gg/gui/src/bases/ui-serialization";

export class BadwordsInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-General/BadwordsInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "long";
    }

    protected async getLabel(): Promise<string> {
        return "SEPARATE BY `,` FOR NON-EXACT MATCHES USE `*`";
    }

    protected async getPlaceholder(): Promise<string> {
        return DEFAULT_BADWORDS_PLACEHOLDER;
    }

    protected override async getValue( context?: SerializationContext ): Promise<string> {
        const initialData = context?.properties?.initialData;

        // `properties` carries whatever the caller put there, so the shape is checked rather than
        // assumed. It used to be reached through `any`, which read the same and checked nothing -
        // a caller passing a string got a silent `undefined` here instead of an empty field.
        const initialBadwords = initialData && "object" === typeof initialData && ! Array.isArray( initialData )
            ? initialData.badwords
            : undefined;

        if ( Array.isArray( initialBadwords ) ) {
            return initialBadwords.join( ", " );
        }

        return "";
    }

    protected async getMinLength(): Promise<number> {
        return 0;
    }

    protected async getMaxLength(): Promise<number> {
        return 2500;
    }
}
