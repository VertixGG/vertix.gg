import {
    DynamicChannelPremiumResetChannelComponent
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-component";

import {
    DynamicExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DynamicChannelPremiumResetChannelButton
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/reset/dynamic-channel-premium-reset-channel-button";

import type { UIDefaultButtonChannelVoiceInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

/**
 * The same two screens for a channel whose generator runs the older interface.
 *
 * A guild can run generators of both versions at once, so `/voice reset` has to answer in whichever
 * one the channel it found belongs to, and the two do not name a screen alike.
 */
const DynamicChannelPremiumResetChannelCommandAdapter = new DynamicExecutionAdapterBuilder<
    UIDefaultButtonChannelVoiceInteraction
>( "VertixBot/UI-V2/DynamicChannelPremiumResetChannelCommandAdapter" )
    .setComponent( DynamicChannelPremiumResetChannelComponent )
    .setExcludedElements( [ DynamicChannelPremiumResetChannelButton ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Success" )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelCommandSuccess",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelEmbedGroup",
                navigationType: "ephemeral",
                previewDefaultVars: { code: "success" }
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V2/DynamicChannelPremiumResetChannelCommandError",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup",
                navigationType: "ephemeral"
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

export { DynamicChannelPremiumResetChannelCommandAdapter };
