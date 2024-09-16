import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { UIEmbedBase } from "@vertix.gg/gui/src/bases/ui-embed-base";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

export class DynamicChannelPermissionsPrivateEmbed extends UIEmbedBase {
    private static vars = {
        separator: uiUtilsWrapAsTemplate( "separator" ),
        value: uiUtilsWrapAsTemplate( "value" ),

        message: uiUtilsWrapAsTemplate( "message" ),
        messageDefault: uiUtilsWrapAsTemplate( "messageDefault" ),
        messageAccessNotAvailable: uiUtilsWrapAsTemplate( "messageAccessNotAvailable" ),

        allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
        allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
        allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),
    };

    public static getName() {
        return "Vertix/UI-V3/DynamicChannelPermissionsPrivateEmbed";
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
        return "Please be aware that only granted users can enter your channel.\n\n" +
            DynamicChannelPermissionsPrivateEmbed.vars.allowedUsersDisplay + "\n" +
            DynamicChannelPermissionsPrivateEmbed.vars.message;
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
            messageDefault,
            messageAccessNotAvailable,

            allowedUsers,
            allowedUsersDefault,
        } = DynamicChannelPermissionsPrivateEmbed.vars;

        return {
            "message": {
                [ messageDefault ]: "You can use **(`👥 Access`)** - _Button_ to manage the access of your channel.",
                [ messageAccessNotAvailable ]: "There is no way to grant access to your channel for new members.\n\n" +
                "This is because the **(👥 Access)** Button has been disabled by the administrator",
            },

            "allowedUsersDisplay": {
                [ allowedUsersDefault ]: "Currently no other user has access except you.\n",
                [ allowedUsers ]: "**_Allowed users_**: \n" + `${ allowedUsers }\n`,
            }
        };
    }

    protected getLogic( args: UIArgs ) {
        const result: any = {}, {
            messageDefault,
            messageAccessNotAvailable,

            allowedUsers,
            allowedUsersDefault,
        } = DynamicChannelPermissionsPrivateEmbed.vars;

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
            result.allowedUsersDisplay = allowedUsers;
        } else {
            result.allowedUsersDisplay = allowedUsersDefault;
        }

        if ( args.dynamicChannelButtonsIsAccessButtonAvailable ) {
            result.message = messageDefault;
        } else {
            result.message = messageAccessNotAvailable;
        }

        return result;
    }
}
