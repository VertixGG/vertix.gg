import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class FeedbackInputDescription extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-V2/FeedbackInputDescription";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "long";
    }

    protected async getLabel(): Promise<string> {
        return "Description";
    }

    protected async getMinLength(): Promise<number> {
        return 10;
    }

    protected async getMaxLength(): Promise<number> {
        return 2000;
    }
}
