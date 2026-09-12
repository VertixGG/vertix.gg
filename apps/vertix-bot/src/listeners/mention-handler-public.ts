import { Events } from "discord.js";

import { GuildModel } from "@vertix.gg/data/src/models/guild-model";
import { AIChannelPromptModel } from "@vertix.gg/data/src/models/ai-channel-prompt-model";

import { AI_CAPTCHA_IPC_ACTIONS } from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";
import { guildLeaveBecauseNotInDatabase } from "@vertix.gg/bot/src/utils/guild";
import { AgentManager } from "@vertix.gg/bot/src/managers/agent-manager";
import { AttachmentManager } from "@vertix.gg/bot/src/managers/attachment-manager";

import type { LocalAttachment } from "@vertix.gg/bot/src/managers/attachment-manager";

import type { Client, Message, TextBasedChannel, TextChannel } from "discord.js";

const DEFAULT_TYPING_INTERVAL_MS = 8000;
const CONTEXT_MESSAGE_COUNT = 10;

const buildPublicSystemPrompt = ( botName: string ) => `You are ${ botName }, the AI assistant for Vertix - a Discord bot that helps manage dynamic voice channels. You are responding to a user who @mentioned you. Always refer to yourself as "${ botName }", never as "Vertix" (that is the product you help with, not your name).

You have access to the vertix-mcp tools for reading Discord information (guilds, channels, members, messages, roles, etc.). These tools are READ-ONLY - you can view information but NOT modify anything.

IMPORTANT RESTRICTIONS:
- You CANNOT create, edit, or delete channels
- You CANNOT kick, ban, or timeout users
- You CANNOT manage roles or permissions
- You CANNOT modify guild settings
- You CAN read guild info, channels, members, messages, roles, voice states
- You CAN send messages and reactions as responses
- You CAN help users understand Vertix features
- You CAN look up Vertix's own UI with ui_list_adapters, ui_get_adapter and ui_search, to explain exactly what a dialog shows and which buttons it has (you CANNOT send those dialogs)

When users ask about Vertix features, explain:
- Dynamic voice channels that are created when users join a master channel
- Channel ownership and customization options
- Templates for saving channel configurations
- Privacy settings (public, private, muted)

Be helpful, concise, and friendly. If asked to do something you cannot do (modify guild), explain your read-only limitations politely.`;

type ChannelSession = {
    conversationId?: string;
    lastActivity: number;
};

/**
 * What a channel with its own prompt is allowed to do beyond reading.
 *
 * Only these two. The assistant that answers strangers stays read-only otherwise - it can pose a
 * challenge and have an answer checked, and the role behind a correct answer is handed over by the
 * bot against what the prompt names, never by this assistant deciding somebody deserves it.
 */
const CHANNEL_PROMPT_EXTRA_TOOLS = [
    AI_CAPTCHA_IPC_ACTIONS.SEND_CHALLENGE,
    AI_CAPTCHA_IPC_ACTIONS.VERIFY_ANSWER
];

function getSessionKey( guildId: string, channelId: string ): string {
    return `${ guildId }-${ channelId }`;
}

/**
 * The shipped prompt, plus whatever this channel was told to add to it.
 *
 * Appended, never substituted: the restrictions above are what make this assistant safe to point
 * at anyone who mentions it, and a channel must not be able to write them away.
 */
async function buildSystemPrompt( channelId: string, botName: string ): Promise<string> {
    const channelPrompt = await AIChannelPromptModel.$.get( channelId ).catch( ( error ) => {
        GlobalLogger.$.error( buildSystemPrompt, "[PUBLIC] Failed reading the channel prompt", error );

        return null;
    } );

    if ( ! channelPrompt ) {
        return buildPublicSystemPrompt( botName );
    }

    return `${ buildPublicSystemPrompt( botName ) }\n\n## Instructions for this channel\n\n${ channelPrompt }`;
}

