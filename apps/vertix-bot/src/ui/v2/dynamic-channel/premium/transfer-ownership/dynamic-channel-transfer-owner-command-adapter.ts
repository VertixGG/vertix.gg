import {
    DynamicExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DynamicChannelTransferOwnerComponent
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-component";

import {
    DynamicChannelTransferOwnerButton
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-button";

import {
    defineTransferOwnerStates,
    getTransferOwnerReplyArgs
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-states";

import { forgetTransferChoice } from "@vertix.gg/bot/src/utils/transfer-ownership";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

/**
 * The same question for a channel whose generator runs the older interface.
 *
 * Its screens are the button interface's own, shared rather than restated. What differs is where a
 * member joins them, and that saying no closes this reply rather than the panel one above it.
 */
const DynamicChannelTransferOwnerCommandAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelTransferOwnerCommandAdapter"
)
    .setComponent( DynamicChannelTransferOwnerComponent )
    .setExcludedElements( [ DynamicChannelTransferOwnerButton ] )
    .defineTransactions( ( tx ) => {
        defineTransferOwnerStates( tx )
            .setInitialState( "SelectUser" )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-General/NoButton",
                "Cancel",
                async( context, interaction ) => {
                    forgetTransferChoice( interaction.channel.id, interaction.user.id );

                    await interaction.deleteReply().catch( () => {} );

                    await context.triggerTransition( "Cancel", interaction );
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( getTransferOwnerReplyArgs )
    .build();

export { DynamicChannelTransferOwnerCommandAdapter };
