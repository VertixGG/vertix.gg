import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

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
