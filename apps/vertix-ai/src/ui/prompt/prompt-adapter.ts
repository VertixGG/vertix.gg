import { AttachmentBuilder, ChannelType } from "discord.js";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";
import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import { AIGuildDataManager } from "@vertix.gg/ai/src/managers/ai-guild-data-manager";
import { PromptUploadManager } from "@vertix.gg/ai/src/managers/prompt-upload-manager";

import { PromptComponent } from "@vertix.gg/ai/src/ui/prompt/prompt-component";

import { canManageAISettings, MANAGE_AI_SETTINGS_DENIED_MESSAGE } from "@vertix.gg/ai/src/utils/permission-utils";

import type { BaseGuildTextChannel } from "discord.js";
import type { UIDefaultButtonChannelTextInteraction } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { IAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

const PREVIEW_MAX_LENGTH = 400;

type PromptArgs = {
    source: string;
    length: string;
    preview: string;
    state: string;
    hasCustomPrompt: boolean;
};

type PromptInteractions = UIDefaultButtonChannelTextInteraction;

type PromptContext = IAdapterContext<PromptInteractions, PromptArgs>;

const PromptAdapter = new AdapterBuilderBase<
    BaseGuildTextChannel,
    PromptInteractions,
    typeof UIAdapterBase<BaseGuildTextChannel, PromptInteractions>,
    PromptArgs,
    PromptContext
>( "VertixAI/UI/PromptAdapter", UIAdapterBase )
    .setComponent( PromptComponent )
    .setChannelTypes( [ ChannelType.GuildText ] )
    .getStartArgs( async( _context, channel ) => {
        return await buildArgs( channel.guildId );
    } )
    .getEditMessageArgs( async( _context, message ) => {
        return await buildArgs( message?.guildId ?? "" );
    } )
    .getReplyArgs( async( _context, interaction ) => {
        return await buildArgs( interaction.guildId ?? "" );
    } )
    .onEntityMap( async( { bindButton } ) => {
        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixAI/UI/PromptDownloadButton",
            async( context, interaction ) => {
                await onDownloadClicked( context, interaction );
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixAI/UI/PromptUploadButton",
            async( context, interaction ) => {
                await onUploadClicked( context, interaction );
            }
        );

        bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixAI/UI/PromptResetButton",
            async( context, interaction ) => {
                await onResetClicked( context, interaction );
            }
        );
    } )
    .build();

async function buildArgs( guildId: string ): Promise<PromptArgs> {
    if ( !guildId.length ) {
        return {
            source: "Unavailable",
            length: "0",
            preview: "",
            state: "This panel only works inside a server.",
            hasCustomPrompt: false
        };
    }

    const prompt = await AIGuildDataManager.$.getSystemPrompt( guildId );
    const hasCustomPrompt = await AIGuildDataManager.$.hasCustomSystemPrompt( guildId );

    const preview = prompt.length > PREVIEW_MAX_LENGTH
        ? `${ prompt.slice( 0, PREVIEW_MAX_LENGTH ) }...`
        : prompt;

    return {
        source: hasCustomPrompt ? "Custom (set for this server)" : "Default (not customised)",
        length: String( prompt.length ),
        preview,
        state: "Press **Download** to get the file, edit it, then press **Upload**.",
        hasCustomPrompt
    };
}

async function onDownloadClicked( _context: PromptContext, interaction: UIDefaultButtonChannelTextInteraction ) {
    if ( !canManageAISettings( interaction ) ) {
        await interaction.reply( { content: MANAGE_AI_SETTINGS_DENIED_MESSAGE, ephemeral: true } );

        return;
    }

    const prompt = await AIGuildDataManager.$.getSystemPrompt( interaction.guildId );

    const attachment = new AttachmentBuilder( Buffer.from( prompt, "utf-8" ), {
        name: `vertix-ai-prompt-${ interaction.guildId }.md`
    } );

    await interaction.reply( {
        content: "Here is the current prompt. Edit it, then press **Upload** and send the file back.",
        files: [ attachment ],
        ephemeral: true
    } );
}

async function onUploadClicked( _context: PromptContext, interaction: UIDefaultButtonChannelTextInteraction ) {
    if ( !canManageAISettings( interaction ) ) {
        await interaction.reply( { content: MANAGE_AI_SETTINGS_DENIED_MESSAGE, ephemeral: true } );

        return;
    }

    const windowMs = PromptUploadManager.$.arm( interaction.guildId, interaction.user.id, interaction.channelId );

    await interaction.reply( {
        content:
            `Send your edited file in this channel within **${ Math.round( windowMs / 60000 ) } minutes**.\n` +
            "Only the next file you post here will be used.",
        ephemeral: true
    } );
}

async function onResetClicked( context: PromptContext, interaction: UIDefaultButtonChannelTextInteraction ) {
    if ( !canManageAISettings( interaction ) ) {
        await interaction.reply( { content: MANAGE_AI_SETTINGS_DENIED_MESSAGE, ephemeral: true } );

        return;
    }

    await AIGuildDataManager.$.setSystemPrompt( interaction.guildId, null );

    await context.editReply( interaction, await buildArgs( interaction.guildId ) );
}

export { PromptAdapter };
