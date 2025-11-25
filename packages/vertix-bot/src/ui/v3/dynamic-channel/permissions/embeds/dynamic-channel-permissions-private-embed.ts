import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    message: uiUtilsWrapAsTemplate( "message" ),
    messageDefault: uiUtilsWrapAsTemplate( "messageDefault" ),
    messageAccessNotAvailable: uiUtilsWrapAsTemplate( "messageAccessNotAvailable" ),
    allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
    allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
    allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" )
};

const DynamicChannelPermissionsPrivateEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS>(
    "VertixBot/UI-V3/DynamicChannelPermissionsPrivateEmbed",
    DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xf18b75 )
    .setImage( "https://i.imgur.com/NthLO3W.png" )
    .setTitle( "🚫  The channel is private now" )
    .setDescription( () => (
        "Please be aware that only granted users can enter your channel.\n\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.allowedUsersDisplay +
        "\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.message
    ) )
    .setOptions( () => ( {
        message: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.messageDefault ]:
                "You can use **(`👥 Access`)** - _Button_ to manage the access of your channel.",
            [ DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.messageAccessNotAvailable ]:
                "There is no way to grant access to your channel for new members.\n\n" +
                "This is because the **(👥 Access)** Button has been disabled by the administrator"
        },
        allowedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.allowedUsersDefault ]: "Currently no other user has access except you.\n",
            [ DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.allowedUsers ]: `**_Allowed users_**: \n${ DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.allowedUsers }\n`
        }
    } ) )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.value }>${ DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const allowedUsers = Array.isArray( args.allowedUsers ) ? args.allowedUsers.map( ( user ) => user.id ) : undefined;

        return {
            allowedUsers,
            allowedUsersDisplay: allowedUsers?.length
                ? DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.allowedUsers
                : DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.allowedUsersDefault,
            message: args.dynamicChannelButtonsIsAccessButtonAvailable
                ? DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.messageDefault
                : DYNAMIC_CHANNEL_PERMISSIONS_PRIVATE_VARS.messageAccessNotAvailable
        };
    } )
    .build();

export { DynamicChannelPermissionsPrivateEmbed };
