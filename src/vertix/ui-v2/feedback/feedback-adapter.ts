import { ModalSubmitInteraction } from "discord.js";

import { UIAdapterBase } from "@vertix/ui-v2/_base/ui-adapter-base";
import { FeedbackComponent } from "@vertix/ui-v2/feedback/feedback-component";

import { DirectMessageManager } from "@vertix/managers/direct-message-manager";

import { VERTIX_DEFAULT_SURVEY_COLLECTOR_ID } from "@vertix/definitions/app";

export class FeedbackAdapter extends UIAdapterBase<any, any> {
    public static getName() {
        return "Vertix/UI-V2/FeedbackAdapter";
    }

    public static getComponent() {
        return FeedbackComponent;
    }

    protected getReplyArgs() {
        return {};
    }

    protected onEntityMap() {
        this.bindModalWithButton(
            "Vertix/UI-V2/FeedbackReportButton",
            "Vertix/UI-V2/FeedbackReportModal",
            this.onReportModalSubmitted
        );

        this.bindModalWithButton(
            "Vertix/UI-V2/FeedbackSuggestionButton",
            "Vertix/UI-V2/FeedbackModal",
            this.onSuggestionModalSubmitted
        );

        this.bindModalWithButton(
            "Vertix/UI-V2/FeedbackInviteDeveloperButton",
            "Vertix/UI-V2/FeedbackInviteDeveloperModal",
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
        const inviteLink = interaction.fields.getTextInputValue( "Vertix/UI-V2/FeedbackAdapter:Vertix/UI-V2/FeedbackInputUrl" ),
            tagName = interaction.user.tag,
            guildName = interaction.guild?.name ?? "DM";

        await DirectMessageManager.$.sendToUser( VERTIX_DEFAULT_SURVEY_COLLECTOR_ID, {
            content: `Name: **${ tagName }**\n` +
                `GuildOrDM: **${ guildName }**\n` +
                `Invite link: ${ inviteLink }`
        } );

        await interaction.reply( {
            content: "Thank you for your invitation! We will contact you as soon as possible.",
        } );
    }

    private async informCollector( interaction: ModalSubmitInteraction<"cached">, type: "issue" | "suggestion" ) {
        const tagName = interaction.user.tag,
            title = interaction.fields.getTextInputValue( "Vertix/UI-V2/FeedbackAdapter:Vertix/UI-V2/FeedbackInputTitle" ),
            description = interaction.fields.getTextInputValue( "Vertix/UI-V2/FeedbackAdapter:Vertix/UI-V2/FeedbackInputDescription" ),
            guildName = interaction.guild?.name ?? "DM";

        await DirectMessageManager.$.sendToUser( VERTIX_DEFAULT_SURVEY_COLLECTOR_ID, {
            content: `Type: **${ type }**\n` +
                `Name: **${ tagName }**\n` +
                `GuildOrDM: **${ guildName }**\n` +
                `Title: **${ title }**\n` +
                `Description: ${ description }`
        } );
    }
}
