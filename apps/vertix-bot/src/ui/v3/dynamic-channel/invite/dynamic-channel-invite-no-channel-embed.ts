import { Colors } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_INVITE_NO_CHANNEL_EMBED_VARS = {
    inviteEmoji: uiUtilsWrapAsTemplate( "inviteEmoji" )
};

const DynamicChannelInviteNoChannelEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_INVITE_NO_CHANNEL_EMBED_VARS>(
    "VertixBot/UI-V3/DynamicChannelInviteNoChannelEmbed",
    DYNAMIC_CHANNEL_INVITE_NO_CHANNEL_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( Colors.Grey )
    .setTitle( () => `${ DYNAMIC_CHANNEL_INVITE_NO_CHANNEL_EMBED_VARS.inviteEmoji }  You have no channel here` )
    .setDescription(
        "There is nothing to invite anyone into yet.\n\n" +
        "Join the generator to open a channel, then invite whoever you want."
    )
    .setDefaultVars( () => ( {
        inviteEmoji: EmojiManager.$.getMarkdown( "InviteChannel" )
    } ) )
    .build();

export { DynamicChannelInviteNoChannelEmbed };
