import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { TeamLobbyTeamsMenuBase } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-teams-menu-base";

export class TeamLobbyPickTeamsMenu extends TeamLobbyTeamsMenuBase {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyPickTeamsMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "🙋 ∙ How many teams?";
    }
}
