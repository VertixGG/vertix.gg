import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";
import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { FeedbackComponent } from "@vertix.gg/bot/src/ui/general/feedback/feedback-component";

import { VERTIX_DEFAULT_SURVEY_COLLECTOR_ID } from "@vertix.gg/bot/src/definitions/app";

import type DirectMessageService from "@vertix.gg/bot/src/services/direct-message-service";

import type { UIDefaultModalChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { ModalSubmitInteraction, BaseGuildTextChannel } from "discord.js";

type FeedbackArgs = UIArgs;
type FeedbackContext = IAdapterContext<UIDefaultModalChannelTextInteraction, FeedbackArgs>;

const FLOW_NAME = "VertixBot/UI-General/FeedbackFlow";
const FLOW_STATE_DEFAULT = `${ FLOW_NAME }/States/Default`;

const FeedbackAdapter = new AdapterBuilderBase<
    BaseGuildTextChannel,
    UIDefaultModalChannelTextInteraction,
        typeof UIAdapterBase<BaseGuildTextChannel, UIDefaultModalChannelTextInteraction>,
        FeedbackArgs,
        FeedbackContext
>( "VertixBot/UI-General/FeedbackAdapter", UIAdapterBase )
    .setComponent( FeedbackComponent )
    .getReplyArgs( async() => ( {} ) )
    .disableMiddleware()
    .onEntityMap( async( { bindModalWithButton } ) => {
        bindModalWithButton(
            "VertixBot/UI-General/FeedbackReportButton",
            "VertixBot/UI-General/FeedbackReportModal",
            async( context, interaction ) => {
                await informCollector( context, interaction, "issue" );

                await interaction.reply( {
                    content:
                        "Thank you for your report. We appreciate your feedback and are committed to resolving the issue as quickly as possible.\nFor updates and further information, please visit our community server.\n",
                    ephemeral: true
                } );
            },
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/SubmitIssueReport`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );

        bindModalWithButton(
            "VertixBot/UI-General/FeedbackSuggestionButton",
            "VertixBot/UI-General/FeedbackModal",
            async( context, interaction ) => {
                await informCollector( context, interaction, "suggestion" );

                await interaction.reply( {
                    content:
                        "Thank you for your suggestion! We greatly appreciate your input and value your ideas.\nYour feedback helps us improve and enhance our services.\nWe will carefully consider your suggestion and take it into account for future updates.\nThank you for being a valuable member of our community!",
                    ephemeral: true
                } );
            },
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/SubmitSuggestion`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );

        bindModalWithButton(
            "VertixBot/UI-General/FeedbackInviteDeveloperButton",
            "VertixBot/UI-General/FeedbackInviteDeveloperModal",
            async( context, interaction ) => {
                const dmService = ServiceLocator.$.get<DirectMessageService>( "VertixBot/Services/DirectMessage" );

                const inviteLink = interaction.fields.getTextInputValue(
                    context.customIdStrategy.generateId(
                        "VertixBot/UI-General/FeedbackAdapter:VertixBot/UI-General/FeedbackInputUrl"
                    )
                );

                const tagName = interaction.user.tag,
                    guildName = interaction.guild?.name ?? "DM";

                await dmService.sendToUser( VERTIX_DEFAULT_SURVEY_COLLECTOR_ID, {
                    content: `Name: **${ tagName }**\n` + `GuildOrDM: **${ guildName }**\n` + `Invite link: ${ inviteLink }`
                } );

                await interaction.reply( {
                    content: "Thank you for your invitation! We will contact you as soon as possible."
                } );
            },
            {
                flowTriggers: [
                    {
                        flowName: FLOW_NAME,
                        transition: `${ FLOW_NAME }/Transitions/SubmitInvite`,
                        navigation: {
                            targetState: FLOW_STATE_DEFAULT,
                            executionStep: "default"
                        }
                    }
                ]
            }
        );
    } )
    .build();

async function informCollector(
    context: FeedbackContext,
    interaction: ModalSubmitInteraction<"cached">,
    type: "issue" | "suggestion"
) {
    const dmService = ServiceLocator.$.get<DirectMessageService>( "VertixBot/Services/DirectMessage" );

    const feedbackInputTitleId = context.customIdStrategy.generateId(
            "VertixBot/UI-General/FeedbackAdapter:VertixBot/UI-General/FeedbackInputTitle"
        ),
        feedbackInputDescriptionId = context.customIdStrategy.generateId(
            "VertixBot/UI-General/FeedbackAdapter:VertixBot/UI-General/FeedbackInputDescription"
        );

    const tagName = interaction.user.tag,
        title = interaction.fields.getTextInputValue( feedbackInputTitleId ),
        description = interaction.fields.getTextInputValue( feedbackInputDescriptionId ),
        guildName = interaction.guild?.name ?? "DM";

    await dmService.sendToUser( VERTIX_DEFAULT_SURVEY_COLLECTOR_ID, {
        content:
            `Type: **${ type }**\n` +
            `Name: **${ tagName }**\n` +
            `GuildOrDM: **${ guildName }**\n` +
            `Title: **${ title }**\n` +
            `Description: ${ description }`
    } );
}

export { FeedbackAdapter };
