import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import {
    rememberTransferChoice,
    takeTransferChoice
} from "@vertix.gg/bot/src/utils/transfer-ownership";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { TransactionBuilder } from "@vertix.gg/gui/src/builders/transaction-builder";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type TransferInteraction =
    | UIDefaultUserSelectMenuChannelVoiceInteraction
    | UIDefaultButtonChannelVoiceInteraction;

type TransferTransactions = TransactionBuilder<IExecutionAdapterContext<TransferInteraction, UIArgs>>;

/**
 * Function defineTransferOwnerStates() :: Every screen handing a channel over can end on, in the
 * older interface, and what leads between them.
 *
 * The v3 counterpart of this is its own file for one reason: the two versions name every screen
 * differently, and a name is written out rather than composed. What they share instead is being
 * written once each rather than twice.
 */
export function defineTransferOwnerStates( tx: TransferTransactions ) {
    tx
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
        .addState( "ChoiceExpired", {
            executionStep: "VertixBot/UI-V2/DynamicChannelTransferChoiceExpired",
            navigationType: "ephemeral",
            embedsGroup: "VertixBot/UI-General/ChoiceExpiredEmbedGroup"
        } )
        .addState( "Cancelled", {
            executionStep: "VertixBot/UI-V2/DynamicChannelTransferError",
            navigationType: "silent"
        } )
        .addTransition( "UserSelected", {
            from: "SelectUser",
            to: "UserSelected",
            mutations: [ { type: "set", path: [ "userDisplayName" ] } ]
        } )
        .addTransition( "Confirm", { from: "UserSelected", to: "Success" } )
        .addTransition( "DisabledByClaim", { from: "UserSelected", to: "DisabledByClaim" } )
        .addTransition( "Error", { from: [ "SelectUser", "UserSelected" ], to: "Error" } )
        .addTransition( "ChoiceExpired", { from: "UserSelected", to: "ChoiceExpired" } )
        .addTransition( "Cancel", { from: "UserSelected", to: "Cancelled" } )
        .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V2/DynamicChannelTransferOwnerUserMenu",
            "UserSelected",
            async( context, interaction ) => {
                const targetId = interaction.values.at( 0 ) as string,
                    target = interaction.guild.members.cache.get( targetId );

                if ( ! target ) {
                    await context.updateInteractionDefer( interaction );
                    return;
                }

                context.setArgs( interaction, { userDisplayName: target.displayName } );

                await context.triggerTransition( "UserSelected", interaction, {
                    userDisplayName: target.displayName
                } );

                rememberTransferChoice(
                    interaction.channel.id,
                    interaction.user.id,
                    targetId,
                    () => void interaction.deleteReply().catch( () => {} )
                );
            }
        )
        .bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-General/YesButton",
            "Confirm",
            async( context, interaction ) => {
                if ( "active" === DynamicChannelVoteManager.$.getState( interaction.channelId ) ) {
                    await context.triggerTransition( "DisabledByClaim", interaction );
                    return;
                }

                const selectedUserId = takeTransferChoice( interaction.channel.id, interaction.user.id );

                // The screen asking this stays on display across a restart, so `Yes` still
                // arrives - at a process that never stored what was picked. Nothing was attempted,
                // and the generic failure this replaces said otherwise.
                if ( ! selectedUserId ) {
                    await context.triggerTransition( "ChoiceExpired", interaction );
                    return;
                }

                const target = interaction.guild.members.cache.get( selectedUserId );

                if ( ! target ) {
                    await context.triggerTransition( "Error", interaction );
                    return;
                }

                await ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" )
                    .editChannelOwner( target.id, interaction.user.id, interaction.channel, "transfer" );

                await context.triggerTransition( "Confirm", interaction );
            }
        );

    return tx;
}

export async function getTransferOwnerReplyArgs(
    context: IExecutionAdapterContext<TransferInteraction, UIArgs>,
    interaction: TransferInteraction,
    argsFromManager?: UIArgs
) {
    const storedArgs = context.getArgs( interaction ) ?? {};

    if ( "VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelected"
    === context.getCurrentExecutionStep( interaction )?.name ) {
        return {
            userDisplayName: storedArgs.userDisplayName ?? argsFromManager?.userDisplayName
        };
    }

    // Merged rather than read from the store alone: the command hands the channel in with the
    // opening, having nothing stored yet, and every press after this one resolves the channel from
    // these args.
    return Object.assign( {}, storedArgs, argsFromManager ?? {} );
}
