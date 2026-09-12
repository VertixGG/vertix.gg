import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export const CLEAR_VOICE_ROLE = "clearVoiceRole" as const;
export const CLEAR_VERIFIED_ROLES = "clearVerifiedRoles" as const;
export const CLEAR_STAFF_ROLES = "clearStaffRoles" as const;

/**
 * The way each of the three role settings is emptied.
 *
 * Discord's role picker carries no options of its own, so there is nowhere in those menus to say
 * "none" - and a picker that opens without showing what is already chosen gives nothing to
 * unselect either. Emptying is asked for here instead, by name, one setting at a time.
 */
export class ClearRolesSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/ClearRolesSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "🧹 ∙ Clear a role setting";
    }

    protected async getMinValues() {
        return 0;
    }

    protected async getMaxValues() {
        return 1;
    }

    protected async getSelectOptions() {
        return [
            {
                label: "Clear Voice Role",
                value: CLEAR_VOICE_ROLE,
                emoji: { name: "🎙️" }
            },
            {
                label: "Clear Verified Roles",
                value: CLEAR_VERIFIED_ROLES,
                emoji: { name: "🛡️" }
            },
            {
                label: "Clear Staff Roles",
                value: CLEAR_STAFF_ROLES,
                emoji: { name: "🔑" }
            }
        ];
    }
}
