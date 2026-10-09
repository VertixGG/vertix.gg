import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Bring everyone back to the lobby, and close its rooms.
 */
export class TeamLobbyRecallButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyRecallButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Recall";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "success";
    }

    protected async getEmoji() {
        return "↩️";
    }
}
