import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export class SetupEditButtonsClearRoleOverrideButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditButtonsClearRoleOverrideButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Use The Default For This Role";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "secondary";
    }

    protected async getEmoji(): Promise<string> {
        return "↩️";
    }

    /**
     * Hidden rather than greyed out. It only ever applies to a role that has a set of its own, and
     * a control that is present but refuses to work reads as broken, where an absent one reads as
     * nothing to do here.
     */
    protected async isAvailable(): Promise<boolean> {
        const args = this.uiArgs as {
            dynamicChannelButtonsRoleId?: string | null;
            dynamicChannelButtonsTemplateByRole?: Record<string, string[]>;
        } | undefined;

        const roleId = args?.dynamicChannelButtonsRoleId;

        return Boolean( roleId ) && Boolean( args?.dynamicChannelButtonsTemplateByRole?.[ roleId as string ]?.length );
    }
}

