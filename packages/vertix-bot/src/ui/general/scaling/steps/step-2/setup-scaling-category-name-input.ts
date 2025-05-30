import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingCategoryNameInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingCategoryNameInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel(): Promise<string> {
        return "Category Name";
    }

    protected async getPlaceholder(): Promise<string> {
        return "e.g., Auto-Scaling Voice Channels";
    }

    protected async getMinLength(): Promise<number> {
        return 1;
    }

    protected async getMaxLength(): Promise<number> {
        return 100; // Discord category name limit
    }

    protected async isRequired(): Promise<boolean> {
        return true;
    }
}
