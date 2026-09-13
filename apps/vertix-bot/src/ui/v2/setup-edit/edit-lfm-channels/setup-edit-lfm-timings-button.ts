import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Opens the four clocks this generator's lfm posts run on.
 *
 * A button rather than four more menus, because the screen already spends two of its five rows on
 * the destinations and the roles - and four numbers are better asked for together anyway, since
 * they only make sense against each other.
 */
export class SetupEditLfmTimingsButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V2/SetupEditLfmTimingsButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected getLabel(): Promise<string> {
        return Promise.resolve( "Edit Timings" );
    }

    protected getStyle(): Promise<UIButtonStyleTypes> {
        return Promise.resolve( "secondary" );
    }

    protected async getEmoji(): Promise<string> {
        return "⏱️";
    }
}
