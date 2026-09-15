import {
    DynamicChannelResetChannelComponent
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-component";

import {
    DynamicExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DynamicChannelResetChannelButton
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/reset/dynamic-channel-reset-channel-button";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * What `/voice reset` says once the channel has been reset.
 *
 * Three outcomes and nothing else. The button's interface needs a further state to be pressed from,
 * and its handler does the resetting on the way out of it - a command has no screen to be pressed
 * on, so the resetting happens in the command and this only says how it went.
 *
 * `VoteRequired` is drawn by top.gg's own reply rather than by this interface, which is what silent
 * navigation means here as it does beside the button - the outcome is real and the screen is
 * somebody else's.
 *
 * Nothing here is interactive, which is why it is built on the ordinary dynamic builder rather than
 * the one a command's interface usually needs: the owner gate those apply is never reached, having
 * no element to reach it through, and resetting is an owner's act anyway.
 */
const DynamicChannelResetChannelCommandAdapter = new DynamicExecutionAdapterBuilder<
    UIDefaultButtonChannelVoiceInteraction
>( "VertixBot/UI-V3/DynamicChannelResetChannelCommandAdapter" )
    .setComponent( DynamicChannelResetChannelComponent )
    .setExcludedElements( [ DynamicChannelResetChannelButton ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Success" )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelCommandSuccess",
                navigationType: "ephemeral",
                previewDefaultVars: { code: "success" },
                embedsGroup: "VertixBot/UI-V3/DynamicChannelResetChannelEmbedGroup"
            } )
            .addState( "VoteRequired", {
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelCommandVoteRequired",
                navigationType: "silent",
                embedsGroup: "VertixBot/UI-General/TopGGVoteEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/DynamicChannelResetChannelCommandError",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( _context, _interaction, argsFromManager ) => {
        if ( argsFromManager?.result ) {
            return argsFromManager.result;
        }

        return {};
    } )
    .build();

export { DynamicChannelResetChannelCommandAdapter };
