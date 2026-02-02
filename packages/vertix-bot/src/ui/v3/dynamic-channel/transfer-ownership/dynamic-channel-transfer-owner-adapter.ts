import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-component";
import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-button";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

interface AcceptedInteraction {
    selectedUserId: string;
    timeout: NodeJS.Timeout;
}

const ACCEPTED_INTERACTION_TIMEOUT = 5 * 60 * 1000;

const acceptedInteraction: Map<string, AcceptedInteraction> = new Map<string, AcceptedInteraction>();

const TRANSFER_OWNER_STEPS = {
    default: {},
    "VertixBot/UI-V3/DynamicChannelTransferOwnerSelectUser": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelTransferOwnerEmbedGroup",
        elementsGroup: "VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenuGroup"
    },
    "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelectedEmbedGroup",
        elementsGroup: "VertixBot/UI-General/YesNoElementsGroup"
    },
    "VertixBot/UI-V3/DynamicChannelTransferOwnerSuccess": {
        embedsGroup: "VertixBot/UI-V3/DynamicChannelTransferOwnerTransferredEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelTransferDisabledByClaim": {
        embedsGroup: "VertixBot/UI-General/DisabledWhileClaimEmbedGroup"
    },
    "VertixBot/UI-V3/DynamicChannelTransferError": {
        embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
    }
} as const;

function clearAcceptedInteraction( interaction: UIDefaultButtonChannelVoiceInteraction ) {
    const accepted = acceptedInteraction.get( interaction.channel.id + interaction.user.id );

    if ( accepted ) {
        clearTimeout( accepted.timeout );
        acceptedInteraction.delete( interaction.channel.id + interaction.user.id );
    }
}

const DynamicChannelTransferOwnerAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelTransferOwnerAdapter"
)
    .setComponent( DynamicChannelTransferOwnerComponent )
    .setExecutionSteps( TRANSFER_OWNER_STEPS )
    .setExcludedElements( [ DynamicChannelTransferOwnerButton ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", { executionStep: "default" } )
            .addState( "SelectUser", {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerSelectUser",
                navigationType: "ephemeral"
            } )
            .addState( "UserSelected", {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected",
                navigationType: "editReply",
                previewDefaultVars: { userDisplayName: "User" }
            } )
            .addState( "Success", {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferOwnerSuccess",
                navigationType: "editReply"
            } )
            .addState( "DisabledByClaim", {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferDisabledByClaim",
                navigationType: "ephemeral"
            } )
            .addState( "Error", {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferError",
                navigationType: "ephemeral"
            } )
            .addState( "Cancelled", {
                executionStep: "VertixBot/UI-V3/DynamicChannelTransferError",
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
                "VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
                "Open",
                async( context, interaction ) => {
                    await context.triggerTransition( "Open", interaction );
                }
            )
            .bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenu",
                "UserSelected",
                async( context, interaction ) => {
                    const targetId = interaction.values.at( 0 ) as string,
                        target = interaction.guild.members.cache.get( targetId );

                    if ( !target ) {
                        await context.updateInteractionDefer( interaction );
                        return;
                    }

                    context.setArgs( interaction, { userDisplayName: target.displayName } );

                    await context.triggerTransition( "UserSelected", interaction, {
                        userDisplayName: target.displayName
                    } );

                    const accepted = acceptedInteraction.get( interaction.channel.id + interaction.user.id );

                    if ( accepted ) {
                        clearTimeout( accepted.timeout );
                        acceptedInteraction.delete( interaction.channel.id + interaction.user.id );
                    }

                    const timeoutId = setTimeout( () => {
                        interaction.deleteReply().catch( () => {} );
                        acceptedInteraction.delete( interaction.channel.id + interaction.user.id );
                    }, ACCEPTED_INTERACTION_TIMEOUT );

                    acceptedInteraction.set( interaction.channel.id + interaction.user.id, {
                        selectedUserId: targetId,
                        timeout: timeoutId
                    } );
                }
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-General/YesButton",
                "Confirm",
                async( context, interaction ) => {
                    const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

                    if ( "active" === state ) {
                        await context.triggerTransition( "DisabledByClaim", interaction );
                        return;
                    }

                    const accepted = acceptedInteraction.get( interaction.channel.id + interaction.user.id );

                    clearAcceptedInteraction( interaction );

                    if ( !accepted ) {
                        await context.triggerTransition( "Error", interaction );
                        return;
                    }

                    const target = interaction.guild.members.cache.get( accepted.selectedUserId );

                    if ( !target ) {
                        await context.triggerTransition( "Error", interaction );
                        return;
                    }

                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

                    await dynamicChannelService.editChannelOwner( target.id, interaction.user.id, interaction.channel, "transfer" );

                    await context.triggerTransition( "Confirm", interaction );
                }
            )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-General/NoButton",
                "Cancel",
                async( context, interaction ) => {
                    clearAcceptedInteraction( interaction );

                    await context.deleteRelatedEphemeralInteractionsInternal(
                        interaction,
                        "VertixBot/UI-V3/DynamicChannelAdapter:VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
                        1
                    );

                    // Silent transition - just for tracking
                    await context.triggerTransition( "Cancel", interaction );
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const currentStep = context.getCurrentExecutionStep( interaction )?.name;
        const storedArgs = context.getArgs( interaction );

        if ( currentStep === "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected" ) {
            return {
                userDisplayName: storedArgs.userDisplayName ?? argsFromManager?.userDisplayName
            };
        }

        return storedArgs;
    } )
    .build();

export { DynamicChannelTransferOwnerAdapter };
