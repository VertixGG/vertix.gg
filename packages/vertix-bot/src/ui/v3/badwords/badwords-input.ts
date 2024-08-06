import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DEFAULT_BADWORDS_PLACEHOLDER } from "@vertix.gg/bot/src/definitions/badwords";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class BadwordsInput extends UIElementInputBase {
    public static getName() {
        return "Vertix/UI-V3/BadwordsInput";
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

    protected async getValue(): Promise<string> {
        return this.uiArgs?.badwords.join( ", " )  || "";
    }

    protected async getMinLength(): Promise<number> {
        return 0;
    }

    protected async getMaxLength(): Promise<number> {
        return 2500;
    }
}
