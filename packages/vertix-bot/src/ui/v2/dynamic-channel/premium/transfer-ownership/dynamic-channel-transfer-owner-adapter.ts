import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-component";
import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/premium/transfer-ownership/dynamic-channel-transfer-owner-button";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-channel-adapter-exu-base";

import { DynamicChannelVoteManager } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

type DefaultInteraction = UIDefaultUserSelectMenuChannelVoiceInteraction | UIDefaultButtonChannelVoiceInteraction;

interface AcceptedInteraction {
    selectedUserId: string;
    timeout: NodeJS.Timeout;
}

const ACCEPTED_INTERACTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export class DynamicChannelTransferOwnerAdapter extends DynamicChannelAdapterExuBase<DefaultInteraction> {
    private static acceptedInteraction: Map<string, AcceptedInteraction> = new Map<string, AcceptedInteraction>();

    public static getName() {
        return "Vertix/UI-V2/DynamicChannelTransferOwnerAdapter";
    }

    public static getComponent() {
        return DynamicChannelTransferOwnerComponent;
    }

    public static getExcludedElements() {
        return [ DynamicChannelTransferOwnerButton ];
    }

    protected static getExecutionSteps() {
        return {
            default: {},
            "Vertix/UI-V2/DynamicChannelTransferOwnerSelectUser": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelTransferOwnerEmbedGroup",
                elementsGroup: "Vertix/UI-V2/DynamicChannelTransferOwnerUserMenuGroup"
            },
            "Vertix/UI-V2/DynamicChannelTransferOwnerUserSelected": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelTransferOwnerUserSelectedEmbedGroup",
                elementsGroup: "VertixBot/UI-General/YesNoElementsGroup"
            },
            "Vertix/UI-V2/DynamicChannelTransferOwnerSuccess": {
                embedsGroup: "Vertix/UI-V2/DynamicChannelTransferOwnerTransferredEmbedGroup"
            },

            "Vertix/UI-V2/DynamicChannelTransferDisabledByClaim": {
                embedsGroup: "VertixBot/UI-General/DisabledWhileClaimEmbedGroup"
            },

            "Vertix/UI-V2/DynamicChannelTransferError": {
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            }
        };
    }

    protected shouldDeletePreviousReply(): boolean {
        return true;
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager?: UIArgs ) {
        switch ( this.getCurrentExecutionStep()?.name ) {
            case "Vertix/UI-V2/DynamicChannelTransferOwnerUserSelected":
                return {
                    userDisplayName: argsFromManager?.userDisplayName
                };
        }

        return {};
    }

    protected onEntityMap() {
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelTransferOwnerButton",
            this.onTransferOwnerButtonClicked
        );

        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "Vertix/UI-V2/DynamicChannelTransferOwnerUserMenu",
            this.onTransferOwnerUserSelected
        );

        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-General/YesButton",
            this.onYesButtonClicked
        );

        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-General/NoButton",
            this.onNoButtonClicked
        );
    }

    private async onTransferOwnerButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        // if ( ! await TopGGManager.$.isVoted( interaction.user.id ) ) {
        //     await TopGGManager.$.sendVoteEmbed( interaction );
        //     return;
        // }

        await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelTransferOwnerSelectUser" );
    }

    private async onTransferOwnerUserSelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( !target ) {
            await interaction.deferUpdate().catch( () => {} );
            return;
        }

        await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelTransferOwnerUserSelected", {
            userDisplayName: target.displayName
        } );

        const acceptedInteraction = DynamicChannelTransferOwnerAdapter.acceptedInteraction.get(
            interaction.channel.id + interaction.user.id
        );

        if ( acceptedInteraction ) {
            clearTimeout( acceptedInteraction.timeout );

            DynamicChannelTransferOwnerAdapter.acceptedInteraction.delete( interaction.channel.id + interaction.user.id );
        }

        const timeoutId = setTimeout( () => {
            interaction.deleteReply().catch( () => {} );

            DynamicChannelTransferOwnerAdapter.acceptedInteraction.delete( interaction.channel.id + interaction.user.id );
        }, ACCEPTED_INTERACTION_TIMEOUT );

        DynamicChannelTransferOwnerAdapter.acceptedInteraction.set( interaction.channel.id + interaction.user.id, {
            selectedUserId: targetId,
            timeout: timeoutId
        } );
    }

    private async onYesButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        // Defer the interaction immediately unless it's already deferred
        if ( !interaction.deferred && !interaction.replied ) {
            try {
                await interaction.deferUpdate();
            } catch {
                return;
            }
        }

        const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

        if ( "active" === state ) {
            await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelTransferDisabledByClaim" );
            return;
        }

        const acceptedInteraction = DynamicChannelTransferOwnerAdapter.acceptedInteraction.get(
            interaction.channel.id + interaction.user.id
        );

        this.clearAcceptedInteraction( interaction );

        if ( !acceptedInteraction ) {
            await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelTransferError" );
            return;
        }

        const target = interaction.guild.members.cache.get( acceptedInteraction.selectedUserId );

        if ( !target ) {
            await this.ephemeralWithStep( interaction, "Vertix/UI-V2/DynamicChannelTransferError" );
            return;
        }

        await this.dynamicChannelService.editChannelOwner(
            target.id,
            interaction.user.id,
            interaction.channel,
            "transfer"
        );

        // Since we've already deferred the update, we should use editReply instead
        try {
            await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelTransferOwnerSuccess" );
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

    private async onNoButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        // Defer the interaction immediately unless it's already deferred
        if ( !interaction.deferred && !interaction.replied ) {
            try {
                await interaction.deferUpdate();
            } catch {
                return;
            }
        }

        this.clearAcceptedInteraction( interaction );

        await this.deleteRelatedEphemeralInteractionsInternal(
            interaction,
            "Vertix/UI-V2/DynamicChannelAdapter:Vertix/UI-V2/DynamicChannelTransferOwnerButton",
            1
        );

        //await this.editReplyWithStep( interaction, "Vertix/UI-V2/DynamicChannelTransferOwnerSelectUser" );
    }

    private clearAcceptedInteraction( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const acceptedInteraction = DynamicChannelTransferOwnerAdapter.acceptedInteraction.get(
            interaction.channel.id + interaction.user.id
        );

        if ( acceptedInteraction ) {
            clearTimeout( acceptedInteraction.timeout );

            DynamicChannelTransferOwnerAdapter.acceptedInteraction.delete( interaction.channel.id + interaction.user.id );
        }
    }
}
