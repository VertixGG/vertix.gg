import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

import { EmbedBuilder } from "@vertix.gg/gui/src/builders/embed-builder";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelClearChatButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-button";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

const DYNAMIC_CHANNEL_CLEAR_CHAT_SUCCESS_VARS = {
    clearEmoji: uiUtilsWrapAsTemplate( "clearEmoji" ),
    ownerDisplayName: uiUtilsWrapAsTemplate( "ownerDisplayName" ),
    totalMessages: uiUtilsWrapAsTemplate( "totalMessages" )
};

const DynamicChannelClearChatSuccessEmbed = new EmbedBuilder<UIArgs, typeof DYNAMIC_CHANNEL_CLEAR_CHAT_SUCCESS_VARS>(
    "VertixBot/UI-V3/DynamicChannelClearChatSuccessEmbed",
    DYNAMIC_CHANNEL_CLEAR_CHAT_SUCCESS_VARS
)
    .setInstanceType( UIInstancesTypes.Dynamic )
    .setColor( 0x4b6f91 )
    .setTitle(
        () =>
            `${ DYNAMIC_CHANNEL_CLEAR_CHAT_SUCCESS_VARS.clearEmoji }  Chat was cleared the by ${ DYNAMIC_CHANNEL_CLEAR_CHAT_SUCCESS_VARS.ownerDisplayName }!`
    )
    .setDescription(
        () => `Total of ${ DYNAMIC_CHANNEL_CLEAR_CHAT_SUCCESS_VARS.totalMessages } messages.`
    )
    .setLogic( ( args: UIArgs ) => ( {
        clearEmoji: DynamicChannelClearChatButton.getEmoji(),
        ownerDisplayName: args.ownerDisplayName,
        totalMessages: args.totalMessages
    } ) )
    .build();

export { DynamicChannelClearChatSuccessEmbed };
