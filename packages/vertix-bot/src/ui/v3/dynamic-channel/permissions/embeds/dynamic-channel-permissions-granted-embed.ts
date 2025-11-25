
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VARS = new UIEmbedVars(
    "separator",
    "value",
    "allowedUsers",
    "allowedUsersDisplay",
    "allowedUsersDefault",
    "blockedUsers",
    "blockedUsersDisplay",
    "blockedUsersDefault",
    "userGrantedDisplayName"
);
const DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP = DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VARS.get();

const DynamicChannelPermissionsGrantedEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VARS>(
    "VertixBot/UI-V3/DynamicChannelPermissionsGrantedEmbed",
    DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setTitle( "👍  Access granted" )
    .setDescription( () => (
        `**${ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.userGrantedDisplayName }** added successfully and now has access to this channel!\n` +
        "\n**_Trusted Users_**:\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.allowedUsersDisplay +
        "\n**_Blocked Users_**:\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.blockedUsersDisplay
    ) )
    .setFooterText( () => "Use the menu below to manage permissions of your channel." )
    .setOptions( () => ( {
        allowedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.allowedUsersDefault ]: "Currently there are no trusted users.\n",
            [ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.allowedUsers ]: `${ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.allowedUsers }\n`
        },
        blockedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.blockedUsersDefault ]: "Currently there are no blocked users.\n",
            [ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.blockedUsers ]: `${ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.blockedUsers }\n`
        }
    } ) )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.value }>${ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.separator }`,
            separator: "\n"
        },
        blockedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.value }>${ DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const allowedUsers = Array.isArray( args.allowedUsers ) ? args.allowedUsers.map( ( user ) => user.id ) : undefined;
        const blockedUsers = Array.isArray( args.blockedUsers ) ? args.blockedUsers.map( ( user ) => user.id ) : undefined;

        return {
            allowedUsers,
            blockedUsers,
            allowedUsersDisplay: allowedUsers?.length
                ? DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.allowedUsers
                : DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.allowedUsersDefault,
            blockedUsersDisplay: blockedUsers?.length
                ? DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.blockedUsers
                : DYNAMIC_CHANNEL_PERMISSIONS_GRANTED_VAR_MAP.blockedUsersDefault,
            userGrantedDisplayName: args.userGrantedDisplayName ?? "Unknown"
        };
    } )
    .build();

export { DynamicChannelPermissionsGrantedEmbed };
