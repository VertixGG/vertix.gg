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

    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelTransferOwnerAdapter";
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
        };
    }

    protected getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager?: UIArgs ) {
        switch ( this.getCurrentExecutionStep()?.name ) {
            case "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected":
                return {
                    userDisplayName: argsFromManager?.userDisplayName
                };
        }

        return {};
    }

    protected onEntityMap() {
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
            this.onTransferOwnerButtonClicked
        );

        this.bindUserSelectMenu<UIDefaultUserSelectMenuChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenu",
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

        await this.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferOwnerSelectUser" );
    }

    private async onTransferOwnerUserSelected( interaction: UIDefaultUserSelectMenuChannelVoiceInteraction ) {
        const targetId = interaction.values.at( 0 ) as string,
            target = interaction.guild.members.cache.get( targetId );

        if ( !target ) {
            await this.updateInteractionDefer( interaction );
            return;
        }

        await this.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelected", {
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
        const state = DynamicChannelVoteManager.$.getState( interaction.channelId );

        if ( "active" === state ) {
            await this.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferDisabledByClaim" );
            return;
        }

        const acceptedInteraction = DynamicChannelTransferOwnerAdapter.acceptedInteraction.get(
            interaction.channel.id + interaction.user.id
        );

        this.clearAcceptedInteraction( interaction );

        if ( !acceptedInteraction ) {
            await this.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferError" );
            return;
        }

        const target = interaction.guild.members.cache.get( acceptedInteraction.selectedUserId );

        if ( !target ) {
            await this.ephemeralWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferError" );
            return;
        }

        await this.dynamicChannelService.editChannelOwner(
            target.id,
            interaction.user.id,
            interaction.channel,
            "transfer"
        );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferOwnerSuccess" );
    }

    private async onNoButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        this.clearAcceptedInteraction( interaction );

        await this.deleteRelatedEphemeralInteractionsInternal(
            interaction,
            "VertixBot/UI-V3/DynamicChannelAdapter:VertixBot/UI-V3/DynamicChannelTransferOwnerButton",
            1
        );

        //await this.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelTransferOwnerSelectUser" );
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
