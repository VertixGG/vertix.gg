import { Colors } from "discord.js";
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
    blockedUsersDefault: uiUtilsWrapAsTemplate( "blockedUsersDefault" ),

    userKickedDisplayName: uiUtilsWrapAsTemplate( "userKickedDisplayName" )
};

const DynamicChannelPermissionsKickEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelPermissionsKickEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( Colors.Yellow )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "👢  User kicked" )
    .setDescription( () => (
        `**${ vars.userKickedDisplayName }** successfully kicked!\n\n` +
        `**Allowed Users**: ${ vars.allowedUsersDisplay }\n**Blocked Users**: ${ vars.blockedUsersDisplay }`
    ) )
    .setFooterText( () => "Use the menu below to manage permissions of your channel." )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `• <@${ vars.value }>${ vars.separator }`,
            separator: " "
        },
        blockedUsers: {
            format: `• <@${ vars.value }>${ vars.separator }`,
            separator: " "
        }
    } ) )
    .setOptions( () => ( {
        allowedUsersDisplay: {
            [ vars.allowedUsersDefault ]: "Currently there are no granted users.",
            [ vars.allowedUsers ]: vars.allowedUsers
        },
        blockedUsersDisplay: {
            [ vars.blockedUsersDefault ]: "Currently there are no blocked users.",
            [ vars.blockedUsers ]: vars.blockedUsers
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: Record<string, any> = {};

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
            result.allowedUsersDisplay = vars.allowedUsers;
        } else {
            result.allowedUsersDisplay = vars.allowedUsersDefault;
        }

        if ( args.blockedUsers?.length ) {
            result.blockedUsers = args.blockedUsers?.map( ( user: any ) => user.id );
            result.blockedUsersDisplay = vars.blockedUsers;
        } else {
            result.blockedUsersDisplay = vars.blockedUsersDefault;
        }

        result.userKickedDisplayName = args.userKickedDisplayName;

        return result;
    } )
    .setDefaultVars( () => ( {
        userKickedDisplayName: "User",
        allowedUsersDisplay: "Currently there are no granted users.",
        blockedUsersDisplay: "Currently there are no blocked users."
    } ) )
    .build();

export { DynamicChannelPermissionsKickEmbed };
