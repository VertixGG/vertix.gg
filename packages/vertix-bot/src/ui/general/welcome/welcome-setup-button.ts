import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class WelcomeSetupButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/WelcomeSetupButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Setup" );
    }

    protected async getEmoji(): Promise<string> {
        return "🛠";
    }
}
