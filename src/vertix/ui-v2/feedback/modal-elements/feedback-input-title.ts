import { UIElementInputBase } from "@vertix/ui-v2/_base/elements/ui-element-input-base";

import { UIInputStyleTypes, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

export class FeedbackInputTitle extends UIElementInputBase {
    public static getName() {
        return "Vertix/UI-V2/FeedbackInputTitle";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel(): Promise<string> {
        return "Title";
    }

    protected async getMinLength(): Promise<number> {
        return 5;
    }

    protected async getMaxLength(): Promise<number> {
        return 50;
    }
}
