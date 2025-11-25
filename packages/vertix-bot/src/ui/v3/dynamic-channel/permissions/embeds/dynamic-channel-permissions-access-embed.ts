import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import { DynamicChannelPermissionsAccessButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/elements";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VARS = new UIEmbedVars(
    "separator",
    "value",
    "allowedUsers",
    "allowedUsersDisplay",
    "allowedUsersDefault",
    "blockedUsers",
    "blockedUsersDisplay",
    "blockedUsersDefault",
    "permissionsEmoji"
);
const DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP = DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VARS.get();

const DynamicChannelPermissionsAccessEmbedBase = new EmbedBuilder<
    UIArgs,
    typeof DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP
>(
    "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbed",
    DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.permissionsEmoji }  Manage permissions of your channel` )
    .setDescription( () => (
        "\n**_Trusted Users_**:\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.allowedUsersDisplay +
        "\n**_Blocked Users_**:\n" +
        DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.blockedUsersDisplay
    ) )
    .setFooterText( () => "Use the menu below to manage permissions of your channel." )
    .setOptions( () => ( {
        allowedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.allowedUsersDefault ]: "Currently there are no trusted users.\n",
            [ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.allowedUsers ]: `${ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.allowedUsers }\n`
        },
        blockedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.blockedUsersDefault ]: "Currently there are no blocked users.\n",
            [ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.blockedUsers ]: `${ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.blockedUsers }\n`
        }
    } ) )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.value }>${ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.separator }`,
            separator: "\n"
        },
        blockedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.value }>${ DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, unknown> = {};

        if ( Array.isArray( args.allowedUsers ) && args.allowedUsers.length ) {
            result.allowedUsers = args.allowedUsers.map( ( user ) => user.id );
            result.allowedUsersDisplay = DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.allowedUsers;
        } else {
            result.allowedUsersDisplay = DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.allowedUsersDefault;
        }

        if ( Array.isArray( args.blockedUsers ) && args.blockedUsers.length ) {
            result.blockedUsers = args.blockedUsers.map( ( user ) => user.id );
            result.blockedUsersDisplay = DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.blockedUsers;
        } else {
            result.blockedUsersDisplay = DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VAR_MAP.blockedUsersDefault;
        }

        result.permissionsEmoji = DynamicChannelPermissionsAccessButton.getEmoji();

        return result;
    } )
    .build();

class DynamicChannelPermissionsAccessEmbed extends DynamicChannelPermissionsAccessEmbedBase {
    public getVars() {
        return DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VARS;
    }
}

const DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_METADATA = Reflect.get(
    DynamicChannelPermissionsAccessEmbedBase,
    BUILDER_METADATA_SYMBOL
);

if ( DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_METADATA ) {
    Reflect.defineProperty( DynamicChannelPermissionsAccessEmbed, BUILDER_METADATA_SYMBOL, {
        value: DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_METADATA,
        configurable: false,
        enumerable: false
    } );
}

export { DynamicChannelPermissionsAccessEmbed };
