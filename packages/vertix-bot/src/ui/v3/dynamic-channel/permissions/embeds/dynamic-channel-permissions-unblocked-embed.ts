import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
    allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
    allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),
    blockedUsers: uiUtilsWrapAsTemplate( "blockedUsers" ),
    blockedUsersDisplay: uiUtilsWrapAsTemplate( "blockedUsersDisplay" ),
    blockedUsersDefault: uiUtilsWrapAsTemplate( "blockedUsersDefault" ),
    userUnBlockedDisplayName: uiUtilsWrapAsTemplate( "userUnBlockedDisplayName" )
};

const DynamicChannelPermissionsUnblockedEmbed = new EmbedBuilder<
    UIArgs,
    typeof DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS
>(
    "VertixBot/UI-V3/DynamicChannelPermissionsUnblockedEmbed",
    DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setTitle( "🤙  User unblocked" )
    .setDescription( () => (
        `**${ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.userUnBlockedDisplayName }** successfully un-blocked!\n` +
        "\n**_Trusted Users_**:\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.allowedUsersDisplay +
        "\n**_Blocked Users_**:\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.blockedUsersDisplay
    ) )
    .setFooterText( () => "Use the menu below to manage permissions of your channel." )
    .setOptions( () => ( {
        allowedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.allowedUsersDefault ]: "Currently there are no trusted users.\n",
            [ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.allowedUsers ]: `${ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.allowedUsers }\n`
        },
        blockedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.blockedUsersDefault ]: "Currently there are no blocked users.\n",
            [ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.blockedUsers ]: `${ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.blockedUsers }\n`
        }
    } ) )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.value }>${ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.separator }`,
            separator: "\n"
        },
        blockedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.value }>${ DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const allowedUsers = Array.isArray( args.allowedUsers ) ? args.allowedUsers.map( ( user ) => user.id ) : [];
        const blockedUsers = Array.isArray( args.blockedUsers ) ? args.blockedUsers.map( ( user ) => user.id ) : [];

        return {
            allowedUsers,
            blockedUsers,
            allowedUsersDisplay: allowedUsers.length
                ? DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.allowedUsers
                : DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.allowedUsersDefault,
            blockedUsersDisplay: blockedUsers.length
                ? DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.blockedUsers
                : DYNAMIC_CHANNEL_PERMISSIONS_UNBLOCKED_VARS.blockedUsersDefault,
            userUnBlockedDisplayName: args.userUnBlockedDisplayName ?? "Unknown"
        };
    } )
    .setDefaultVars( () => ( {
        userUnBlockedDisplayName: "Example User"
    } ) )
    .build();

export { DynamicChannelPermissionsUnblockedEmbed };
