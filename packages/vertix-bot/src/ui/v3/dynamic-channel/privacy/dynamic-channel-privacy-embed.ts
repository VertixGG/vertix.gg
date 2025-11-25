import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelPrivacyButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/privacy/dynamic-channel-privacy-button";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_PRIVACY_VARS = {
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

const DynamicChannelPrivacyEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_PRIVACY_VARS>(
    "VertixBot/UI-V3/DynamicChannelPrivacyEmbed",
    DYNAMIC_CHANNEL_PRIVACY_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ DYNAMIC_CHANNEL_PRIVACY_VARS.privacyEmoji }  Manage privacy of your channel` )
    .setDescription( () => (
        `**_State_**: \`${ DYNAMIC_CHANNEL_PRIVACY_VARS.state }\`` +
        "\n**_Intends_**: \`" +
        DYNAMIC_CHANNEL_PRIVACY_VARS.stateMessage +
        "\`\n" +
        "\n**_Trusted Users_**:\n" +
        DYNAMIC_CHANNEL_PRIVACY_VARS.allowedUsersDisplay +
        "\n**_Blocked Users_**:\n" +
        DYNAMIC_CHANNEL_PRIVACY_VARS.blockedUsersDisplay +
        "\n-# Blocked Users cannot join your channel in any state."
    ) )
    .setFooterText( "Use the menu below to manage privacy state of your channel." )
    .setOptions( () => ( {
        state: {
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.statePublic ]: "🌐 Public",
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.statePrivate ]: "🚫 Private",
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.stateShown ]: "🐵 Shown",
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.stateHidden ]: "🙈 Hidden"
        },
        stateMessage: {
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.stateMessagePublic ]: "Everyone can join your channel.",
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.stateMessagePrivate ]: "Only trusted users can join your channel.",
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.stateMessageShown ]: "Everyone can see and join your channel.",
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.stateMessageHidden ]: "Only trusted users can see and join your channel."
        },
        allowedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.allowedUsersDefault ]: "Currently there are no trusted users." + "\n",
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.allowedUsers ]: DYNAMIC_CHANNEL_PRIVACY_VARS.allowedUsers + "\n"
        },
        blockedUsersDisplay: {
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.blockedUsersDefault ]: "Currently there are no blocked users." + "\n",
            [ DYNAMIC_CHANNEL_PRIVACY_VARS.blockedUsers ]: DYNAMIC_CHANNEL_PRIVACY_VARS.blockedUsers + "\n"
        }
    } ) )
    .setArrayOptions( () => ( {
        allowedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PRIVACY_VARS.value }>${ DYNAMIC_CHANNEL_PRIVACY_VARS.separator }`,
            separator: "\n"
        },
        blockedUsers: {
            format: `- <@${ DYNAMIC_CHANNEL_PRIVACY_VARS.value }>${ DYNAMIC_CHANNEL_PRIVACY_VARS.separator }`,
            separator: "\n"
        }
    } ) )
    .setLogic( ( args: UIArgs ) => {
        const result: any = {};

        switch ( args.state ) {
            default:
            case "public":
                result.state = DYNAMIC_CHANNEL_PRIVACY_VARS.statePublic;
                result.stateMessage = DYNAMIC_CHANNEL_PRIVACY_VARS.stateMessagePublic;
                break;
            case "private":
                result.state = DYNAMIC_CHANNEL_PRIVACY_VARS.statePrivate;
                result.stateMessage = DYNAMIC_CHANNEL_PRIVACY_VARS.stateMessagePrivate;
                break;
            case "shown":
                result.state = DYNAMIC_CHANNEL_PRIVACY_VARS.stateShown;
                result.stateMessage = DYNAMIC_CHANNEL_PRIVACY_VARS.stateMessageShown;
                break;
            case "hidden":
                result.state = DYNAMIC_CHANNEL_PRIVACY_VARS.stateHidden;
                result.stateMessage = DYNAMIC_CHANNEL_PRIVACY_VARS.stateMessageHidden;
                break;
        }

        result.privacyEmoji = DynamicChannelPrivacyButton.getEmoji();

        if ( args.allowedUsers?.length ) {
            result.allowedUsers = args.allowedUsers?.map( ( user: any ) => user.id );
            result.allowedUsersDisplay = DYNAMIC_CHANNEL_PRIVACY_VARS.allowedUsers;
        } else {
            result.allowedUsersDisplay = DYNAMIC_CHANNEL_PRIVACY_VARS.allowedUsersDefault;
        }

        if ( args.blockedUsers?.length ) {
            result.blockedUsers = args.blockedUsers?.map( ( user: any ) => user.id );
            result.blockedUsersDisplay = DYNAMIC_CHANNEL_PRIVACY_VARS.blockedUsers;
        } else {
            result.blockedUsersDisplay = DYNAMIC_CHANNEL_PRIVACY_VARS.blockedUsersDefault;
        }

        return result;
    } )
    .build();

export { DynamicChannelPrivacyEmbed, DYNAMIC_CHANNEL_PRIVACY_VARS };
