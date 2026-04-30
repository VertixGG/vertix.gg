import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DeleteConfirmInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-General/DeleteConfirmInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel(): Promise<string> {
        return "TYPE DELETE TO CONFIRM";
    }

    protected async getPlaceholder(): Promise<string> {
        return "DELETE";
    }

    protected async getValue(): Promise<string> {
        return "";
    }

    protected async getMinLength(): Promise<number> {
        return 6;
    }

    protected async getMaxLength(): Promise<number> {
        return 6;
    }
}
