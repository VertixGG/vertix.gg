import { UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { UIEmbedWithVarsExtend } from "@vertix.gg/gui/src/ui-embed/ui-embed-with-vars";

import { DynamicChannelEmbedBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-embed-base";

import { DynamicChannelPermissionsAccessButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/elements";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DynamicChannelEmbedBaseWithVars = UIEmbedWithVarsExtend(
    DynamicChannelEmbedBase,
    new UIEmbedVars(
        "separator",
        "value",
        "allowedUsers",
        "allowedUsersDisplay",
        "allowedUsersDefault",
        "blockedUsers",
        "blockedUsersDisplay",
        "blockedUsersDefault",
        "permissionsEmoji"
    )
);

export class DynamicChannelPermissionsAccessEmbed extends DynamicChannelEmbedBaseWithVars {
    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsAccessEmbed";
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getOptions() {
        const vars = this.vars.get();

        return {
            allowedUsersDisplay: {
                [vars.allowedUsersDefault]: "Currently there are no trusted users." + "\n",
                [vars.allowedUsers]: vars.allowedUsers + "\n"
            },
            blockedUsersDisplay: {
                [vars.blockedUsersDefault]: "Currently there are no blocked users." + "\n",
                [vars.blockedUsers]: vars.blockedUsers + "\n"
            }
        };
    }

    protected getArrayOptions() {
        const { separator, value } = this.vars.get();

        return {
            allowedUsers: {
                format: `- <@${value}>${separator}`,
                separator: "\n"
            },
            blockedUsers: {
                format: `- <@${value}>${separator}`,
                separator: "\n"
            }
        };
    }

    protected getTitle() {
        return `${this.vars.get("permissionsEmoji")}  Manage permissions of your channel`;
    }

    protected getDescription() {
        const { allowedUsersDisplay, blockedUsersDisplay } = this.vars.get();

        return "\n**_Trusted Users_**:\n" + allowedUsersDisplay + "\n**_Blocked Users_**:\n" + blockedUsersDisplay;
    }

    protected getFooter(): string {
        return "Use the menu below to manage permissions of your channel.";
    }

    protected getLogic(args: UIArgs) {
        const result = super.getLogic(args),
            vars = this.vars.get();

        if (args?.allowedUsers?.length) {
            result.allowedUsers = args.allowedUsers?.map((user: any) => user.id);
            result.allowedUsersDisplay = vars.allowedUsers;
        } else {
            result.allowedUsersDisplay = vars.allowedUsersDefault;
        }

        if (args?.blockedUsers?.length) {
            result.blockedUsers = args.blockedUsers?.map((user: any) => user.id);
            result.blockedUsersDisplay = vars.blockedUsers;
        } else {
            result.blockedUsersDisplay = vars.blockedUsersDefault;
        }

        result.permissionsEmoji = DynamicChannelPermissionsAccessButton.getEmoji();

        return result;
    }
}
