import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingPrefixInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingPrefixInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel(): Promise<string> {
        return "Channel Prefix";
    }

    protected async getPlaceholder(): Promise<string> {
        return "e.g., Game, Voice, Team";
    }

    protected async getMinLength(): Promise<number> {
        return 3;
    }

    protected async getMaxLength(): Promise<number> {
        return 20;
    }

    protected async isRequired(): Promise<boolean> {
        return true;
    }

    protected async getValue(): Promise<string> {
        return this.uiArgs?.channelPrefix || "";
    }
}
