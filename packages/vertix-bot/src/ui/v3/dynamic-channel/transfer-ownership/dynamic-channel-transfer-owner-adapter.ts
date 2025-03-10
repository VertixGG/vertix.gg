import { DynamicChannelTransferOwnerComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-component";
import { DynamicChannelTransferOwnerButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/transfer-ownership/dynamic-channel-transfer-owner-button";

import { DynamicChannelAdapterExuBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-exu-base";

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

    public static getName () {
        return "Vertix/UI-V3/DynamicChannelTransferOwnerAdapter";
    }

    public static getComponent () {
        return DynamicChannelTransferOwnerComponent;
    }

    public static getExcludedElements () {
        return [ DynamicChannelTransferOwnerButton ];
    }

    protected static getExecutionSteps () {
        return {
            default: {},
            "Vertix/UI-V3/DynamicChannelTransferOwnerSelectUser": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelTransferOwnerEmbedGroup",
                elementsGroup: "Vertix/UI-V3/DynamicChannelTransferOwnerUserMenuGroup"
            },
            "Vertix/UI-V3/DynamicChannelTransferOwnerUserSelected": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelTransferOwnerUserSelectedEmbedGroup",
                elementsGroup: "VertixBot/UI-General/YesNoElementsGroup"
            },
            "Vertix/UI-V3/DynamicChannelTransferOwnerSuccess": {
                embedsGroup: "Vertix/UI-V3/DynamicChannelTransferOwnerTransferredEmbedGroup"
            },

            "Vertix/UI-V3/DynamicChannelTransferDisabledByClaim": {
                embedsGroup: "VertixBot/UI-General/DisabledWhileClaimEmbedGroup"
            },

            "Vertix/UI-V3/DynamicChannelTransferError": {
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            }
        };
    }

    protected getReplyArgs ( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager?: UIArgs ) {
        switch ( this.getCurrentExecutionStep()?.name ) {
            case "Vertix/UI-V3/DynamicChannelTransferOwnerUserSelected":
                return {
                    userDisplayName: argsFromManager?.userDisplayName
                };
        }

        return {};
    }

    protected onEntityMap () {
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "Vertix/UI-V3/DynamicChannelTransferOwnerButton",
            this.onTransferOwnerButtonClicked
        );

        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "Vertix/UI-V3/DynamicChannelTransferOwnerUserMenu",
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

    private async onTransferOwnerButtonClicked ( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        // if ( ! await TopGGManager.$.isVoted( interaction.user.id ) ) {
        //     await TopGGManager.$.sendVoteEmbed( interaction );
        //     return;
        // }

        await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelTransferOwnerSelectUser" );
    }

    private async onTransferOwnerUserSelected ( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( !target ) {
            await interaction.deferUpdate().catch( () => {} );
            return;
        }

        await this.editReplyWithStep( interaction, "Vertix/UI-V3/DynamicChannelTransferOwnerUserSelected", {
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

    private async onYesButtonClicked ( interaction: UIDefaultButtonChannelVoiceInteraction ) {
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
            await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelTransferDisabledByClaim" );
            return;
        }

        const acceptedInteraction = DynamicChannelTransferOwnerAdapter.acceptedInteraction.get(
            interaction.channel.id + interaction.user.id
        );

        this.clearAcceptedInteraction( interaction );

        if ( !acceptedInteraction ) {
            await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelTransferError" );
            return;
        }

        const target = interaction.guild.members.cache.get( acceptedInteraction.selectedUserId );

        if ( !target ) {
            await this.ephemeralWithStep( interaction, "Vertix/UI-V3/DynamicChannelTransferError" );
            return;
        }

        await this.dynamicChannelService.editChannelOwner(
            target.id,
            interaction.user.id,
            interaction.channel,
            "transfer"
        );

        await this.editReplyWithStep( interaction, "Vertix/UI-V3/DynamicChannelTransferOwnerSuccess" );
    }

    private async onNoButtonClicked ( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        this.clearAcceptedInteraction( interaction );

        await this.deleteRelatedEphemeralInteractionsInternal(
            interaction,
            "Vertix/UI-V3/DynamicChannelAdapter:Vertix/UI-V3/DynamicChannelTransferOwnerButton",
            1
        );

        //await this.editReplyWithStep( interaction, "Vertix/UI-V3/DynamicChannelTransferOwnerSelectUser" );
    }

    private clearAcceptedInteraction ( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        const acceptedInteraction = DynamicChannelTransferOwnerAdapter.acceptedInteraction.get(
            interaction.channel.id + interaction.user.id
        );

        if ( acceptedInteraction ) {
            clearTimeout( acceptedInteraction.timeout );

            DynamicChannelTransferOwnerAdapter.acceptedInteraction.delete( interaction.channel.id + interaction.user.id );
        }
    }
}
