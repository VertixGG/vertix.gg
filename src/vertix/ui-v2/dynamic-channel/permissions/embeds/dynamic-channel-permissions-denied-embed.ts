import { Colors } from "discord.js";

import { UI_IMAGE_EMPTY_LINE_URL, UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class DynamicChannelPermissionsDeniedEmbed extends UIEmbedBase {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
        allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
        allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),

        userDeniedDisplayName: uiUtilsWrapAsTemplate( "userDeniedDisplayName" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsDeniedEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return Colors.Red;
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return "🚫  Access canceled";
    }

    protected getDescription(): string {
        return `**${ DynamicChannelPermissionsDeniedEmbed.vars.userDeniedDisplayName }** successfully revoked and no longer has access to this channel!\n\n` +
            "**_Allowed Users_**:\n" +
            DynamicChannelPermissionsDeniedEmbed.vars.allowedUsersDisplay + "\n" +
            "**You can use**:\n" +
            "⚬ **(`🤝 Grant Access`)** - Grant user access.\n" +
            "⚬ **(`👥 Access`)** - Manage channel permissions.";
    }

    protected getArrayOptions() {
        const { separator, value } = DynamicChannelPermissionsDeniedEmbed.vars;

        return {
            allowedUsers: {
                format: `- <@${ value }>${ separator }`,
                separator: "\n",
            },
        };
    }

    protected getOptions() {
        const {
            allowedUsers,
            allowedUsersDefault,
        } = DynamicChannelPermissionsDeniedEmbed.vars;

        return {
            allowedUsersDisplay: {
                [ allowedUsersDefault ]: "Currently there are no granted users." + "\n",
                [ allowedUsers ]: allowedUsers + "\n"
            },
        };
    }

    protected getLogic( args: UIArgs ) {
        const result: any = {}, {
            allowedUsers,
            allowedUsersDefault,
        } = DynamicChannelPermissionsDeniedEmbed.vars;

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
            result.allowedUsersDisplay = allowedUsers;
        } else {
            result.allowedUsersDisplay = allowedUsersDefault;
        }

        result.userDeniedDisplayName = args.userDeniedDisplayName;

        return result;
    }
}
