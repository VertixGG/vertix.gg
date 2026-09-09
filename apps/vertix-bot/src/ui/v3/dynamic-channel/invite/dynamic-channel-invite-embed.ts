import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_INVITE_EMBED_VARS = {
    inviteEmoji: uiUtilsWrapAsTemplate( "inviteEmoji" )
};

const DynamicChannelInviteEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_INVITE_EMBED_VARS>(
    "VertixBot/UI-V3/DynamicChannelInviteEmbed",
    DYNAMIC_CHANNEL_INVITE_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ DYNAMIC_CHANNEL_INVITE_EMBED_VARS.inviteEmoji }  Invite someone to your channel` )
    .setDescription(
        "Select the user you want in, and they can join whatever this channel is set to.\n\n" +
        "They are told where to find it, so a private channel does not have to be explained."
    )
    .setDefaultVars( () => ( {
        inviteEmoji: EmojiManager.$.getMarkdown( "InviteChannel" )
    } ) )
    .build();

export { DynamicChannelInviteEmbed };
