import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";
import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { ChannelType } from "discord.js";

import { AIAgentComponent } from "@vertix.gg/bot/src/ui/general/ai-agent/ai-agent-component";

import type { BaseGuildTextChannel, ModalSubmitInteraction } from "discord.js";
import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { UIService } from "@vertix.gg/gui/src/ui-service";

type AIAgentArgs = {
    selectedChannelId: string | null;
    draftContent: string | null;
};

type AIAgentInteractions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultModalChannelTextInteraction;

type AIAgentContext = IAdapterContext<AIAgentInteractions, AIAgentArgs>;

const AIAgentAdapter = new AdapterBuilderBase<
    BaseGuildTextChannel,
    AIAgentInteractions,
    typeof UIAdapterBase<BaseGuildTextChannel, AIAgentInteractions>,
    AIAgentArgs,
    AIAgentContext
>( "VertixBot/UI-General/AIAgentAdapter", UIAdapterBase )
    .setComponent( AIAgentComponent )
    .setChannelTypes( [ ChannelType.GuildText ] )
    .getStartArgs( async( _context, channel, argsFromManager ) => {
        const selectedChannelId = typeof argsFromManager?.selectedChannelId === "string" && argsFromManager.selectedChannelId.length
            ? argsFromManager.selectedChannelId
            : channel.id;

        const draftContent = typeof argsFromManager?.draftContent === "string" ? argsFromManager.draftContent : null;

        return { selectedChannelId, draftContent };
    } )
    .getEditMessageArgs( async( context, message, argsFromManager ) => {
        const currentArgs = message ? context.getArgs( message ) : {};

        const selectedChannelId = typeof argsFromManager?.selectedChannelId === "string"
            ? argsFromManager.selectedChannelId
            : typeof currentArgs?.selectedChannelId === "string"
                ? currentArgs.selectedChannelId
                : null;

        const draftContent = typeof argsFromManager?.draftContent === "string"
            ? argsFromManager.draftContent
            : typeof currentArgs?.draftContent === "string"
                ? currentArgs.draftContent
                : null;

        return { selectedChannelId, draftContent };
    } )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        const currentArgs = context.getArgs( interaction );

        const selectedChannelId = typeof argsFromManager?.selectedChannelId === "string"
            ? argsFromManager.selectedChannelId
            : typeof currentArgs?.selectedChannelId === "string"
                ? currentArgs.selectedChannelId
                : null;

        const draftContent = typeof argsFromManager?.draftContent === "string"
            ? argsFromManager.draftContent
            : typeof currentArgs?.draftContent === "string"
                ? currentArgs.draftContent
                : null;

        return { selectedChannelId, draftContent };
    } )
    .onEntityMap( async( { bindSelectMenu, bindModalWithButton, bindButton } ) => {
        bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/AIAgentChannelSelectMenu",
            async( context, interaction ) => {
                await onChannelSelected( context, interaction );
            }
        );

        bindModalWithButton(
            "VertixBot/UI-General/AIAgentSendButton",
            "VertixBot/UI-General/AIAgentSendModal",
            async( context, interaction ) => {
                await onSendModalSubmitted( context, interaction );
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/AIAgentConfirmSendButton",
            async( context, interaction ) => {
                await onConfirmSendClicked( context, interaction );
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/AIAgentCancelDraftButton",
            async( context, interaction ) => {
                await onCancelDraftClicked( context, interaction );
            }
        );
    } )
    .build();

async function onChannelSelected(
    context: AIAgentContext,
    interaction: UIDefaultStringSelectMenuChannelTextInteraction
) {
    const selectedChannelId = interaction.values.at( 0 ) ?? null;

    const currentArgs = context.getArgs( interaction );
    const draftContent = typeof currentArgs.draftContent === "string" ? currentArgs.draftContent : null;

    await context.editReply( interaction, { selectedChannelId, draftContent } );
}

async function onSendModalSubmitted(
    context: AIAgentContext,
    interaction: ModalSubmitInteraction<"cached">
) {
    const args = context.getArgs( interaction );
    const selectedChannelId = typeof args.selectedChannelId === "string" ? args.selectedChannelId : null;

    if ( !selectedChannelId ) {
        await interaction.reply( {
            content: "Select a channel first.",
            ephemeral: true
        } );
        return;
    }

    const inputId = context.customIdStrategy.generateId(
        "VertixBot/UI-General/AIAgentAdapter:VertixBot/UI-General/AIAgentMessageInput"
    );

    const content = interaction.fields.getTextInputValue( inputId ).trim();

    if ( !content.length ) {
        await interaction.reply( {
            content: "Message is empty.",
            ephemeral: true
        } );
        return;
    }

    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
    const adapter = uiService.get( "VertixBot/UI-General/AIAgentAdapter", true );

    if ( adapter && interaction.message ) {
        await adapter.editMessage( interaction.message, {
            selectedChannelId,
            draftContent: content
        } );
    }

    await interaction.reply( {
        content: `Send to <#${ selectedChannelId }>:\n${ content.length > 300 ? `${ content.slice( 0, 300 ) }...` : content }`,
        ephemeral: true
    } );
}

async function onConfirmSendClicked(
    context: AIAgentContext,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );

    const selectedChannelId = typeof args.selectedChannelId === "string" ? args.selectedChannelId : null;
    const draftContent = typeof args.draftContent === "string" ? args.draftContent.trim() : "";

    if ( !selectedChannelId ) {
        await interaction.reply( { content: "Select a channel first.", ephemeral: true } );
        return;
    }

    if ( !draftContent.length ) {
        await interaction.reply( { content: "Nothing to send.", ephemeral: true } );
        return;
    }

    const channel = await interaction.guild?.channels.fetch( selectedChannelId ).catch( () => null );

    if ( !channel || !channel.isTextBased() || !channel.isSendable() ) {
        await interaction.reply( { content: "Invalid channel.", ephemeral: true } );
        return;
    }

    await channel.send( { content: draftContent } );

    await context.editReply( interaction, {
        selectedChannelId,
        draftContent: null
    } );

    await interaction.followUp( { content: `Sent to <#${ selectedChannelId }>.`, ephemeral: true } );
}

async function onCancelDraftClicked(
    context: AIAgentContext,
    interaction: UIDefaultButtonChannelTextInteraction
) {
    const args = context.getArgs( interaction );
    const selectedChannelId = typeof args.selectedChannelId === "string" ? args.selectedChannelId : null;

    await context.editReply( interaction, {
        selectedChannelId,
        draftContent: null
    } );

    await interaction.followUp( { content: "Cancelled.", ephemeral: true } );
}

export { AIAgentAdapter };
