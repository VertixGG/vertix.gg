import { Events } from "discord.js";

import { GuildModel } from "@vertix.gg/base/src/models/guild-model";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";
import { guildLeaveBecauseNotInDatabase } from "@vertix.gg/bot/src/utils/guild";
import { AgentManager } from "@vertix.gg/bot/src/managers/agent-manager";

import type { Client, Message, TextBasedChannel, TextChannel } from "discord.js";

const DEFAULT_TYPING_INTERVAL_MS = 8000;
const CONTEXT_MESSAGE_COUNT = 10;

const PUBLIC_SYSTEM_PROMPT = `You are Vertix, a Discord bot that helps manage dynamic voice channels. You are responding to a user who @mentioned you.

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

const channelSessions = new Map<string, ChannelSession>();
const SESSION_TIMEOUT_MS = 300000;

const PRIVATE_GUILD_ID = process.env.AI_CHAT_GUILD_ID;
const PRIVATE_CHANNEL_ID = process.env.AI_CHAT_CHANNEL_ID;

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

            const sessionKey = `${ guildId }-${ message.channelId }`;
            let session = channelSessions.get( sessionKey );

            if ( ! session || Date.now() - session.lastActivity > SESSION_TIMEOUT_MS ) {
                session = { lastActivity: Date.now() };
                channelSessions.set( sessionKey, session );
            }

            session.lastActivity = Date.now();

            const stopTyping = startTypingHeartbeat( message.channel );

            try {
                const contextInfo = await buildContextInfo( message );
                const userMessage = formatMentionMessage( message, botId ) || content;

                const isNewSession = ! session.conversationId;
                const fullPrompt = isNewSession
                    ? `${ PUBLIC_SYSTEM_PROMPT }\n\n${ contextInfo }\n\nUser message: ${ userMessage }`
                    : userMessage;

                const { response, conversationId } = await AgentManager.$.runChat( fullPrompt, {
                    conversationId: session.conversationId,
                    readOnly: true,
                    model: AgentManager.$.getPublicModel()
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
            }
        } catch( error ) {
            GlobalLogger.$.error( mentionHandlerPublic, "[PUBLIC] Failed to process mention", error );

            await message.reply( "Sorry, I encountered an error processing your request. Please try again." ).catch( () => {} );
        }
    } );

    cleanupOldSessions();
}

function formatMentionMessage( message: Message<boolean>, botId?: string ): string | null {
    const attachments = message.attachments.size
        ? ` [attachments: ${ [ ... message.attachments.values() ].map( ( file ) => file.name ?? file.url ).join( ", " ) }]`
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
