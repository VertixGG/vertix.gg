import { UIElementButtonBase } from "@vertix.gg/gui/src/bases/element-types/ui-element-button-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIButtonStyleTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * What splits the lobby, once the screen asking how is filled in - the number picked, and everybody
 * picked to play standing in the lobby. Until then it cannot be pressed, and the screen says why.
 *
 * One per mode, as each mode's screen has its own number to apply: a button answers one screen.
 */
export abstract class TeamLobbyApplyButtonBase extends UIElementButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyApplyButtonBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getLabel() {
        return "Apply";
    }

    protected async getStyle(): Promise<UIButtonStyleTypes> {
        return "success";
    }

    protected async getEmoji() {
        return "✅";
    }

    protected async isDisabled() {
        return ! this.uiArgs?.isApplyEnabled;
    }
}

export class TeamLobbyRandomTeamsApplyButton extends TeamLobbyApplyButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyRandomTeamsApplyButton";
    }
}

export class TeamLobbyPickTeamsApplyButton extends TeamLobbyApplyButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyPickTeamsApplyButton";
    }
}

export class TeamLobbyGroupsApplyButton extends TeamLobbyApplyButtonBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyGroupsApplyButton";
    }
}
