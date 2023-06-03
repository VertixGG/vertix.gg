import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";
import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

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
