import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
    allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
    allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),

    blockedUsers: uiUtilsWrapAsTemplate( "blockedUsers" ),
    blockedUsersDisplay: uiUtilsWrapAsTemplate( "blockedUsersDisplay" ),
    blockedUsersDefault: uiUtilsWrapAsTemplate( "blockedUsersDefault" )
};

const DynamicChannelPermissionsAccessEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelPermissionsAccessEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "👥  Manage permissions of your channel" )
    .setDescription( () => "\n**_Allowed Users_**:\n" + vars.allowedUsersDisplay + "\n**_Blocked Users_**:\n" + vars.blockedUsersDisplay )
    .setFooterText( () => "Use the menu below to manage permissions of your channel." )
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
    .setOptions( () => ( {
        allowedUsersDisplay: {
            [ vars.allowedUsersDefault ]: "Currently there are no granted users." + "\n",
            [ vars.allowedUsers ]: vars.allowedUsers + "\n"
        },
        blockedUsersDisplay: {
            [ vars.blockedUsersDefault ]: "Currently there are no blocked users." + "\n",
            [ vars.blockedUsers ]: vars.blockedUsers + "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, string | string[]> = {};

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: { id: string } ) => user.id );
            result.allowedUsersDisplay = vars.allowedUsers;
        } else {
            result.allowedUsersDisplay = vars.allowedUsersDefault;
        }

        if ( args.blockedUsers?.length ) {
            result.blockedUsers = args.blockedUsers?.map( ( user: { id: string } ) => user.id );
            result.blockedUsersDisplay = vars.blockedUsers;
        } else {
            result.blockedUsersDisplay = vars.blockedUsersDefault;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        allowedUsersDisplay: "Currently there are no granted users.\n",
        blockedUsersDisplay: "Currently there are no blocked users.\n"
    } ) )
    .build();

export { DynamicChannelPermissionsAccessEmbed };
