import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";
import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes, UI_IMAGE_EMPTY_LINE_URL } from "@vertix.gg/gui/src/bases/ui-definitions";

import { VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_INVITE_SELECT_CHANNEL_EMBED_VARS = {
    inviteEmoji: uiUtilsWrapAsTemplate( "inviteEmoji" )
};

const DynamicChannelInviteSelectChannelEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_INVITE_SELECT_CHANNEL_EMBED_VARS>(
    "VertixBot/UI-V3/DynamicChannelInviteSelectChannelEmbed",
    DYNAMIC_CHANNEL_INVITE_SELECT_CHANNEL_EMBED_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( VERTIX_DEFAULT_COLOR_BRAND )
    .setImage( UI_IMAGE_EMPTY_LINE_URL )
    .setTitle( () => `${ DYNAMIC_CHANNEL_INVITE_SELECT_CHANNEL_EMBED_VARS.inviteEmoji }  Which channel?` )
    .setDescription( "You have more than one channel open here. Pick the one to invite someone into." )
    .setDefaultVars( () => ( {
        inviteEmoji: EmojiManager.$.getMarkdown( "InviteChannel" )
    } ) )
    .build();

export { DynamicChannelInviteSelectChannelEmbed };
