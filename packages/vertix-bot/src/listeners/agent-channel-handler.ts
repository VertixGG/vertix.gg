import { Events } from "discord.js";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";
import { isOpenAIConfigured, runAgentChat } from "@vertix.gg/bot/src/utils/agent-client";

import type { Client, Message } from "discord.js";
import type { AgentChatMessage } from "@vertix.gg/bot/src/utils/agent-client";

const TARGET_GUILD_ID = process.env.AI_CHAT_GUILD_ID;
const TARGET_CHANNEL_ID = process.env.AI_CHAT_CHANNEL_ID;
const HISTORY_LIMIT = Number( process.env.AI_CHAT_HISTORY_LIMIT || 20 );

const SYSTEM_PROMPT = "You are Vertix, a helpful Discord assistant. Use the recent channel conversation to answer the user. Be concise, cite context if needed, and avoid mentioning hidden implementation details.";

export function agentChannelHandler( client: Client ) {
    if ( !TARGET_GUILD_ID || !TARGET_CHANNEL_ID ) {
        GlobalLogger.$.log( agentChannelHandler, "AI chat channel is not configured; skipping handler." );
        return;
    }

    client.on( Events.MessageCreate, async( message ) => {
        try {
            if ( !isOpenAIConfigured() ) {
                return;
            }

            if ( message.author.bot ) {
                return;
            }

            if ( message.guildId !== TARGET_GUILD_ID || message.channelId !== TARGET_CHANNEL_ID ) {
                return;
            }

            const botId = client.user?.id;

            if ( !botId ) {
                return;
            }

            if ( !message.mentions.has( botId ) ) {
                return;
            }

            if ( !message.content?.trim()?.length && message.attachments.size === 0 ) {
                return;
            }

            await message.channel.sendTyping();

            const historyCollection = await message.channel.messages.fetch( {
                limit: HISTORY_LIMIT
            } );

            const sortedHistory = [ ...historyCollection.values() ]
                .sort( ( a, b ) => a.createdTimestamp - b.createdTimestamp )
                .filter( ( entry ) => entry.createdTimestamp <= message.createdTimestamp )
                .filter( ( entry ) => !entry.author.bot || entry.author.id === botId );

            const conversation: AgentChatMessage[] = [];

            sortedHistory.forEach( ( entry ) => {
                const payload = formatMessageForAgent( entry, botId );

                if ( payload ) {
                    conversation.push( payload );
                }
            } );

            const response = await runAgentChat( [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                ...conversation
            ], 0.65 );

            await message.reply( response );
        } catch ( error ) {
            GlobalLogger.$.error( agentChannelHandler, "Failed to process channel AI request", error );

            await message.reply( "I couldn't reach the AI service just now. Please try again shortly." );
        }
    } );
}

function formatMessageForAgent( message: Message<boolean>, botId?: string ): AgentChatMessage | null {
    const attachments = message.attachments.size
        ? ` [attachments: ${ [ ...message.attachments.values() ].map( ( file ) => file.name ?? file.url ).join( ", " ) }]`
        : "";

    const content = ( message.cleanContent || message.content || "" ).trim();
    const body = `${ content }${ attachments }`.trim();

    if ( !body ) {
        return null;
    }

    const displayName = message.member?.displayName || message.author.username;

    return {
        role: message.author.id === botId ? "assistant" : "user",
        content: `[${ displayName }] ${ body }`
    };
}
