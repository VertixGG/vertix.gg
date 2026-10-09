import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { TEAM_LOBBY_LIMITS } from "@vertix.gg/bot/src/definitions/team-lobby";

import type { APISelectMenuOption } from "discord.js";

/**
 * How many to a group - each size an option whose value is the number itself, and the one already
 * picked on this screen shown as picked.
 */
export class TeamLobbyGroupSizeMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyGroupSizeMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "👥 ∙ How many to a group?";
    }

    protected async getSelectOptions(): Promise<APISelectMenuOption[]> {
        const options: APISelectMenuOption[] = [];

        for ( let size = TEAM_LOBBY_LIMITS.GROUP_SIZE_MIN; size <= TEAM_LOBBY_LIMITS.GROUP_SIZE_MAX; size++ ) {
            options.push( {
                label: `Groups of ${ size }`,
                value: String( size ),
                ... ( String( size ) === String( this.uiArgs?.count ) ? { default: true } : {} )
            } );
        }

        return options;
    }
}
