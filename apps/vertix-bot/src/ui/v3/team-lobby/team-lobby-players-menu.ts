import { UIElementUserSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-user-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * Who a split is for, when it is not everybody in the lobby - picked before the number, on the
 * screen that asks for it.
 *
 * Optional: picking nobody splits the whole lobby, hence the minimum of zero. It opens holding
 * whoever was already picked on this screen, since the screen is drawn again after each pick.
 *
 * One menu per mode, as each mode has its own number to pick: a menu answers one screen.
 */
export abstract class TeamLobbyPlayersMenuBase extends UIElementUserSelectMenu {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyPlayersMenuBase";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "👥 ∙ Only these members (optional)";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 25;
    }

    protected async getDefaultValues() {
        return ( this.uiArgs?.playerIds ?? [] ) as string[];
    }
}

export class TeamLobbyRandomTeamsPlayersMenu extends TeamLobbyPlayersMenuBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyRandomTeamsPlayersMenu";
    }
}

export class TeamLobbyPickTeamsPlayersMenu extends TeamLobbyPlayersMenuBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyPickTeamsPlayersMenu";
    }
}

export class TeamLobbyGroupsPlayersMenu extends TeamLobbyPlayersMenuBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyGroupsPlayersMenu";
    }
}
