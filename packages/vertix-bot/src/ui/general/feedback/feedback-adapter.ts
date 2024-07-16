import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { FeedbackComponent } from "@vertix.gg/bot/src/ui/general/feedback/feedback-component";

import { VERTIX_DEFAULT_SURVEY_COLLECTOR_ID } from "@vertix.gg/bot/src/definitions/app";

import type DirectMessageService from "@vertix.gg/bot/src/services/direct-message-service";

import type { ModalSubmitInteraction } from "discord.js";

export class FeedbackAdapter extends UIAdapterBase<any, any> {
    public static getName() {
        return "VertixBot/UI-General/FeedbackAdapter";
    }

    public static getComponent() {
        return FeedbackComponent;
    }

    public static isMultiLanguage() {
        return false;
    }

    protected getReplyArgs() {
        return {};
    }

    protected onEntityMap() {
        this.bindModalWithButton(
            "VertixBot/UI-General/FeedbackReportButton",
            "VertixBot/UI-General/FeedbackReportModal",
            this.onReportModalSubmitted
        );

        this.bindModalWithButton(
            "VertixBot/UI-General/FeedbackSuggestionButton",
            "VertixBot/UI-General/FeedbackModal",
            this.onSuggestionModalSubmitted
        );

        this.bindModalWithButton(
            "VertixBot/UI-General/FeedbackInviteDeveloperButton",
            "VertixBot/UI-General/FeedbackInviteDeveloperModal",
            this.onInviteDeveloperModalSubmitted
        );
    }

    protected shouldDisableMiddleware() {
        return true;
    }

    private async onReportModalSubmitted( interaction: ModalSubmitInteraction<"cached"> ) {
        await this.informCollector( interaction, "issue" );

        await interaction.reply( {
            content: "Thank you for your report. We appreciate your feedback and are committed to resolving the issue as quickly as possible.\nFor updates and further information, please visit our community server.\n",
            ephemeral: true,
        } );
    }

    private async onSuggestionModalSubmitted( interaction: ModalSubmitInteraction<"cached"> ) {
        await this.informCollector( interaction, "suggestion" );

        await interaction.reply( {
            content: "Thank you for your suggestion! We greatly appreciate your input and value your ideas.\nYour feedback helps us improve and enhance our services.\nWe will carefully consider your suggestion and take it into account for future updates.\nThank you for being a valuable member of our community!",
            ephemeral: true,
        } );
    }

    private async onInviteDeveloperModalSubmitted( interaction: ModalSubmitInteraction<"cached"> ) {
        const dmService = ServiceLocator.$.get<DirectMessageService>( "VertixBot/Services/DirectMessage" );

        const inviteLink = interaction.fields.getTextInputValue(
        this.customIdStrategy.generateId( "VertixBot/UI-General/FeedbackAdapter:VertixBot/UI-General/FeedbackInputUrl" )
        );

        const tagName = interaction.user.tag,
            guildName = interaction.guild?.name ?? "DM";

        await dmService.sendToUser( VERTIX_DEFAULT_SURVEY_COLLECTOR_ID, {
            content: `Name: **${ tagName }**\n` +
                `GuildOrDM: **${ guildName }**\n` +
                `Invite link: ${ inviteLink }`
        } );

        await interaction.reply( {
            content: "Thank you for your invitation! We will contact you as soon as possible.",
        } );
    }

    private async informCollector( interaction: ModalSubmitInteraction<"cached">, type: "issue" | "suggestion" ) {
        const dmService = ServiceLocator.$.get<DirectMessageService>( "VertixBot/Services/DirectMessage" );

        const feedbackInputTitleId = this.customIdStrategy
                .generateId( "VertixBot/UI-General/FeedbackAdapter:VertixBot/UI-General/FeedbackInputTitle" ),
            feedbackInputDescriptionId = this.customIdStrategy
                .generateId( "VertixBot/UI-General/FeedbackAdapter:VertixBot/UI-General/FeedbackInputDescription" );

        const tagName = interaction.user.tag,
            title = interaction.fields.getTextInputValue( feedbackInputTitleId ),
            description = interaction.fields.getTextInputValue( feedbackInputDescriptionId ),
            guildName = interaction.guild?.name ?? "DM";

        await dmService.sendToUser( VERTIX_DEFAULT_SURVEY_COLLECTOR_ID, {
            content: `Type: **${ type }**\n` +
                `Name: **${ tagName }**\n` +
                `GuildOrDM: **${ guildName }**\n` +
                `Title: **${ title }**\n` +
                `Description: ${ description }`
        } );
    }
}
