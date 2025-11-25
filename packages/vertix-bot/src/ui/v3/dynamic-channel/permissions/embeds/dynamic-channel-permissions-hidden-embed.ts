import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    message: uiUtilsWrapAsTemplate( "message" ),
    messageDefault: uiUtilsWrapAsTemplate( "messageDefault" ),
    messageAccessNotAvailable: uiUtilsWrapAsTemplate( "messageAccessNotAvailable" ),
    allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
    allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
    allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" )
};

const DynamicChannelPermissionsHiddenEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS>(
    "VertixBot/UI-V3/DynamicChannelPermissionsHiddenEmbed",
    DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xc79d5f )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( "🙈  The channel is hidden now" )
    .setDescription( () => (
        "Please be aware that only granted users can see your channel.\n\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.allowedUsersDisplay +
        "\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.message
    ) )
    .setOptions( () => ( {
        message: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.messageDefault ]:
                "You can use **(`👥 Access`)** - _Button_ to manage the access of your channel.",
            [ DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.messageAccessNotAvailable ]:
                "There is no way to grant access to your channel for new members.\n\n" +
                "This is because the **(👥 Access)** Button has been disabled by the administrator"
        },
        allowedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.allowedUsersDefault ]: "Currently no other user has access except you.\n",
            [ DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.allowedUsers ]: `**_Allowed users_**: \n${ DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.allowedUsers }\n`
        }
    } ) )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.value }>${ DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const allowedUsers = Array.isArray( args.allowedUsers ) ? args.allowedUsers.map( ( user ) => user.id ) : undefined;

        return {
            allowedUsers,
            allowedUsersDisplay: allowedUsers?.length
                ? DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.allowedUsers
                : DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.allowedUsersDefault,
            message: args.dynamicChannelButtonsIsAccessButtonAvailable
                ? DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.messageDefault
                : DYNAMIC_CHANNEL_PERMISSIONS_HIDDEN_VARS.messageAccessNotAvailable
        };
    } )
    .build();

export { DynamicChannelPermissionsHiddenEmbed };
