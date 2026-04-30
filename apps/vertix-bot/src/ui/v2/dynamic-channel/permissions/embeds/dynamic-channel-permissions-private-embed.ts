import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

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

const DynamicChannelPermissionsPrivateEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V2/DynamicChannelPermissionsPrivateEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0xf18b75 )
    .setImage( "https://i.imgur.com/NthLO3W.png" )
    .setTitle( () => "🚫  The channel is private now" )
    .setDescription( () => (
        "Please be aware that only granted users can enter your channel.\n\n" +
        vars.allowedUsersDisplay +
        "\n" +
        vars.message
    ) )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `- <@${ vars.value }>${ vars.separator }`,
            separator: "\n"
        }
    } ) )
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

export { DynamicChannelPermissionsPrivateEmbed };
