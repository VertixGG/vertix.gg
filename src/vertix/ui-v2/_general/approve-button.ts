import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";
import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class ApproveButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/ApproveButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic; // TODO: Should be static.
    }

    protected async getLabel() {
        return "✔ Approve";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "success";
    }
}

