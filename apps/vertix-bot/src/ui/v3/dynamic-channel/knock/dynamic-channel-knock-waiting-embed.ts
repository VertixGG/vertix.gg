import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_KNOCK_WAITING_EMBED_VARS = {
    knockEmoji: uiUtilsWrapAsTemplate( "knockEmoji" )
};

const DynamicChannelKnockWaitingEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_KNOCK_WAITING_EMBED_VARS>(
    "VertixBot/UI-V3/DynamicChannelKnockWaitingEmbed",
    DYNAMIC_CHANNEL_KNOCK_WAITING_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( Colors.Grey )
    .setTitle( () => `${ DYNAMIC_CHANNEL_KNOCK_WAITING_EMBED_VARS.knockEmoji }  You already asked` )
    .setDescription(
        "That channel's owner has your request and has not answered it yet.\n\n" +
        "Give them a few minutes before asking again."
    )
    .setDefaultVars( () => ( {
        knockEmoji: EmojiManager.$.getMarkdown( "KnockChannel" )
    } ) )
    .build();

export { DynamicChannelKnockWaitingEmbed };
