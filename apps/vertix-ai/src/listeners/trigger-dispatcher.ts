import { Events } from "discord.js";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import { AIGuildDataManager } from "@vertix.gg/ai/src/managers/ai-guild-data-manager";

import { AIService } from "@vertix.gg/ai/src/services/ai-service";

import GlobalLogger from "@vertix.gg/ai/src/global-logger";

import type { Client, GuildMember, Message, SendableChannels, TextBasedChannel } from "discord.js";
import type { OllamaMessage } from "@vertix.gg/ai/src/definitions/ollama-definitions";
import type { AIReply } from "@vertix.gg/ai/src/services/ai-service";
import type { E_AI_TRIGGER_EVENT } from "@vertix.gg/prisma/._ai-client-internal";

/**
 * Routes Discord events to the model, but only the ones a guild has switched on
 * in `/setup triggers`.
 */
export function registerTriggerDispatcher( client: Client ): void {
    client.on( Events.MessageCreate, ( message ) => {
        void handleMessage( client, message ).catch( ( error: unknown ) => {
            GlobalLogger.$.error( registerTriggerDispatcher, "MessageCreate trigger failed", error );
        } );
    } );

    client.on( Events.GuildMemberAdd, ( member ) => {
        void handleMemberJoin( member ).catch( ( error: unknown ) => {
            GlobalLogger.$.error( registerTriggerDispatcher, "GuildMemberAdd trigger failed", error );
        } );
    } );
}

async function handleMessage( client: Client, message: Message ): Promise<void> {
    if ( message.author.bot || !message.inGuild() || !message.content.trim().length ) {
        return;
    }

    const settings = await AIGuildDataManager.$.getTriggerSettings( message.guildId );

    if ( !settings.events.length ) {
        return;
    }

    const isMention = Boolean( client.user && message.mentions.users.has( client.user.id ) );
    const isWatchedChannel = settings.channelIds.includes( message.channelId );

    // A mention inside a watched channel is one event, not two.
    let event: E_AI_TRIGGER_EVENT | null = null;

    if ( isMention && settings.events.includes( "MESSAGE_MENTION" ) ) {
        event = "MESSAGE_MENTION";
    } else if ( isWatchedChannel && settings.events.includes( "MESSAGE_IN_CHANNEL" ) ) {
        event = "MESSAGE_IN_CHANNEL";
    }

    if ( !event ) {
        return;
    }

    GlobalLogger.$.log(
        handleMessage,
        `Trigger '${ event }' - guildId: '${ message.guildId }' channelId: '${ message.channelId }'`
    );

    const content = client.user
        ? message.content.replaceAll( `<@${ client.user.id }>`, "" ).trim()
        : message.content.trim();

    if ( !message.channel.isSendable() ) {
        return;
    }

    const triggerContext = {
        guildId: message.guildId,
        event,
        botName: client.user?.username ?? "the bot",
        rawMessage: content,
        history: await fetchHistory( client, message ),
        location: {
            guildName: message.guild?.name ?? "unknown",
            channelId: message.channelId,
            channelName: "name" in message.channel ? ( message.channel.name ?? "unknown" ) : "unknown",
            userId: message.author.id,
            userName: message.author.username
        },
        summary: `${ message.author.username } said in #${ "name" in message.channel ? message.channel.name : "channel" }:\n${ content }`
    };

    // A direct mention is already an unambiguous request, so it skips the gate.
    // Everything passive has to earn a reply first - otherwise a watched channel
    // gets answered on every message, including ones aimed at other bots.
    if ( "MESSAGE_MENTION" !== event && !await AIService.$.shouldRespond( triggerContext ) ) {
        GlobalLogger.$.debug( handleMessage, `Decided not to reply to '${ message.id }'` );

        return;
    }

    // Only now, once a reply is actually coming: Discord clears the typing
    // indicator after ~10s, and a cold model load alone takes longer than that.
    const stopTyping = keepTyping( message.channel );

    let reply: AIReply | null;

    try {
        reply = await AIService.$.respondTo( triggerContext );
    } finally {
        stopTyping();
    }

    if ( !reply ) {
        return;
    }

    await sendChunked( message.channel, reply, message );
}

