import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelClearChatButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-button";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_CLEAR_CHAT_EMPTY_VARS = {
    clearEmoji: uiUtilsWrapAsTemplate( "clearEmoji" )
};

const DynamicChannelClearChatNothingToClearEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_CLEAR_CHAT_EMPTY_VARS>(
    "VertixBot/UI-V3/DynamicChannelClearChatNothingToClearEmbed",
    DYNAMIC_CHANNEL_CLEAR_CHAT_EMPTY_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setTitle(
        () => `${ DYNAMIC_CHANNEL_CLEAR_CHAT_EMPTY_VARS.clearEmoji }  There are no messages available to clear`
    )
    .setDescription(
        () => "Keep in mind, that only non-embeds messages can be deleted."
    )
    .setLogic( () => ( {
        clearEmoji: DynamicChannelClearChatButton.getEmoji()
    } ) )
    .build();

export { DynamicChannelClearChatNothingToClearEmbed };
