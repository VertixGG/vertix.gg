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
        const initialBadwords = context?.properties?.initialData?.badwords;

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
