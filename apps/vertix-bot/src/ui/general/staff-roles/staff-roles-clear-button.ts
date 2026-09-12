import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Empties the staff list, leaving every channel to its own owner.
 */
export class StaffRolesClearButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/StaffRolesClearButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Clear" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "danger" );
    }

    protected async getEmoji(): Promise<string> {
        return "🧹";
    }
}
