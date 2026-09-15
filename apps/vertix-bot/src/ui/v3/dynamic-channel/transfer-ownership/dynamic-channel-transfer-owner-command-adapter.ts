import {
    DynamicExecutionAdapterBuilder
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DynamicChannelTransferOwnerComponent
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-component";

import {
    DynamicChannelTransferOwnerButton
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-button";

import {
    defineTransferOwnerStates,
    getTransferOwnerReplyArgs
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-states";

import { forgetTransferChoice } from "@vertix.gg/bot/src/utils/transfer-ownership";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

/**
 * The interface `/voice transfer` opens.
 *
 * It starts where the button's interface only gets to after a press: at the question of who to hand
 * the channel to. The screens themselves are shared with that interface rather than restated, so
 * the two cannot come to describe the exchange differently.
 *
 * What is its own is saying no. The button's interface deletes the panel ephemeral it was opened
 * over; a command opened nothing but itself, so itself is what there is to close.
 */
const DynamicChannelTransferOwnerCommandAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelTransferOwnerCommandAdapter"
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
