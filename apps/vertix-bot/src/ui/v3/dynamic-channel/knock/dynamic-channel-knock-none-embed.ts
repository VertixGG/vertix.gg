import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_KNOCK_NONE_EMBED_VARS = {
    knockEmoji: uiUtilsWrapAsTemplate( "knockEmoji" )
};

const DynamicChannelKnockNoneEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_KNOCK_NONE_EMBED_VARS>(
    "VertixBot/UI-V3/DynamicChannelKnockNoneEmbed",
    DYNAMIC_CHANNEL_KNOCK_NONE_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( Colors.Grey )
    .setTitle( () => `${ DYNAMIC_CHANNEL_KNOCK_NONE_EMBED_VARS.knockEmoji }  Nothing to knock on` )
    .setDescription(
        "Every channel here is either open to you already or is one of your own.\n\n" +
        "A channel you cannot see is not listed - if a friend has one, ask them for an invite."
    )
    .setDefaultVars( () => ( {
        knockEmoji: EmojiManager.$.getMarkdown( "KnockChannel" )
    } ) )
    .build();

export { DynamicChannelKnockNoneEmbed };
