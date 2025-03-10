import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class FeedbackInputUrl extends UIElementInputBase {
    public static getName () {
        return "VertixBot/UI-General/FeedbackInputUrl";
    }

    public static getInstanceType () {
        return UIInstancesTypes.Static;
    }

    protected async getStyle (): Promise<UIInputStyleTypes> {
        return "long";
    }

    protected async getLabel (): Promise<string> {
        return "Invite Link";
    }

    protected async getMinLength (): Promise<number> {
        return 5;
    }

    protected async getMaxLength (): Promise<number> {
        return 1000;
    }
}
