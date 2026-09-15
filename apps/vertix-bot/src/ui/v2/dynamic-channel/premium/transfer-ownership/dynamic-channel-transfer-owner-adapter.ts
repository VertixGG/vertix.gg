
import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-component";
import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-button";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import { forgetTransferChoice } from "@vertix.gg/bot/src/utils/transfer-ownership";

import {
    defineTransferOwnerStates,
    getTransferOwnerReplyArgs
} from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-states";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

async function onTransferOwnerButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelTransferOwnerSelectUser" );
}

async function onNoButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    forgetTransferChoice( interaction.channel.id, interaction.user.id );

    await context.deleteRelatedEphemeralInteractionsInternal(
        interaction,
        "VertixBot/UI-V2/DynamicChannelAdapter:VertixBot/UI-V2/DynamicChannelTransferOwnerButton",
        1
    );
}

const DynamicChannelTransferOwnerAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelTransferOwnerAdapter"
)
    .setComponent( DynamicChannelTransferOwnerComponent )
    .setExcludedElements( [ DynamicChannelTransferOwnerButton ] )
    .defineTransactions( ( tx ) => {
        defineTransferOwnerStates( tx )
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelTransferOwnerUserMenuGroup"
            } )
            .addTransition( "Open", { from: "Default", to: "SelectUser" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelTransferOwnerButton",
                "Open",
                onTransferOwnerButtonClicked
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-General/NoButton",
                "Cancel",
                onNoButtonClicked
            );
    } )
    .getReplyArgs( getTransferOwnerReplyArgs )
    .build();

export { DynamicChannelTransferOwnerAdapter };
