import { BaseGuildTextChannel, Events } from "discord.js";

import { GuildModel } from "@vertix.gg/base/src/models/guild-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";
import { guildLeaveBecauseNotInDatabase } from "@vertix.gg/bot/src/utils/guild";
import { runAgentChatWithLogs } from "@vertix.gg/bot/src/utils/agent-client";

import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { Client, Message, TextBasedChannel } from "discord.js";

const TARGET_GUILD_ID = process.env.AI_CHAT_GUILD_ID;
const TARGET_CHANNEL_ID = process.env.AI_CHAT_CHANNEL_ID;
const HISTORY_LIMIT = Number( process.env.AI_CHAT_HISTORY_LIMIT || 20 );

const SYSTEM_PROMPT = "You are Vertix, the Discord bot in this server. You can answer questions about this repository by exploring it with the local Codex CLI in read-only mode.\n\nIf the user asks what tools/commands you can use in Discord, list these:\n- !ai-start: starts an AI session and clears this channel\n- !ai-stop: stops the AI session\n- !ai-message: opens the AI message sender UI (draft -> preview -> confirm send)\n- During an active session, each reply includes a spoiler attachment named SPOILER_codex-*.log.txt with full Codex stdout/stderr\n\nDo not claim you lack Discord access or that you are only a chat model. Be concise.";

const AI_START_COMMAND = "!ai-start";
const AI_STOP_COMMAND = "!ai-stop";
const AI_MESSAGE_COMMAND = "!ai-message";

const DEFAULT_TYPING_INTERVAL_MS = 8000;

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

            const guildId = message.guildId;

            if ( guildId ) {
                void GuildModel.$.updateLastActive( guildId ).then( ( updated ) => {
                    if ( !updated ) {
                        void guildLeaveBecauseNotInDatabase( client, guildId );
                    }
                } );
            }

            const botId = client.user?.id;

            if ( !botId ) {
                return;
            }

            const trimmedContent = message.content?.trim() ?? "";

            if ( trimmedContent === AI_START_COMMAND ) {
                sessionQueue = sessionQueue
                    .then( async() => {
                        isAiSessionActive = true;
                        sessionConversation = [];

                        const channel = await client.channels.fetch( message.channelId ).catch( () => null );

                        if ( !channel || !( channel instanceof BaseGuildTextChannel ) || !channel.isSendable() ) {
                            await message.reply( "Invalid channel." );
                            return;
                        }

                        await clearTextChannelMessages( channel );

                        await channel.send( "AI session started." );
                    } )
                    .catch( ( error ) => {
                        GlobalLogger.$.error( agentChannelHandler, "Failed to start AI session", error );
                    } );

                await sessionQueue;

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

                    const stopTyping = startTypingHeartbeat( message.channel );

                    try {
                        const fullPrompt = `${ SYSTEM_PROMPT }\n\nConversation:\n${ sessionConversation.join( "\n" ) }\n\nVertix:`;

                        const { response, logs } = await runAgentChatWithLogs( fullPrompt );

                        const files = logs.length > 0
                            ? [ { attachment: logs, name: `SPOILER_codex-${ message.id }.log.txt` } ]
                            : [];

                        await message.reply( { content: response, files } );

                        const assistantName = client.user?.username ?? "Assistant";

                        sessionConversation.push( `Assistant (${ assistantName }): ${ response }` );

                        if ( sessionConversation.length > HISTORY_LIMIT ) {
                            sessionConversation = sessionConversation.slice( -HISTORY_LIMIT );
                        }

                        GlobalLogger.$.log( agentChannelHandler, "Reply sent successfully." );
                    } finally {
                        stopTyping();
                    }
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

async function clearTextChannelMessages( channel: BaseGuildTextChannel ) {
    let before: string | undefined;

    while ( true ) {
        const messages = await channel.messages.fetch( before ? { limit: 100, before } : { limit: 100 } );

        if ( messages.size === 0 ) {
            return;
        }

        before = messages.lastKey();

        const deletable = messages.filter( ( entry ) => entry.deletable );

        if ( deletable.size === 0 ) {
            return;
        }

        const bulkDeleted = await channel.bulkDelete( deletable, true ).catch( () => null );

        if ( bulkDeleted ) {
            const remaining = deletable.filter( ( entry ) => !bulkDeleted.has( entry.id ) );

            for ( const entry of remaining.values() ) {
                await entry.delete().catch( () => null );
            }
        } else {
            for ( const entry of deletable.values() ) {
                await entry.delete().catch( () => null );
            }
        }

        if ( messages.size < 100 ) {
            return;
        }
    }
}

function resolveTypingIntervalMs() {
    const configured = process.env.AI_CHAT_TYPING_INTERVAL_MS;
    const value = configured ? Number( configured ) : Number.NaN;

    if ( Number.isFinite( value ) && value >= 1000 ) {
        return value;
    }

    return DEFAULT_TYPING_INTERVAL_MS;
}

function startTypingHeartbeat( channel: TextBasedChannel ) {
    if ( !isTypingCapableChannel( channel ) ) {
        return () => undefined;
    }

    const intervalMs = resolveTypingIntervalMs();

    void channel.sendTyping().catch( () => null );

    const handle = setInterval( () => {
        void channel.sendTyping().catch( () => null );
    }, intervalMs );

    return () => {
        clearInterval( handle );
    };
}

type TypingCapableChannel = TextBasedChannel & {
    sendTyping(): Promise<void>;
};

function isTypingCapableChannel( channel: TextBasedChannel ): channel is TypingCapableChannel {
    const candidate = channel as { sendTyping?: () => Promise<void> };

    return typeof candidate.sendTyping === "function";
}