async function handleMemberJoin( member: GuildMember ): Promise<void> {
    if ( !await AIGuildDataManager.$.isTriggerEnabled( member.guild.id, "MEMBER_JOIN" ) ) {
        return;
    }

    const settings = await AIGuildDataManager.$.getTriggerSettings( member.guild.id );

    const channelId = settings.channelIds.at( 0 );

    if ( !channelId ) {
        GlobalLogger.$.debug( handleMemberJoin, "MEMBER_JOIN is on but no channel is selected to speak in" );

        return;
    }

    const channel = await member.guild.channels.fetch( channelId ).catch( () => null );

    if ( !channel?.isSendable() ) {
        return;
    }

    const reply = await AIService.$.respondTo( {
        guildId: member.guild.id,
        event: "MEMBER_JOIN",
        summary: `${ member.user.username } just joined ${ member.guild.name }.`,
        botName: member.client.user?.username ?? "the bot",
        location: {
            guildName: member.guild.name,
            channelId,
            channelName: "name" in channel ? ( channel.name ?? "unknown" ) : "unknown",
            userId: member.id,
            userName: member.user.username
        }
    } );

    if ( reply ) {
        await sendChunked( channel, reply );
    }
}

/** Discord's hard cap on one messages.fetch call. */
const DISCORD_FETCH_PAGE_SIZE = 100;

/**
 * Replays the channel's visible history so the model follows the conversation
 * instead of answering each line in isolation.
 *
 * Pages backwards through Discord 100 at a time until it runs out of messages,
 * hits the message ceiling, or would exceed the character budget - whichever
 * comes first. The budget is what normally stops it, and it is enforced while
 * walking backwards so the messages kept are always the most recent ones.
 *
 * The bot's own messages come back as `assistant` turns; everyone else's are
 * `user` turns prefixed with the speaker, since Discord is many-to-many and the
 * model otherwise cannot tell who said what.
 */
async function fetchHistory( client: Client, message: Message ): Promise<OllamaMessage[]> {
    const maxMessages = AIConfig.$.getHistoryLimit();
    const maxChars = AIConfig.$.getHistoryMaxChars();

    const collected: OllamaMessage[] = [];

    let before = message.id;
    let usedChars = 0;

    while ( collected.length < maxMessages ) {
        const remaining = Math.min( DISCORD_FETCH_PAGE_SIZE, maxMessages - collected.length );

        const page = await ( message.channel as TextBasedChannel ).messages
            .fetch( { limit: remaining, before } )
            .catch( () => null );

        if ( !page?.size ) {
            break;
        }

        // Discord returns newest-first; walking in that order means the budget
        // trims the oldest messages rather than the ones that matter most.
        for ( const entry of page.values() ) {
            before = entry.id;

            if ( !entry.content.trim().length ) {
                continue;
            }

            const isSelf = entry.author.id === client.user?.id;
            const content = isSelf ? entry.content : `${ entry.author.username }: ${ entry.content }`;

            if ( usedChars + content.length > maxChars ) {
                GlobalLogger.$.debug(
                    fetchHistory,
                    `History budget reached at '${ collected.length }' messages ('${ usedChars }' chars)`
                );

                return collected.reverse();
            }

            usedChars += content.length;

            collected.push( isSelf
                ? { role: "assistant", content }
                : { role: "user", content }
            );
        }

        if ( page.size < remaining ) {
            break;
        }
    }

    GlobalLogger.$.debug( fetchHistory, `Replaying '${ collected.length }' messages ('${ usedChars }' chars)` );

    return collected.reverse();
}

const TYPING_REFRESH_MS = 8000;

/** Keeps the typing indicator alive until the returned function is called. */
function keepTyping( channel: SendableChannels ): () => void {
    const timer = setInterval( () => {
        void channel.sendTyping().catch( () => undefined );
    }, TYPING_REFRESH_MS );

    void channel.sendTyping().catch( () => undefined );

    return () => clearInterval( timer );
}

async function sendChunked( channel: SendableChannels, reply: AIReply, replyTo?: Message ): Promise<void> {
    const chunks = AIService.$.splitForDiscord( reply.content );

    // The usage line goes on the last chunk only, so a split reply does not
    // repeat it - and it is measured for the whole reply, not per chunk.
    const usageLine = AIConfig.$.isUsageFooterEnabled() ? AIService.$.formatUsage( reply.usage ) : null;

    for ( const [ index, chunk ] of chunks.entries() ) {
        const isLast = index === chunks.length - 1;
        const body = isLast && usageLine ? `${ chunk }\n${ usageLine }` : chunk;

        if ( 0 === index && replyTo ) {
            await replyTo.reply( body );

            continue;
        }

        await channel.send( body );
    }
}

export default registerTriggerDispatcher;
