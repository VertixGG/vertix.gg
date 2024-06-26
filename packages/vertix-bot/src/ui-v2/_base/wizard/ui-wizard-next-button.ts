import { UIElementButtonBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIButtonStyleTypes} from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class UIWizardNextButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/WizardNextButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Next ▶";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected async isDisabled() {
        return !! this.uiArgs?._wizardIsNextButtonDisabled;
    }

    protected async isAvailable() {
        return !! this.uiArgs?._wizardIsNextButtonAvailable;
    }
}
