
import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-component";
import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-button";

import { forgetTransferChoice } from "@vertix.gg/bot/src/utils/transfer-ownership";

import {
    defineTransferOwnerStates,
    getTransferOwnerReplyArgs
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-states";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

const DynamicChannelTransferOwnerAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelTransferOwnerAdapter"
)
    .setComponent( DynamicChannelTransferOwnerComponent )
    .setExcludedElements( [ DynamicChannelTransferOwnerButton ] )
    .defineTransactions( ( tx ) => {
        defineTransferOwnerStates( tx )
            .setInitialState( "Default" )
            .addState( "Default", { executionStep: "default" } )
            .addTransition( "Open", { from: "Default", to: "SelectUser" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
                "Open",
                async( context, interaction ) => {
                    await context.triggerTransition( "Open", interaction );
                }
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-General/NoButton",
                "Cancel",
                async( context, interaction ) => {
                    forgetTransferChoice( interaction.channel.id, interaction.user.id );

                    await context.deleteRelatedEphemeralInteractionsInternal(
                        interaction,
                        "VertixBot/UI-V3/DynamicChannelAdapter:VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
                        1
                    );

                    await context.triggerTransition( "Cancel", interaction );
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( getTransferOwnerReplyArgs )
    .build();

export { DynamicChannelTransferOwnerAdapter };
