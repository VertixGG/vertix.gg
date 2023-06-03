import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { UI_IMAGE_EMPTY_LINE_URL, UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class DynamicChannelPermissionsAccessEmbed extends UIEmbedBase {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
        allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
        allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsAccessEmbed";
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
        const { allowedUsersDisplay } = DynamicChannelPermissionsAccessEmbed.vars;

        return "\n**_Allowed Users_**:\n" +
            allowedUsersDisplay + "\n" +
            "**You can use**:\n" +
            "⚬ **(`🤝 Grant Access`)** - Grant user access.\n" +
            "⚬ **(`🚫 Remove Access`)** - Remove user access.";
    }

    protected getArrayOptions() {
        const { separator, value } = DynamicChannelPermissionsAccessEmbed.vars;

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
        } = DynamicChannelPermissionsAccessEmbed.vars;

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
        } = DynamicChannelPermissionsAccessEmbed.vars;

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
            result.allowedUsersDisplay = allowedUsers;
        } else {
            result.allowedUsersDisplay = allowedUsersDefault;
        }

        return result;
    }
}
