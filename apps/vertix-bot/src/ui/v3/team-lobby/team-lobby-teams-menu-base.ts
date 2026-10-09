import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { TEAM_LOBBY_LIMITS } from "@vertix.gg/bot/src/definitions/team-lobby";

import type { APISelectMenuOption } from "discord.js";

/**
 * How many teams to split a lobby into - each count an option whose value is the number itself, and
 * the one already picked on this screen shown as picked, since the screen is drawn again after it.
 */
export abstract class TeamLobbyTeamsMenuBase extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyTeamsMenuBase";
    }

    protected async getSelectOptions(): Promise<APISelectMenuOption[]> {
        const options: APISelectMenuOption[] = [];

        for ( let count = TEAM_LOBBY_LIMITS.TEAMS_MIN; count <= TEAM_LOBBY_LIMITS.TEAMS_MAX; count++ ) {
            options.push( {
                label: `${ count } teams`,
                value: String( count ),
                ... ( String( count ) === String( this.uiArgs?.count ) ? { default: true } : {} )
            } );
        }

        return options;
    }
}