/** Drops the channel's session so a changed prompt is used from the next message rather than the next timeout. */
export function resetPublicChannelSession( guildId: string, channelId: string ): void {
    channelSessions.delete( getSessionKey( guildId, channelId ) );
}

const channelSessions = new Map<string, ChannelSession>();
const SESSION_TIMEOUT_MS = 300000;

const PRIVATE_GUILD_ID = process.env.AI_CHAT_GUILD_ID;
const PRIVATE_CHANNEL_ID = process.env.AI_CHAT_CHANNEL_ID;

// The owner is served full-access by mentionHandlerPrivate in every channel - but
// only when that handler is actually active (same config it needs to register);
// otherwise the owner would fall through to no handler at all.
const OWNER_ID = process.env.OWNERD_ID;
const PRIVATE_HANDLER_CONFIGURED = Boolean(
    process.env.AI_CHAT_GUILD_ID && process.env.AI_CHAT_CHANNEL_ID && process.env.AI_CHAT_PRIVATE_SYSTEM_PROMPT?.trim()
);

export function mentionHandlerPublic( client: Client ) {
    client.on( Events.MessageCreate, async( message ) => {
        try {
            if ( message.author.bot ) {
                return;
            }

            if ( ! message.guild ) {
                return;
            }

            // Skip private channel - handled by mentionHandlerPrivate
            if ( message.guildId === PRIVATE_GUILD_ID && message.channelId === PRIVATE_CHANNEL_ID ) {
                return;
            }

            // The owner runs full-access via mentionHandlerPrivate in every channel.
            if ( OWNER_ID && PRIVATE_HANDLER_CONFIGURED && message.author.id === OWNER_ID ) {
                return;
            }

            const botId = client.user?.id;

            if ( ! botId ) {
                return;
            }

            const isMentioned = message.mentions.has( botId );

            if ( ! isMentioned ) {
                return;
            }

            const guildId = message.guildId;

            if ( guildId ) {
                void GuildModel.$.updateLastActive( guildId ).then( ( updated ) => {
                    if ( ! updated ) {
                        void guildLeaveBecauseNotInDatabase( guildId );
                    }
                } );
            }

            const content = message.content
                .replace( new RegExp( `<@!?${ botId }>`, "g" ), "" )
                .trim();

            if ( ! content && message.attachments.size === 0 ) {
                await message.reply( "Hi! How can I help you? Ask me anything about Vertix or this server." );
                return;
            }

            GlobalLogger.$.log( mentionHandlerPublic, `[PUBLIC] Processing mention from ${ message.author.username } in ${ message.guild.name }` );

            const sessionKey = getSessionKey( guildId ?? "", message.channelId );
            let session = channelSessions.get( sessionKey );

            if ( ! session || Date.now() - session.lastActivity > SESSION_TIMEOUT_MS ) {
                session = { lastActivity: Date.now() };
                channelSessions.set( sessionKey, session );
            }

            session.lastActivity = Date.now();

            const attachments = await AttachmentManager.$.download( message );
            const stopTyping = startTypingHeartbeat( message.channel );

            try {
                const contextInfo = await buildContextInfo( message );
                const userMessage = formatMentionMessage( message, botId, attachments.files ) || content;

                const channelPrompt = await AIChannelPromptModel.$.get( message.channelId ).catch( () => null );

                const isNewSession = ! session.conversationId;
                const fullPrompt = isNewSession
                    ? `${ await buildSystemPrompt( message.channelId, message.client.user?.username ?? "an AI assistant" ) }\n\n${ contextInfo }\n\nUser message: ${ userMessage }`
                    : userMessage;

                const { response, conversationId } = await AgentManager.$.runChat( fullPrompt, {
                    conversationId: session.conversationId,
                    readOnly: true,
                    model: AgentManager.$.getPublicModel(),
                    attachments: attachments.files,
                    // Earned by the channel having been configured at all: a channel nobody set up
                    // gains nothing, so this widens exactly where somebody meant it to.
                    extraTools: channelPrompt ? CHANNEL_PROMPT_EXTRA_TOOLS : [],
                    caller: {
                        guildId: guildId ?? "",
                        channelId: message.channelId,
                        userId: message.author.id
                    }
                } );

                if ( conversationId ) {
                    session.conversationId = conversationId;
                }

                // A turn that only used tools has no text to post, and Discord rejects empty content.
                if ( response.trim() ) {
                    await message.reply( response );
                }

                GlobalLogger.$.log( mentionHandlerPublic, `[PUBLIC] ${ response.trim() ? "Reply sent" : "No text reply" }${ session.conversationId ? ` [session: ${ session.conversationId.slice( 0, 8 ) }...]` : "" }` );
            } finally {
                stopTyping();

                await AttachmentManager.$.cleanup( attachments );
            }
        } catch( error ) {
            GlobalLogger.$.error( mentionHandlerPublic, "[PUBLIC] Failed to process mention", error );

            await message.reply( "Sorry, I encountered an error processing your request. Please try again." ).catch( () => {} );
        }
    } );

    cleanupOldSessions();
}

