import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Drops every claim timing this guild chose, putting all four back on what the bot is
 * configured with.
 */
export class SetupClaimResetButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/SetupClaimResetButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Reset to defaults" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "danger" );
    }

    protected async getEmoji(): Promise<string> {
        return "🧹";
    }
}
