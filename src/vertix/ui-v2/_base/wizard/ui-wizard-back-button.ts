import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";
import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class UIWizardBackButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/WizardBackButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "◀ Back";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected async isDisabled() {
        return !! this.uiArgs?._wizardIsBackButtonDisabled;
    }
}
