import { UIElementButtonBase } from "@vertix/ui-v2/_base/elements/ui-element-button-base";

import { UIButtonStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class TemplateModifyButton extends UIElementButtonBase {
    public static getName() {
        return "Vertix/UI-V2/TemplateModifyButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getLabel() {
        return "Modify Channel Name";
    }

    protected async getEmoji(): Promise<string> {
        return "#️⃣";
    }
}
