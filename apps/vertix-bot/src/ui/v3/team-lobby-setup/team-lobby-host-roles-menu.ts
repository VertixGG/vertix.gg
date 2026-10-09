import { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

/**
 * The roles that run a team lobby - whoever holds one may split it and call it back.
 *
 * Selecting nothing is a valid answer and hands the lobby to whoever is in it, hence the minimum of
 * zero. It opens on the roles the lobby already names, so changing one does not mean picking the
 * rest again.
 */
export class TeamLobbyHostRolesMenu extends UIElementRoleSelectMenu {
    public static getName() {
        return "VertixBot/UI-V3/TeamLobbyHostRolesMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "🎮 ∙ Select Host Roles";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 10;
    }

    protected async getDefaultValues() {
        return ( this.uiArgs?.lobbyHostRoleIds ?? [] ) as string[];
    }
}
