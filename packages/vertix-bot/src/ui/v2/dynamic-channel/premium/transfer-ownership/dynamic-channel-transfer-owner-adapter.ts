import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-component";
import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-button";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

interface AcceptedInteraction {
    selectedUserId: string;
    timeout: NodeJS.Timeout;
}

const ACCEPTED_INTERACTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Static state shared across adapter instances
const acceptedInteractionMap: Map<string, AcceptedInteraction> = new Map<string, AcceptedInteraction>();

function clearAcceptedInteraction( interaction: UIDefaultButtonChannelVoiceInteraction ) {
    const acceptedInteraction = acceptedInteractionMap.get(
        interaction.channel.id + interaction.user.id
    );

    if ( acceptedInteraction ) {
        clearTimeout( acceptedInteraction.timeout );
        acceptedInteractionMap.delete( interaction.channel.id + interaction.user.id );
    }
}

async function onTransferOwnerButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelTransferOwnerSelectUser" );
}

async function onTransferOwnerUserSelected(
    context: IExecutionAdapterContext<UIDefaultUserSelectMenuChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction
) {
    const targetId = interaction.values.at( 0 ) as string,
        target = interaction.guild.members.cache.get( targetId );

    if ( !target ) {
        await context.updateInteractionDefer( interaction );
        return;
    }

    await context.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelected", {
        userDisplayName: target.displayName
    } );

    const acceptedInteraction = acceptedInteractionMap.get(
        interaction.channel.id + interaction.user.id
    );

    if ( acceptedInteraction ) {
        clearTimeout( acceptedInteraction.timeout );
        acceptedInteractionMap.delete( interaction.channel.id + interaction.user.id );
    }

    const timeoutId = setTimeout( () => {
        interaction.deleteReply().catch( () => {} );
        acceptedInteractionMap.delete( interaction.channel.id + interaction.user.id );
    }, ACCEPTED_INTERACTION_TIMEOUT );

    acceptedInteractionMap.set( interaction.channel.id + interaction.user.id, {
        selectedUserId: targetId,
        timeout: timeoutId
    } );
}

async function onYesButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

    if ( "active" === state ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelTransferDisabledByClaim" );
        return;
    }

    const acceptedInteraction = acceptedInteractionMap.get(
        interaction.channel.id + interaction.user.id
    );

    clearAcceptedInteraction( interaction );

    if ( !acceptedInteraction ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelTransferError" );
        return;
    }

    const target = interaction.guild.members.cache.get( acceptedInteraction.selectedUserId );

    if ( !target ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelTransferError" );
        return;
    }

    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    await dynamicChannelService.editChannelOwner(
        target.id,
        interaction.user.id,
        interaction.channel,
        "transfer"
    );

    // Since we've already deferred the update, we should use editReply instead
    try {
        await context.editReplyWithStep( interaction, "VertixBot/UI-V2/DynamicChannelTransferOwnerSuccess" );
    } catch {
        // If editing fails, try to send a follow-up message
        await interaction
            .followUp( {
                content: "Channel ownership transferred successfully!",
                ephemeral: true
            } )
            .catch( () => {} );
    }
}

async function onNoButtonClicked(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    clearAcceptedInteraction( interaction );

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
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelTransferOwnerUserMenuGroup"
            } )
            .addState( "SelectUser", {
                executionStep: "VertixBot/UI-V2/DynamicChannelTransferOwnerSelectUser",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelTransferOwnerEmbedGroup",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelTransferOwnerUserMenuGroup"
            } )
            .addState( "UserSelected", {
                executionStep: "VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelected",
                navigationType: "editReply",
                previewDefaultVars: { userDisplayName: "User" },
                embedsGroup: "VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelectedEmbedGroup",
                elementsGroup: "VertixBot/UI-General/YesNoElementsGroup"
            } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V2/DynamicChannelTransferOwnerSuccess",
                navigationType: "editReply",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelTransferOwnerTransferredEmbedGroup"
            } )
            .addState( "DisabledByClaim", {
                executionStep: "VertixBot/UI-V2/DynamicChannelTransferDisabledByClaim",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/DisabledWhileClaimEmbedGroup"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V2/DynamicChannelTransferError",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            } )
            .addState( "Cancelled", {
                executionStep: "VertixBot/UI-V2/DynamicChannelTransferError",
                navigationType: "silent"
            } )
            .addTransition( "Open", { from: "Default", to: "SelectUser" } )
            .addTransition( "UserSelected", {
                from: "SelectUser",
                to: "UserSelected",
                mutations: [ { type: "set", path: [ "userDisplayName" ] } ]
            } )
            .addTransition( "Confirm", { from: "UserSelected", to: "Success" } )
            .addTransition( "DisabledByClaim", { from: "UserSelected", to: "DisabledByClaim" } )
            .addTransition( "Error", { from: [ "SelectUser", "UserSelected" ], to: "Error" } )
            .addTransition( "Cancel", { from: "UserSelected", to: "Cancelled" } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelTransferOwnerButton",
                "Open",
                onTransferOwnerButtonClicked
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelTransferOwnerUserMenu",
                "UserSelected",
                onTransferOwnerUserSelected
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-General/YesButton",
                "Confirm",
                onYesButtonClicked
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-General/NoButton",
                "Cancel",
                onNoButtonClicked
            );
    } )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelected":
                return {
                    userDisplayName: argsFromManager?.userDisplayName
                };
        }

        return {};
    } )
    .build();

export { DynamicChannelTransferOwnerAdapter };
