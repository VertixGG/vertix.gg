import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";
import { UIEmbedVars } from "@vertix.gg/gui/src/ui-embed/ui-embed-vars";
import { BUILDER_METADATA_SYMBOL } from "@vertix.gg/gui/src/runtime/ui-builder-metadata";

import { DynamicChannelPermissionsAccessButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/elements";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { JsonValue } from "@vertix.gg/gui/src/runtime/ui-definition-types";

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

const vars = DYNAMIC_CHANNEL_PERMISSIONS_ACCESS_VARS.get();

const DynamicChannelPermissionsAccessEmbedBase = new EmbedBuilder<
    UIArgs,
    typeof vars
>(
    "VertixBot/UI-V3/DynamicChannelPermissionsAccessEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ vars.permissionsEmoji }  Manage permissions of your channel` )
    .setDescription( () => (
        "\n**_Trusted Users_**:\n" +
        vars.allowedUsersDisplay +
        "\n**_Blocked Users_**:\n" +
        vars.blockedUsersDisplay
    ) )
    .setFooterText( () => "Use the menu below to manage permissions of your channel." )
    .setOptions( () => ( {
        allowedUsersDisplay: {
            [ vars.allowedUsersDefault ]: "Currently there are no trusted users.\n",
            [ vars.allowedUsers ]: `${ vars.allowedUsers }\n`
        },
        blockedUsersDisplay: {
            [ vars.blockedUsersDefault ]: "Currently there are no blocked users.\n",
            [ vars.blockedUsers ]: `${ vars.blockedUsers }\n`
        }
    } ) )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `- <@${ vars.value }>${ vars.separator }`,
            separator: "\n"
        },
        blockedUsers: {
            format: `- <@${ vars.value }>${ vars.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, JsonValue> = {};

        if ( Array.isArray( args.allowedUsers ) && args.allowedUsers.length ) {
            result.allowedUsers = args.allowedUsers.map( ( user ) => user.id );
            result.allowedUsersDisplay = vars.allowedUsers;
        } else {
            result.allowedUsersDisplay = vars.allowedUsersDefault;
        }

        if ( Array.isArray( args.blockedUsers ) && args.blockedUsers.length ) {
            result.blockedUsers = args.blockedUsers.map( ( user ) => user.id );
            result.blockedUsersDisplay = vars.blockedUsers;
        } else {
            result.blockedUsersDisplay = vars.blockedUsersDefault;
        }

        result.permissionsEmoji = DynamicChannelPermissionsAccessButton.getEmoji();

        return result;
    } )
    .setDefaultVars( () => ( {
        permissionsEmoji: DynamicChannelPermissionsAccessButton.getEmoji()
    } ) )
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
