import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";

import { UI_IMAGE_EMPTY_LINE_URL, UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class DynamicChannelPermissionsGrantedEmbed extends UIEmbedBase {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        userGrantedDisplayName: uiUtilsWrapAsTemplate( "userGrantedDisplayName" ),

        allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
        allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
        allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsGrantedEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return 0xF5CF4D; // As the emoji.
    }

    protected getImage(): string {
        return UI_IMAGE_EMPTY_LINE_URL;
    }

    protected getTitle() {
        return "🤝  Access granted";
    }

    protected getDescription(): string {
        return `**${ DynamicChannelPermissionsGrantedEmbed.vars.userGrantedDisplayName }** added successfully and now has access to this channel!\n\n` +
            "**_Allowed Users_**:\n" +
            DynamicChannelPermissionsGrantedEmbed.vars.allowedUsersDisplay + "\n" +
            "**You can use**:\n" +
            "⚬ **(`🚫 Remove Access`)** - Remove user access.\n" +
            "⚬ **(`👥 Access`)** - Manage channel permissions.";
    }

    protected getArrayOptions() {
        const { separator, value } = DynamicChannelPermissionsGrantedEmbed.vars;

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
        } = DynamicChannelPermissionsGrantedEmbed.vars;

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
        } = DynamicChannelPermissionsGrantedEmbed.vars;

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
            result.allowedUsersDisplay = allowedUsers;
        } else {
            result.allowedUsersDisplay = allowedUsersDefault;
        }

        result.userGrantedDisplayName = args.userGrantedDisplayName;

        return result;

    }
}
