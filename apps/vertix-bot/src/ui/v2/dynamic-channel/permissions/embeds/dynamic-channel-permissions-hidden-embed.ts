import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UI_IMAGE_EMPTY_LINE_URL, UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    separator: uiUtilsWrapAsTemplate( "separator" ),
    value: uiUtilsWrapAsTemplate( "value" ),

    message: uiUtilsWrapAsTemplate( "message" ),
    messageDefault: uiUtilsWrapAsTemplate( "messageDefault" ),
    messageAccessNotAvailable: uiUtilsWrapAsTemplate( "messageAccessNotAvailable" ),

    allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
    allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
    allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" )
};

const DynamicChannelPermissionsHiddenEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelPermissionsHiddenEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xc79d5f )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => "🙈  The channel is hidden now" )
    .setDescription( () => (
        "Please be aware that only granted users can see your channel.\n\n" +
        vars.allowedUsersDisplay +
        "\n" +
        vars.message
    ) )
    .setOptions( () => ( {
        message: {
            [ vars.messageDefault ]: "You can use **(`👥 Access`)** - _Button_ to manage the access of your channel.",
            [ vars.messageAccessNotAvailable ]:
                "There is no way to grant access to your channel for new members.\n\n" +
                "This is because the **(👥 Access)** Button has been disabled by the administrator"
        },
        allowedUsersDisplay: {
            [ vars.allowedUsersDefault ]: "Currently no other user has access except you.\n",
            [ vars.allowedUsers ]: "**_Allowed users_**: \n" + `${ vars.allowedUsers }\n`
        }
    } ) )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `- <@${ vars.value }>${ vars.separator }`,
            separator: "\n"
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

        if ( args.dynamicChannelButtonsIsAccessButtonAvailable ) {
            result.message = vars.messageDefault;
        } else {
            result.message = vars.messageAccessNotAvailable;
        }

        return result;
    } )
    .setDefaultVars( () => ( {
        message: "You can use **(`👥 Access`)** - _Button_ to manage the access of your channel.",
        allowedUsersDisplay: "Currently no other user has access except you.\n"
    } ) )
    .build();

export { DynamicChannelPermissionsHiddenEmbed };
