import {
    DynamicChannelClearChatComponent
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-component";

import {
    DynamicExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DynamicChannelClearChatButton
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/clear-chat/dynamic-channel-clear-chat-button";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * What `/voice clear-chat` says once the chat has been cleared.
 *
 * Three outcomes, each a sentence about something already done - the clearing happens in the
 * command, since which of the three applies is the answer rather than a screen.
 *
 * Every one of them is ephemeral. The button beside it also leaves a notice in the channel saying
 * who cleared it, and a command does not - what a member does by command is theirs to mention.
 */
const DynamicChannelClearChatCommandAdapter = new DynamicExecutionAdapterBuilder<
    UIDefaultButtonChannelVoiceInteraction
>( "VertixBot/UI-V3/DynamicChannelClearChatCommandAdapter" )
    .setComponent( DynamicChannelClearChatComponent )
    .setExcludedElements( [ DynamicChannelClearChatButton ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Success" )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V3/DynamicChannelClearChatCommandSuccess",
                navigationType: "ephemeral",
                previewDefaultVars: { ownerDisplayName: "Owner", totalMessages: "5" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelClearChatSuccessEmbedGroup"
            } )
            .addState( "NothingToClear", {
                executionStep: "VertixBot/UI-V3/DynamicChannelClearChatCommandNothingToClear",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V3/DynamicChannelClearChatNothingToClearEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/DynamicChannelClearChatCommandError",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } );
    } )
    .getStartArgs( async( _context, _channel, argsFromManager ) => ( {
        ownerDisplayName: argsFromManager?.ownerDisplayName ?? "",
        totalMessages: argsFromManager?.totalMessages ?? 0
    } ) )
    .getReplyArgs( async( _context, _interaction, argsFromManager ) => ( {
        ownerDisplayName: argsFromManager?.ownerDisplayName,
        totalMessages: argsFromManager?.totalMessages
    } ) )
    .build();

export { DynamicChannelClearChatCommandAdapter };
