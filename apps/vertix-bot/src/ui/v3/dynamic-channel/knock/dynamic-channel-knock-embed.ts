import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_KNOCK_EMBED_VARS = {
    knockEmoji: uiUtilsWrapAsTemplate( "knockEmoji" )
};

const DynamicChannelKnockEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_KNOCK_EMBED_VARS>(
    "VertixBot/UI-V3/DynamicChannelKnockEmbed",
    DYNAMIC_CHANNEL_KNOCK_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ DYNAMIC_CHANNEL_KNOCK_EMBED_VARS.knockEmoji }  Ask to join a channel` )
    .setDescription(
        "Pick the channel you want into and its owner is asked to let you in.\n\n" +
        "They decide, and you are told either way."
    )
    .setDefaultVars( () => ( {
        knockEmoji: EmojiManager.$.getMarkdown( "KnockChannel" )
    } ) )
    .build();

export { DynamicChannelKnockEmbed };
