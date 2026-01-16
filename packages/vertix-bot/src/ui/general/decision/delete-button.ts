import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DeleteButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/DeleteButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    public getId(): string {
        return "delete";
    }

    protected async getLabel() {
        return "Delete";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "danger";
    }
}
