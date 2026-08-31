import { Events } from "discord.js";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";
import { AgentManager } from "@vertix.gg/bot/src/managers/agent-manager";
import { getPanelRevision, onPanelRendered, setDynamicInteractionListener, startNewPanel } from "@vertix.gg/bot/src/ui/dynamic/dynamic-ui-factory";

import type { Client, Message, TextBasedChannel } from "discord.js";

import type { DynamicUIInteraction } from "@vertix.gg/definitions/src/ui-ipc-definitions";

const TARGET_GUILD_ID = process.env.AI_CHAT_GUILD_ID;
const TARGET_CHANNEL_ID = process.env.AI_CHAT_CHANNEL_ID;

const DEFAULT_TYPING_INTERVAL_MS = 8000;
const _CONTEXT_MESSAGE_COUNT = 10;

const PRIVATE_SYSTEM_PROMPT = process.env.AI_CHAT_PRIVATE_SYSTEM_PROMPT ?? "";

type ChannelSession = {
    conversationId?: string;
    lastActivity: number;
};

const channelSessions = new Map<string, ChannelSession>();
const SESSION_TIMEOUT_MS = 600000;

function getSession( sessionKey: string ): ChannelSession {
    let session = channelSessions.get( sessionKey );

    if ( ! session || Date.now() - session.lastActivity > SESSION_TIMEOUT_MS ) {
        session = { lastActivity: Date.now() };
        channelSessions.set( sessionKey, session );
    }

    session.lastActivity = Date.now();

    return session;
}

export function mentionHandlerPrivate( client: Client ) {
    if ( ! TARGET_GUILD_ID || ! TARGET_CHANNEL_ID ) {
        GlobalLogger.$.log( mentionHandlerPrivate, "[PRIVATE] AI_CHAT_GUILD_ID or AI_CHAT_CHANNEL_ID not set; skipping private handler." );
        return;
    }

    if ( ! PRIVATE_SYSTEM_PROMPT.trim() ) {
        GlobalLogger.$.log( mentionHandlerPrivate, "[PRIVATE] AI_CHAT_PRIVATE_SYSTEM_PROMPT not set; skipping private handler." );
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

            // A new message from the user starts a new turn: its panel belongs at the bottom of the
            // conversation, next to what was just said, not rewritten into the one further up.
            startNewPanel( message.channelId );

            const session = getSession( `private-${ message.channelId }` );

            const stopTyping = startTypingUntilPanel( message.channel, message.channelId );

            try {
                const contextInfo = buildContextInfo( message );
                const userMessage = formatMentionMessage( message, botId ) || content;

                const isNewSession = ! session.conversationId;
                const fullPrompt = isNewSession
                    ? `${ PRIVATE_SYSTEM_PROMPT }\n\n${ contextInfo }\n\nUser message: ${ userMessage }`
                    : userMessage;

                const panelRevision = getPanelRevision( message.channelId );

                const { response, conversationId } = await AgentManager.$.runChat( fullPrompt, {
                    conversationId: session.conversationId,
                    readOnly: false,
                    model: AgentManager.$.getPrivateModel()
                } );

                if ( conversationId ) {
                    session.conversationId = conversationId;
                }

                // The panel is the answer - a text message next to it would only repeat it.
                const answeredWithPanel = getPanelRevision( message.channelId ) !== panelRevision;

                if ( response.trim() && ! answeredWithPanel ) {
                    await message.reply( response );
                }

                GlobalLogger.$.log( mentionHandlerPrivate, `[PRIVATE] ${ answeredWithPanel ? "Answered through the panel" : "Reply sent" }${ session.conversationId ? ` [session: ${ session.conversationId.slice( 0, 8 ) }...]` : "" }` );
            } finally {
                stopTyping();
            }
        } catch( error ) {
            GlobalLogger.$.error( mentionHandlerPrivate, "[PRIVATE] Failed to process mention", error );

            await message.reply( "Error processing request. Check logs for details." ).catch( () => {} );
        }
    } );

    setDynamicInteractionListener( ( interaction, origin ) => {
        if ( origin.channelId !== TARGET_CHANNEL_ID ) {
            return;
        }

        void handleDynamicInteraction( client, interaction, origin.channelId );
    } );

    cleanupOldSessions();
}

/**
 * A click on a UI the agent built continues the same conversation, so the buttons actually lead
 * somewhere instead of only printing their canned reply.
 */
async function handleDynamicInteraction( client: Client, interaction: DynamicUIInteraction, channelId: string ) {
    try {
        const channel = await client.channels.fetch( channelId ).catch( () => null );

        if ( ! channel?.isTextBased() || ! ( "send" in channel ) ) {
            return;
        }

        GlobalLogger.$.log(
            mentionHandlerPrivate,
            `[PRIVATE] Processing UI interaction '${ interaction.elementId }' of '${ interaction.specName }' from ${ interaction.username }`
        );

        const session = getSession( `private-${ channelId }` );

        const values = interaction.values?.length
            ? ` with values: ${ interaction.values.join( ", " ) }`
            : "";

        const event = `[UI interaction] <@${ interaction.userId }> (${ interaction.username }) used '${ interaction.elementId }' on your UI '${ interaction.specName }'${ values }.\nDo whatever it implies, then answer with a UI - reuse the same UI name to replace the panel - or with one short line.`;

        const prompt = session.conversationId
            ? event
            : `${ PRIVATE_SYSTEM_PROMPT }\n\nContext:\n- Channel: (ID: ${ channelId })\n- Mode: FULL ACCESS (admin channel)\n\n${ event }`;

        const stopTyping = startTypingUntilPanel( channel, channelId );

        try {
            const panelRevision = getPanelRevision( channelId );

            const { response, conversationId } = await AgentManager.$.runChat( prompt, {
                conversationId: session.conversationId,
                readOnly: false,
                model: AgentManager.$.getPrivateModel()
            } );

            if ( conversationId ) {
                session.conversationId = conversationId;
            }

            const answeredWithPanel = getPanelRevision( channelId ) !== panelRevision;

            if ( response.trim() && ! answeredWithPanel ) {
                await channel.send( response );
            }

            GlobalLogger.$.log(
                mentionHandlerPrivate,
                `[PRIVATE] UI interaction handled${ answeredWithPanel ? " (panel updated)" : "" }`
            );
        } finally {
            stopTyping();
        }
    } catch( error ) {
        GlobalLogger.$.error( mentionHandlerPrivate, "[PRIVATE] Failed to process UI interaction", error );
    }
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

/**
 * Typing says an answer is on its way. Once the panel is on screen the answer is already there, so
 * the heartbeat stops even when the agent is still working - it has nothing left to say.
 */
function startTypingUntilPanel( channel: TextBasedChannel, channelId: string ) {
    const stopTyping = startTypingHeartbeat( channel );

    const unsubscribe = onPanelRendered( ( renderedChannelId ) => {
        if ( renderedChannelId === channelId ) {
            stopTyping();
        }
    } );

    return () => {
        unsubscribe();
        stopTyping();
    };
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
