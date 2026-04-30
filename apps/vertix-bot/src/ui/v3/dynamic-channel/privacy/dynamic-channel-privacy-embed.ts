import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const vars = {
    state: uiUtilsWrapAsTemplate( "state" ),
    stateMessage: uiUtilsWrapAsTemplate( "stateMessage" ),
    statePublic: uiUtilsWrapAsTemplate( "statePublic" ),
    statePrivate: uiUtilsWrapAsTemplate( "statePrivate" ),
    stateShown: uiUtilsWrapAsTemplate( "stateShown" ),
    stateHidden: uiUtilsWrapAsTemplate( "stateHidden" ),
    stateMessagePublic: uiUtilsWrapAsTemplate( "stateMessagePublic" ),
    stateMessagePrivate: uiUtilsWrapAsTemplate( "stateMessagePrivate" ),
    stateMessageShown: uiUtilsWrapAsTemplate( "stateMessageShown" ),
    stateMessageHidden: uiUtilsWrapAsTemplate( "stateMessageHidden" ),
    privacyEmoji: uiUtilsWrapAsTemplate( "privacyEmoji" ),

    allowedUsersDisplay: uiUtilsWrapAsTemplate( "allowedUsersDisplay" ),
    blockedUsersDisplay: uiUtilsWrapAsTemplate( "blockedUsersDisplay" ),
    allowedUsers: uiUtilsWrapAsTemplate( "allowedUsers" ),
    blockedUsers: uiUtilsWrapAsTemplate( "blockedUsers" ),
    allowedUsersDefault: uiUtilsWrapAsTemplate( "allowedUsersDefault" ),
    blockedUsersDefault: uiUtilsWrapAsTemplate( "blockedUsersDefault" ),
    value: uiUtilsWrapAsTemplate( "value" ),
    separator: uiUtilsWrapAsTemplate( "separator" )
};

const DynamicChannelPrivacyEmbed = new EmbedBuilder<UIArgs, typeof vars>(
    "VertixBot/UI-V3/DynamicChannelPrivacyEmbed",
    vars
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ vars.privacyEmoji }  Manage privacy of your channel` )
    .setDescription( () => (
        `**_State_**: \`${ vars.state }\`` +
        "\n**_Intends_**: \`" +
        vars.stateMessage +
        "\`\n" +
        "\n**_Trusted Users_**:\n" +
        vars.allowedUsersDisplay +
        "\n**_Blocked Users_**:\n" +
        vars.blockedUsersDisplay +
        "\n-# Blocked Users cannot join your channel in any state."
    ) )
    .setFooterText( "Use the menu below to manage privacy state of your channel." )
    .setOptions( () => ( {
        state: {
            [ vars.statePublic ]: "🌐 Public",
            [ vars.statePrivate ]: "🚫 Private",
            [ vars.stateShown ]: "🐵 Shown",
            [ vars.stateHidden ]: "🙈 Hidden"
        },
        stateMessage: {
            [ vars.stateMessagePublic ]: "Everyone can join your channel.",
            [ vars.stateMessagePrivate ]: "Only trusted users can join your channel.",
            [ vars.stateMessageShown ]: "Everyone can see and join your channel.",
            [ vars.stateMessageHidden ]: "Only trusted users can see and join your channel."
        },
        allowedUsersDisplay: {
            [ vars.allowedUsersDefault ]: "Currently there are no trusted users." + "\n",
            [ vars.allowedUsers ]: vars.allowedUsers + "\n"
        },
        blockedUsersDisplay: {
            [ vars.blockedUsersDefault ]: "Currently there are no blocked users." + "\n",
            [ vars.blockedUsers ]: vars.blockedUsers + "\n"
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
        const result: any = {};

        switch ( args.state ) {
            default:
            case "public":
                result.state = vars.statePublic;
                result.stateMessage = vars.stateMessagePublic;
                break;
            case "private":
                result.state = vars.statePrivate;
                result.stateMessage = vars.stateMessagePrivate;
                break;
            case "shown":
                result.state = vars.stateShown;
                result.stateMessage = vars.stateMessageShown;
                break;
            case "hidden":
                result.state = vars.stateHidden;
                result.stateMessage = vars.stateMessageHidden;
                break;
        }

        // TODO: Should work via default vars
        // result.privacyEmoji = DynamicChannelPrivacyButton.getEmoji();

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

        return result;
    } )
    .setDefaultVars( () => ( {
        privacyEmoji: DynamicChannelPrivacyButton.getEmoji(),
        statePublic: "public",
        statePrivate: "private",
        stateShown: "shown",
        stateHidden: "hidden",
        stateMessagePublic: "public",
        stateMessagePrivate: "private",
        stateMessageShown: "shown",
        stateMessageHidden: "hidden",
        allowedUsersDefault: "none",
        blockedUsersDefault: "none"
    } ) )
    .build();

export { DynamicChannelPrivacyEmbed, vars as DYNAMIC_CHANNEL_PRIVACY_VARS };