function formatMentionMessage( message: Message<boolean>, botId?: string, files: LocalAttachment[] = [] ): string | null {
    // The paths are what makes an attachment usable - the agent reads files, it cannot fetch a
    // Discord CDN URL.
    const attachments = files.length
        ? ` [attachments, local files to open with Read: ${ files.map( ( file ) => `${ file.path }${ file.contentType ? ` (${ file.contentType })` : "" }` ).join( ", " ) }]`
        : "";

    const content = message.content
        .replace( new RegExp( `<@!?${ botId }>`, "g" ), "" )
        .trim();

    const body = `${ content }${ attachments }`.trim();

    if ( ! body ) {
        return null;
    }

    const displayName = message.member?.displayName || message.author.username;

    return `User (${ displayName }): ${ body }`;
}

async function fetchRecentMessages( message: Message<boolean> ): Promise<string> {
    try {
        const channel = message.channel;

        if ( ! ( "messages" in channel ) ) {
            return "";
        }

        const textChannel = channel as TextChannel;
        const messages = await textChannel.messages.fetch( { limit: CONTEXT_MESSAGE_COUNT, before: message.id } );

        if ( messages.size === 0 ) {
            return "";
        }

        const formatted = [ ... messages.values() ]
            .reverse()
            .map( ( msg ) => {
                const author = msg.member?.displayName || msg.author.username;
                const isBot = msg.author.bot ? " [BOT]" : "";
                const content = msg.content || "[no text content]";
                const attachments = msg.attachments.size ? ` [+${ msg.attachments.size } attachment(s)]` : "";

                return `${ author }${ isBot }: ${ content }${ attachments }`;
            } )
            .join( "\n" );

        return `\nRecent conversation (oldest to newest):\n${ formatted }`;
    } catch {
        return "";
    }
}

async function buildContextInfo( message: Message<boolean> ): Promise<string> {
    const guild = message.guild;

    if ( ! guild ) {
        return "";
    }

    const channel = message.channel;
    const channelName = "name" in channel ? channel.name : "DM";

    const recentMessages = await fetchRecentMessages( message );

    return `Context:
- Guild: ${ guild.name } (ID: ${ guild.id })
- Channel: #${ channelName } (ID: ${ message.channelId })
- User: ${ message.author.username } (ID: ${ message.author.id })
- Message ID: ${ message.id }${ recentMessages }`;
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
    if ( ! isTypingCapableChannel( channel ) ) {
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

function cleanupOldSessions() {
    setInterval( () => {
        const now = Date.now();

        for ( const [ key, session ] of channelSessions.entries() ) {
            if ( now - session.lastActivity > SESSION_TIMEOUT_MS ) {
                channelSessions.delete( key );
            }
        }
    }, 60000 );
}
