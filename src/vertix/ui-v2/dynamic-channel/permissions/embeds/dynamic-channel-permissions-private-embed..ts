import { UIEmbedBase } from "@vertix/ui-v2/_base/ui-embed-base";
import { UIArgs, UIInstancesTypes } from "@vertix/ui-v2/_base/ui-definitions";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";

export class DynamicChannelPermissionsPrivateEmbed extends UIEmbedBase {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
        allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
        allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),
    };

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelPermissionsPrivateEmbed";
    }

    public static getInstanceType(): UIInstancesTypes {
        return UIInstancesTypes.Dynamic;
    }

    protected getColor() {
        return 0xF18B75; // Same as the "danger" color in Discord.
    }

    protected getImage(): string {
        return "https://i.imgur.com/NthLO3W.png";
    }

    protected getTitle() {
        return "🚫  The channel is private now";
    }

    protected getDescription() {
        const { allowedUsersDisplay } = DynamicChannelPermissionsPrivateEmbed.vars;

        return allowedUsersDisplay +
            "\n" +
            "Who should have the privilege to access your channel?";
    }

    protected getArrayOptions() {
        const { separator, value } = DynamicChannelPermissionsPrivateEmbed.vars;

        return {
            allowedUsers: {
                format: `- <@${ value }>${ separator }`,
                separator: "\n",
            }
        };
    }

    protected getOptions() {
        const {
            allowedUsers,
            allowedUsersDefault,
        } = DynamicChannelPermissionsPrivateEmbed.vars;

        return {
            allowedUsersDisplay: {
                [ allowedUsersDefault ]: "Only granted users can enter your channel, currently no other user has access except you.\n",
                [ allowedUsers ]: "\n**_Allowed users_**: \n" + `${ allowedUsers }\n`,
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const result: any = {}, {
            allowedUsers,
            allowedUsersDefault,
        } = DynamicChannelPermissionsPrivateEmbed.vars;

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
            result.allowedUsersDisplay = allowedUsers;
        } else {
            result.allowedUsersDisplay = allowedUsersDefault;
        }

        return result;
    }
}
