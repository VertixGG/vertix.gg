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
 * Function defineTransferOwnerStates() :: Every screen handing a channel over can end on, and what
 * leads between them.
 *
 * Declared once and handed the builder, because the interface the transfer button opens and the one
 * `/voice transfer` opens are the same screens in the same order - they differ only in where a
 * member joins them and in what saying no closes. Written out twice, they were two descriptions of
 * one exchange, and the pair would have drifted the first time either was touched.
 *
 * The screens are named identically in both, which is what lets this be one function: an execution
 * step resolves within the adapter asking for it, so two adapters holding a step of the same name
 * hold their own.
 */
export function defineTransferOwnerStates( tx: TransferTransactions ) {
    tx
        .addState( "SelectUser", {
            executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerSelectUser",
            navigationType: "ephemeral",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTransferOwnerEmbedGroup",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenuGroup"
        } )
        .addState( "UserSelected", {
            executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected",
            navigationType: "editReply",
            previewDefaultVars: { userDisplayName: "User" },
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelectedEmbedGroup",
            elementsGroup: "VertixBot/UI-General/YesNoElementsGroup"
        } )
        .addState( "Success", {
            executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerSuccess",
            navigationType: "editReply",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTransferOwnerTransferredEmbedGroup"
        } )
        .addState( "DisabledByClaim", {
            executionStep: "VertixBot/UI-V3/DynamicChannelTransferDisabledByClaim",
            navigationType: "ephemeral",
            embedsGroup: "VertixBot/UI-General/DisabledWhileClaimEmbedGroup"
        } )
        .addState( "Error", {
            executionStep: "VertixBot/UI-V3/DynamicChannelTransferError",
            navigationType: "ephemeral",
            embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
        } )
        .addState( "Cancelled", {
            executionStep: "VertixBot/UI-V3/DynamicChannelTransferError",
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
        .addTransition( "Cancel", {
            from: "UserSelected",
            to: "Cancelled",
            // Saying no takes the whole exchange off the screen - each adapter's own `No` handler
            // below decides which reply that is.
            previewDeletesReply: true
        } )
        .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenu",
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

                if ( ! selectedUserId ) {
                    await context.triggerTransition( "Error", interaction );
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

/**
 * Function getTransferOwnerReplyArgs() :: Carries the chosen member's name onto the screen that
 * names them.
 *
 * The confirmation answers on a new message, so the write that recorded the name has no store to
 * land in; `argsFromManager` is where it still is.
 */
export async function getTransferOwnerReplyArgs(
    context: IExecutionAdapterContext<TransferInteraction, UIArgs>,
    interaction: TransferInteraction,
    argsFromManager?: UIArgs
) {
    const storedArgs = context.getArgs( interaction ) ?? {};

    if ( "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected"
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
