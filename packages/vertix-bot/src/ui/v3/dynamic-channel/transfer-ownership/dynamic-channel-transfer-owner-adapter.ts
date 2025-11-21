import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-component";
import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-button";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
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

async function onTransferOwnerButtonClicked(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferOwnerSelectUser" );
    }

async function onTransferOwnerUserSelected(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    interaction: UIDefaultUserSelectMenuChannelVoiceInteraction
) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( !target ) {
        await context.updateInteractionDefer( interaction );
            return;
        }

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected", {
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

async function onYesButtonClicked(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
        const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

        if ( "active" === state ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferDisabledByClaim" );
            return;
        }

    const accepted = acceptedInteraction.get( interaction.channel.id + interaction.user.id );

    clearAcceptedInteraction( interaction );

    if ( !accepted ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferError" );
            return;
        }

    const target = interaction.guild.members.cache.get( accepted.selectedUserId );

        if ( !target ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferError" );
            return;
        }

    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    await dynamicChannelService.editChannelOwner( target.id, interaction.user.id, interaction.channel, "transfer" );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferOwnerSuccess" );
    }

async function onNoButtonClicked(
    context: IExecutionAdapterContext<DefaultInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    clearAcceptedInteraction( interaction );

    await context.deleteRelatedEphemeralInteractionsInternal(
            interaction,
            "VertixBot/UI-V3/DynamicChannelAdapter:VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
            1
        );
}

const DynamicChannelTransferOwnerAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelTransferOwnerAdapter"
)
    .setComponent( DynamicChannelTransferOwnerComponent )
    .setExecutionSteps( TRANSFER_OWNER_STEPS )
    .setExcludedElements( [ DynamicChannelTransferOwnerButton ] )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected":
                return {
                    userDisplayName: argsFromManager?.userDisplayName
                };
        }

        return {};
    } )
    .onEntityMap( async( { bindButton, bindUserSelectMenu } ) => {
        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
            onTransferOwnerButtonClicked
        );

        bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenu",
            onTransferOwnerUserSelected
        );

        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-General/YesButton",
            onYesButtonClicked
        );

        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-General/NoButton",
            onNoButtonClicked
        );
    } )
    .build();

export { DynamicChannelTransferOwnerAdapter };
