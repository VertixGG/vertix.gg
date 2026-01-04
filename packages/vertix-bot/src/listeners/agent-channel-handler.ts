import { BaseGuildTextChannel, Events } from "discord.js";

import { GuildModel } from "@vertix.gg/base/src/models/guild-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";
import { runAgentChat } from "@vertix.gg/bot/src/utils/agent-client";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { Client, Message } from "discord.js";

const TARGET_GUILD_ID = process.env.AI_CHAT_GUILD_ID;
const TARGET_CHANNEL_ID = process.env.AI_CHAT_CHANNEL_ID;
const HISTORY_LIMIT = Number( process.env.AI_CHAT_HISTORY_LIMIT || 20 );

const SYSTEM_PROMPT = "You are Vertix, a helpful Discord assistant. You have full access to this repository and can answer complex questions about its codebase. Be concise, cite context if needed, and avoid mentioning hidden implementation details unless asked.";

const AI_START_COMMAND = "!ai-start";
const AI_STOP_COMMAND = "!ai-stop";
const AI_MESSAGE_COMMAND = "!ai-message";

let isAiSessionActive = false;
let sessionConversation: string[] = [];
let sessionQueue: Promise<void> = Promise.resolve();

export function agentChannelHandler( client: Client ) {
    if ( !TARGET_GUILD_ID || !TARGET_CHANNEL_ID ) {
        GlobalLogger.$.log( agentChannelHandler, "AI chat channel is not configured; skipping handler." );
        return;
    }

    client.on( Events.MessageCreate, async( message ) => {
        try {
            if ( message.author.bot ) {
                return;
            }

            if ( message.guildId !== TARGET_GUILD_ID || message.channelId !== TARGET_CHANNEL_ID ) {
                return;
            }

            if ( message.guildId ) {
                GuildModel.$.updateLastActive( message.guildId );
            }

            const botId = client.user?.id;

            if ( !botId ) {
                return;
            }

            const trimmedContent = message.content?.trim() ?? "";

            if ( trimmedContent === AI_START_COMMAND ) {
                isAiSessionActive = true;
                sessionConversation = [];

                await message.reply( "AI session started." );

                return;
            }

            if ( trimmedContent === AI_STOP_COMMAND ) {
                isAiSessionActive = false;
                sessionConversation = [];

                await message.reply( "AI session stopped." );

                return;
            }

            if ( trimmedContent === AI_MESSAGE_COMMAND ) {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                const adapter = uiService.get( "VertixBot/UI-General/AIAgentAdapter", true );

                if ( !adapter ) {
                    await message.reply( "AI message UI is not available." );
                    return;
                }

                const channel = await client.channels.fetch( message.channelId ).catch( () => null );

                if ( !channel || !( channel instanceof BaseGuildTextChannel ) || !channel.isSendable() ) {
                    await message.reply( "Invalid channel." );
                    return;
                }

                await adapter.send( channel, { selectedChannelId: message.channelId } );

                return;
            }

            if ( !isAiSessionActive ) {
                return;
            }

            if ( trimmedContent.startsWith( "!" ) ) {
                return;
            }

            if ( !message.content?.trim()?.length && message.attachments.size === 0 ) {
                return;
            }

            sessionQueue = sessionQueue
                .then( async() => {
                    const userLine = formatMessageForAgent( message, botId );

                    if ( !userLine ) {
                        return;
                    }

                    sessionConversation.push( userLine );

                    if ( sessionConversation.length > HISTORY_LIMIT ) {
                        sessionConversation = sessionConversation.slice( -HISTORY_LIMIT );
                    }

                    GlobalLogger.$.log( agentChannelHandler, `Processing message from ${ message.author.username } in ${ message.channelId }` );

                    await message.channel.sendTyping();

                    const fullPrompt = `${ SYSTEM_PROMPT }\n\nConversation:\n${ sessionConversation.join( "\n" ) }\n\nVertix:`;

                    const response = await runAgentChat( fullPrompt );

                    await message.reply( response );

                    const assistantName = client.user?.username ?? "Assistant";

                    sessionConversation.push( `Assistant (${ assistantName }): ${ response }` );

                    if ( sessionConversation.length > HISTORY_LIMIT ) {
                        sessionConversation = sessionConversation.slice( -HISTORY_LIMIT );
                    }

                    GlobalLogger.$.log( agentChannelHandler, "Reply sent successfully." );
                } )
                .catch( ( error ) => {
                    GlobalLogger.$.error( agentChannelHandler, "Failed to process session Codex request", error );
                } );

            await sessionQueue;
        } catch( error ) {
            GlobalLogger.$.error( agentChannelHandler, "Failed to process channel Codex request", error );

            await message.reply( "I couldn't reach the Codex service just now. Please try again shortly." );
        }
    } );
}

function formatMessageForAgent( message: Message<boolean>, botId?: string ): string | null {
    const attachments = message.attachments.size
        ? ` [attachments: ${ [ ...message.attachments.values() ].map( ( file ) => file.name ?? file.url ).join( ", " ) }]`
        : "";

    const content = ( message.cleanContent || message.content || "" ).trim();
    const body = `${ content }${ attachments }`.trim();

    if ( !body ) {
        return null;
    }

    const displayName = message.member?.displayName || message.author.username;
    const role = message.author.id === botId ? "Assistant" : "User";

    return `${ role } (${ displayName }): ${ body }`;
}
