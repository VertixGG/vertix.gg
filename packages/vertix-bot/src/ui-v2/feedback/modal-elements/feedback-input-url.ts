import { UIElementInputBase } from "@vertix.gg/bot/src/ui-v2/_base/elements/ui-element-input-base";

import { UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class FeedbackInputUrl extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-V2/FeedbackInputUrl";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Static;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "long";
    }

    protected async getLabel(): Promise<string> {
        return "Invite Link";
    }

    protected async getMinLength(): Promise<number> {
        return 5;
    }

    protected async getMaxLength(): Promise<number> {
        return 1000;
    }
}
