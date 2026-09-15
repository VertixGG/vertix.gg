import {
    DynamicExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DynamicChannelMetaClearChatComponent
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-component";

import {
    DynamicChannelMetaClearChatButton
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/meta/clear-chat/dynamic-channel-meta-clear-chat-button";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * The same three outcomes for a channel whose generator runs the older interface.
 *
 * This one answers only the member who typed it, and sends nothing to the channel - which is what
 * the v2 button does too. The two versions genuinely differ here, and a command that announced in
 * v2 would be doing something its own interface never did.
 */
const DynamicChannelMetaClearChatCommandAdapter = new DynamicExecutionAdapterBuilder<
    UIDefaultButtonChannelVoiceInteraction
>( "VertixBot/UI-V2/DynamicChannelMetaClearChatCommandAdapter" )
    .setComponent( DynamicChannelMetaClearChatComponent )
    .setExcludedElements( [ DynamicChannelMetaClearChatButton ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Success" )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaClearChatCommandSuccess",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaClearChatSuccessEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { ownerDisplayName: "Owner", totalMessages: "5" }
            } )
            .addState( "NothingToClear", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaClearChatCommandNothingToClear",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelMetaClearChatNothingToClearEmbedGroup",
                navigationType: "ephemeral"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V2/DynamicChannelMetaClearChatCommandError",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup",
                navigationType: "ephemeral"
            } );
    } )
    .getStartArgs( async( _context, _channel, argsFromManager ) => ( {
        ownerDisplayName: argsFromManager?.ownerDisplayName,
        totalMessages: argsFromManager?.totalMessages
    } ) )
    .getReplyArgs( async( _context, _interaction, argsFromManager ) => ( {
        ownerDisplayName: argsFromManager?.ownerDisplayName,
        totalMessages: argsFromManager?.totalMessages
    } ) )
    .build();

export { DynamicChannelMetaClearChatCommandAdapter };
