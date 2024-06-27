import { uiUtilsWrapAsTemplate } from "@vertix.gg/bot/src/ui-v2/ui-utils";

import { UIEmbedBase } from "@vertix.gg/bot/src/ui-v2/_base/ui-embed-base";

import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

import type { UIArgs } from "@vertix.gg/bot/src/ui-v2/_base/ui-definitions";

export class DynamicChannelPermissionsAccessEmbed extends UIEmbedBase {
    private static _vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
        allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
        allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),

        blockedUsers: uiUtilsWrapAsTemplate( "blockedUsers" ),
        blockedUsersDisplay: uiUtilsWrapAsTemplate( "blockedUsersDisplay" ),
        blockedUsersDefault: uiUtilsWrapAsTemplate( "blockedUsersDefault" ),
    };

    public static getName() {
        return "VertixBot/UI-V2/DynamicChannelPermissionsAccessEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return 0x4B6F91; // Same as the "members" emoji.
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return "👥  Manage permissions of your channel";
    }

    protected getDescription() {
        const { allowedUsersDisplay, blockedUsersDisplay } = DynamicChannelPermissionsAccessEmbed._vars;

        return "\n**_Allowed Users_**:\n" +
            allowedUsersDisplay +
            "\n**_Blocked Users_**:\n" +
            blockedUsersDisplay;
    }

    protected getFooter(): string {
        return "Use the menu below to manage permissions of your channel.";
    }

    protected getArrayOptions() {
        const { separator, value } = DynamicChannelPermissionsAccessEmbed._vars;

        return {
            allowedUsers: {
                format: `- <@${ value }>${ separator }`,
                separator: "\n",
            },
            blockedUsers: {
                format: `- <@${ value }>${ separator }`,
                separator: "\n",
            }
        };
    }

    protected getOptions() {
        const {
            allowedUsers,
            allowedUsersDefault,

            blockedUsers,
            blockedUsersDefault,
        } = DynamicChannelPermissionsAccessEmbed._vars;

        return {
            allowedUsersDisplay: {
                [ allowedUsersDefault ]: "Currently there are no granted users." + "\n",
                [ allowedUsers ]: allowedUsers + "\n"
            },
            blockedUsersDisplay: {
                [ blockedUsersDefault ]: "Currently there are no blocked users." + "\n",
                [ blockedUsers ]: blockedUsers + "\n"
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const result: any = {}, {
            allowedUsers,
            allowedUsersDefault,

            blockedUsers,
            blockedUsersDefault,
        } = DynamicChannelPermissionsAccessEmbed._vars;

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
            result.allowedUsersDisplay = allowedUsers;
        } else {
            result.allowedUsersDisplay = allowedUsersDefault;
        }

        if ( args.blockedUsers?.length ) {
            result.blockedUsers = args.blockedUsers?.map( ( user: any ) => user.id );
            result.blockedUsersDisplay = blockedUsers;
        } else {
            result.blockedUsersDisplay = blockedUsersDefault;
        }

        return result;
    }
}
