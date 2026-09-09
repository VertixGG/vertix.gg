import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_KNOCK_SENT_VARS = {
    knockEmoji: uiUtilsWrapAsTemplate( "knockEmoji" ),
    knockedChannelName: uiUtilsWrapAsTemplate( "knockedChannelName" )
};

const DynamicChannelKnockSentEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_KNOCK_SENT_VARS>(
    "VertixBot/UI-V3/DynamicChannelKnockSentEmbed",
    DYNAMIC_CHANNEL_KNOCK_SENT_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( ( vars ) => `${ vars.knockEmoji }  Your request was sent` )
    .setDescription( ( vars ) => (
        `The owner of **${ vars.knockedChannelName }** has been asked to let you in.\n\n` +
        "You are told as soon as they answer."
    ) )
    .setLogic( ( args?: UIArgs ) => ( {
        knockedChannelName: args?.knockedChannelName
    } ) )
    .setDefaultVars( () => ( {
        knockEmoji: EmojiManager.$.getMarkdown( "KnockChannel" ),
        knockedChannelName: "Example Channel"
    } ) )
    .build();

export { DynamicChannelKnockSentEmbed };
