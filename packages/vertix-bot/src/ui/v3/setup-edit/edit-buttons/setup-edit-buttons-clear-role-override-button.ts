import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupEditButtonsClearRoleOverrideButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/SetupEditButtonsClearRoleOverrideButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Clear role override";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getEmoji(): Promise<string> {
        return "🧹";
    }

    protected async isDisabled(): Promise<boolean> {
        const args = this.uiArgs as { dynamicChannelButtonsRoleId?: string | null } | undefined;
        return !args?.dynamicChannelButtonsRoleId;
    }
}

