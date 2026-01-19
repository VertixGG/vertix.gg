import { Events } from "discord.js";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";
import { runAgentChatWithSession } from "@vertix.gg/bot/src/utils/agent-client";

import type { Client, Message, TextBasedChannel } from "discord.js";

const TARGET_GUILD_ID = process.env.AI_CHAT_GUILD_ID;
const TARGET_CHANNEL_ID = process.env.AI_CHAT_CHANNEL_ID;

const DEFAULT_TYPING_INTERVAL_MS = 8000;
const CONTEXT_MESSAGE_COUNT = 10;

const PRIVATE_SYSTEM_PROMPT = `You are Vertix, a powerful Discord bot with FULL ACCESS to Discord operations. You are responding in a private admin channel.

You have access to the vertix-mcp tools with FULL permissions:
- You CAN read all guild info, channels, members, messages, roles, voice states
- You CAN send messages, DMs, and reactions
- You CAN create, edit, and delete channels
- You CAN kick, ban, and timeout users
- You CAN manage roles and permissions
- You CAN modify guild settings
- You CAN manage webhooks and invites

You also have access to the Vertix codebase and can help with development tasks.

Be helpful, precise, and execute commands when requested. This is an admin-only channel with full trust.`;

type ChannelSession = {
    conversationId?: string;
    lastActivity: number;
};

const channelSessions = new Map<string, ChannelSession>();
const SESSION_TIMEOUT_MS = 600000;

export function mentionHandlerPrivate( client: Client ) {
    if ( ! TARGET_GUILD_ID || ! TARGET_CHANNEL_ID ) {
        GlobalLogger.$.log( mentionHandlerPrivate, "[PRIVATE] AI_CHAT_GUILD_ID or AI_CHAT_CHANNEL_ID not set; skipping private handler." );
        return;
    }

    GlobalLogger.$.log( mentionHandlerPrivate, `[PRIVATE] Handler active for guild: ${ TARGET_GUILD_ID }, channel: ${ TARGET_CHANNEL_ID }` );

    client.on( Events.MessageCreate, async( message ) => {
        try {
            if ( message.author.bot ) {
                return;
            }

            if ( message.guildId !== TARGET_GUILD_ID || message.channelId !== TARGET_CHANNEL_ID ) {
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

            const content = message.content
                .replace( new RegExp( `<@!?${ botId }>`, "g" ), "" )
                .trim();

            if ( ! content && message.attachments.size === 0 ) {
                await message.reply( "Hi! I'm ready with full access. What would you like me to do?" );
                return;
            }

            GlobalLogger.$.log( mentionHandlerPrivate, `[PRIVATE] Processing mention from ${ message.author.username }` );

            const sessionKey = `private-${ message.channelId }`;
            let session = channelSessions.get( sessionKey );

            if ( ! session || Date.now() - session.lastActivity > SESSION_TIMEOUT_MS ) {
                session = { lastActivity: Date.now() };
                channelSessions.set( sessionKey, session );
            }

            session.lastActivity = Date.now();

            const stopTyping = startTypingHeartbeat( message.channel );

            try {
                const contextInfo = buildContextInfo( message );
                const userMessage = formatMentionMessage( message, botId ) || content;

                const isNewSession = ! session.conversationId;
                const fullPrompt = isNewSession
                    ? `${ PRIVATE_SYSTEM_PROMPT }\n\n${ contextInfo }\n\nUser message: ${ userMessage }`
                    : userMessage;

                const { response, conversationId } = await runAgentChatWithSession( fullPrompt, {
                    conversationId: session.conversationId,
                    readOnly: false,
                    model: "gpt-5.2-codex"
                } );

                if ( conversationId ) {
                    session.conversationId = conversationId;
                }

                await message.reply( response );

                GlobalLogger.$.log( mentionHandlerPrivate, `[PRIVATE] Reply sent${ session.conversationId ? ` [session: ${ session.conversationId.slice( 0, 8 ) }...]` : "" }` );
            } finally {
                stopTyping();
            }
        } catch( error ) {
            GlobalLogger.$.error( mentionHandlerPrivate, "[PRIVATE] Failed to process mention", error );

            await message.reply( "Error processing request. Check logs for details." ).catch( () => {} );
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

function buildContextInfo( message: Message<boolean> ): string {
    const guild = message.guild;
    const channel = message.channel;
    const channelName = "name" in channel ? channel.name : "Private";

    return `Context:
- Guild: ${ guild?.name ?? "Unknown" } (ID: ${ message.guildId })
- Channel: #${ channelName } (ID: ${ message.channelId })
- User: ${ message.author.username } (ID: ${ message.author.id })
- Message ID: ${ message.id }
- Mode: FULL ACCESS (admin channel)`;
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
