import { UIElementRoleSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-role-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DYNAMIC_CHANNEL_LFM_LIMITS } from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

/**
 * The roles an lfm post may mention.
 *
 * Selecting nothing is the default and a valid answer - it means posts go up quietly - so the
 * minimum is zero.
 */
export class LfmPingRolesSelectMenu extends UIElementRoleSelectMenu {
    public static getName() {
        return "VertixBot/UI-V2/LfmPingRolesSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder() {
        return "🔔 ∙ Roles to ping";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return DYNAMIC_CHANNEL_LFM_LIMITS.MAX_PING_ROLES;
    }

    /**
     * What this generator already has saved, so the menu opens showing it rather than empty -
     * an empty menu beside an embed listing the current picks reads as though nothing is set.
     */
    protected async getDefaultValues() {
        const ids = this.uiArgs?.dynamicChannelLfmPingRoleIds;

        return Array.isArray( ids ) ? ids as string[] : [];
    }
}
