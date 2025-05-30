import { UIElementInputBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-input-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIInputStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupScalingMaxMembersInput extends UIElementInputBase {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingMaxMembersInput";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getStyle(): Promise<UIInputStyleTypes> {
        return "short";
    }

    protected async getLabel(): Promise<string> {
        return "Max Members per Channel";
    }

    protected async getPlaceholder(): Promise<string> {
        return "Enter a number (e.g., 5)";
    }

    protected async getMinLength(): Promise<number> {
        return 1;
    }

    protected async getMaxLength(): Promise<number> {
        return 2;
    }

    protected async isRequired(): Promise<boolean> {
        return true;
    }

    protected async getValue(): Promise<string> {
        return this.uiArgs?.maxMembersPerChannel || "5";
    }
}
