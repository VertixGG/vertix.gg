import { PermissionsBitField } from "discord.js";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import { AIGuildDataManager } from "@vertix.gg/ai/src/managers/ai-guild-data-manager";
import { PromptUploadManager } from "@vertix.gg/ai/src/managers/prompt-upload-manager";

import GlobalLogger from "@vertix.gg/ai/src/global-logger";

import type { Client, Message } from "discord.js";

const ACCEPTED_EXTENSIONS = [ ".md", ".txt" ];

/**
 * Consumes the file a user posts after pressing **Upload**.
 *
 * This exists because Discord modals cannot carry attachments - a file has to
 * arrive as a message, so the panel arms a window and this listener closes it.
 */
export function registerPromptUploadListener( client: Client ): void {
    client.on( "messageCreate", async( message ) => {
        await handleMessage( message ).catch( ( error ) => {
            GlobalLogger.$.error( registerPromptUploadListener, "Failed handling upload", error );
        } );
    } );
}

async function handleMessage( message: Message ): Promise<void> {
    if ( message.author.bot || !message.inGuild() || !message.attachments.size ) {
        return;
    }

    if ( !PromptUploadManager.$.isArmed( message.guildId, message.author.id, message.channelId ) ) {
        return;
    }

    // Re-checked here rather than trusted from the button press: permissions can
    // change between arming the window and the file arriving.
    if ( true !== message.member?.permissions.has( PermissionsBitField.Flags.ManageGuild ) ) {
        PromptUploadManager.$.disarm( message.guildId, message.author.id );

        return;
    }

    const attachment = message.attachments.first();

    if ( !attachment ) {
        return;
    }

    const name = attachment.name.toLowerCase();

    if ( !ACCEPTED_EXTENSIONS.some( ( extension ) => name.endsWith( extension ) ) ) {
        await message.reply( `Only ${ ACCEPTED_EXTENSIONS.join( " or " ) } files are accepted.` );

        return;
    }

    const maxBytes = AIConfig.$.getPromptMaxBytes();

    if ( attachment.size > maxBytes ) {
        await message.reply( `That file is ${ attachment.size } bytes; the limit is ${ maxBytes }.` );

        return;
    }

    const response = await fetch( attachment.url );

    if ( !response.ok ) {
        await message.reply( "Could not download that file from Discord. Try again." );

        return;
    }

    const content = ( await response.text() ).trim();

    if ( !content.length ) {
        await message.reply( "That file is empty - the prompt was left unchanged." );

        return;
    }

    PromptUploadManager.$.disarm( message.guildId, message.author.id );

    const change = await AIGuildDataManager.$.setSystemPrompt( message.guildId, content );

    await message.reply(
        `✅  Prompt updated - ${ change.previousPrompt?.length ?? 0 } → ${ content.length } characters.`
    );
}

export default registerPromptUploadListener;
