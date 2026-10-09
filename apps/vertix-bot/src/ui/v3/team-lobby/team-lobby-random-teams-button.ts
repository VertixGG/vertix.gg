import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Deal everyone in the lobby into team rooms.
 */
export class TeamLobbyRandomTeamsButton extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyRandomTeamsButton";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Random teams";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "primary";
    }

    protected async getEmoji() {
        return "🎲";
    }
}
