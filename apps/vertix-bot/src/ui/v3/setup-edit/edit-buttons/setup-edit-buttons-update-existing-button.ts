import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Class SetupEditButtonsUpdateExistingButton :: Pushes the saved sets to channels already open.
 *
 * Saving happens the moment a button is picked, so this answers the only question left over: the
 * channels that were open before the change still carry the old row until someone asks for them
 * to be refreshed.
 */
export class SetupEditButtonsUpdateExistingButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/SetupEditButtonsUpdateExistingButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Update Existing Channels";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected async getEmoji(): Promise<string> {
        return "🔄";
    }
}
