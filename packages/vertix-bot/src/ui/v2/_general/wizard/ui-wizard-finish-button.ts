import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class UIWizardFinishButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/WizardFinishButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "✔ Finish";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "success";
    }

    protected async isDisabled() {
        return !! this.uiArgs?._wizardIsFinishButtonDisabled;
    }

    protected async isAvailable() {
        return !! this.uiArgs?._wizardIsFinishButtonAvailable;
    }
}
