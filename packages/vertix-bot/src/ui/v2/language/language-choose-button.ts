import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class LanguageChooseButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/LanguageChooseButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Choose Your Language" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "primary" );
    }

    protected async getEmoji(): Promise<string> {
        return "🌍";
    }
}
