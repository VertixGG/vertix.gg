import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Empties the verified list, which hands the channels back to `@everyone` - the default
 * audience rather than no audience at all.
 */
export class VerifiedRolesClearButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-General/VerifiedRolesClearButton";
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
