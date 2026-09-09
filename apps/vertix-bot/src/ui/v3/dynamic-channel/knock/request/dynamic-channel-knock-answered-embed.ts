import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_KNOCK_ANSWERED_VARS = {
    knockEmoji: uiUtilsWrapAsTemplate( "knockEmoji" ),
    knockerDisplayName: uiUtilsWrapAsTemplate( "knockerDisplayName" ),
    answerDisplay: uiUtilsWrapAsTemplate( "answerDisplay" ),
    answerAllowed: uiUtilsWrapAsTemplate( "answerAllowed" ),
    answerDenied: uiUtilsWrapAsTemplate( "answerDenied" )
};

const DynamicChannelKnockAnsweredEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_KNOCK_ANSWERED_VARS>(
    "VertixBot/UI-V3/DynamicChannelKnockAnsweredEmbed",
    DYNAMIC_CHANNEL_KNOCK_ANSWERED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setTitle( ( vars ) => `${ vars.knockEmoji }  Request answered` )
    .setDescription( ( vars ) => vars.answerDisplay )
    .setOptions( ( vars ) => ( {
        answerDisplay: {
            [ vars.answerAllowed ]: `**${ vars.knockerDisplayName }** was let in.`,
            [ vars.answerDenied ]: `**${ vars.knockerDisplayName }** was not let in.`
        }
    } ) )
    .setLogic( ( args?: UIArgs ) => ( {
        knockerDisplayName: args?.knockerDisplayName,
        answerDisplay: args?.isKnockAllowed
            ? DYNAMIC_CHANNEL_KNOCK_ANSWERED_VARS.answerAllowed
            : DYNAMIC_CHANNEL_KNOCK_ANSWERED_VARS.answerDenied
    } ) )
    .setDefaultVars( () => ( {
        knockEmoji: EmojiManager.$.getMarkdown( "KnockChannel" ),
        knockerDisplayName: "Example User",
        answerDisplay: DYNAMIC_CHANNEL_KNOCK_ANSWERED_VARS.answerAllowed
    } ) )
    .build();

export { DynamicChannelKnockAnsweredEmbed };
