import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class UIWizardNextButton extends UIElementButtonBase {
    public static getName () {
        return "VertixBot/UI-General/WizardNextButton";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel () {
        return "Next ▶";
    }

    protected async getStyle (): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected async isDisabled () {
        return !!this.uiArgs?._wizardIsNextButtonDisabled;
    }

    protected async isAvailable () {
        return !!this.uiArgs?._wizardIsNextButtonAvailable;
    }
}
