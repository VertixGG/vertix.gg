import { UIElementStringSelectMenu } from "@vertix.gg/gui/src/bases/element-types/ui-element-string-select-menu";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

export const EDIT_VOICE_ROLE = "editVoiceRole" as const;
export const EDIT_VERIFIED_ROLES = "editVerifiedRoles" as const;
export const EDIT_STAFF_ROLES = "editStaffRoles" as const;
export const EDIT_BADWORDS = "editBadwords" as const;
export const EDIT_CLAIM = "editClaim" as const;

/**
 * The way into each of the server's settings.
 *
 * One setting at a time, each on a screen of its own, because a picker shown beside four others has
 * nowhere to put what belongs to it alone - the sentence saying what it does, and the button that
 * empties it. Discord's own pickers carry no options, so emptying could not live in them.
 */
export class ServerOptionsEditSelectMenu extends UIElementStringSelectMenu {
    public static getName() {
        return "VertixBot/UI-General/ServerOptionsEditSelectMenu";
    }

    public static getInstanceType() {
        return UIInstancesTypes.Dynamic;
    }

    protected async getPlaceholder(): Promise<string> {
        return "⚙️ ∙ Select Edit Options";
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
                label: "Voice Role",
                description: "The role given to members while they are in a voice channel",
                value: EDIT_VOICE_ROLE,
                emoji: { name: "🎙️" }
            },
            {
                label: "Verified Roles",
                description: "Who the dynamic channels are for",
                value: EDIT_VERIFIED_ROLES,
                emoji: { name: "🛡️" }
            },
            {
                label: "Staff Roles",
                description: "Who may act on a channel they do not own",
                value: EDIT_STAFF_ROLES,
                emoji: { name: "🔑" }
            },
            {
                label: "Bad Words",
                description: "Words a member cannot put in a channel name",
                value: EDIT_BADWORDS,
                emoji: { name: "🙊" }
            },
            {
                label: "Claim",
                description: "How long an abandoned channel waits, and how long the vote runs",
                value: EDIT_CLAIM,
                emoji: { name: "😈" }
            }
        ];
    }
}
