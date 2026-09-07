import { Events } from "discord.js";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import { AIGuildDataManager } from "@vertix.gg/ai/src/managers/ai-guild-data-manager";

import { AIService } from "@vertix.gg/ai/src/services/ai-service";

import GlobalLogger from "@vertix.gg/ai/src/global-logger";

import type { Client, GuildMember, Message, PartialMessage, SendableChannels, TextBasedChannel } from "discord.js";
import type { OllamaMessage } from "@vertix.gg/ai/src/definitions/ollama-definitions";
import type { AIReply } from "@vertix.gg/ai/src/services/ai-service";
import type { E_AI_TRIGGER_EVENT } from "@vertix.gg/prisma/._ai-client-internal";

/** A message asking the bot to run something on the host. */
const COMMAND_REQUEST_PATTERN = /\b(run|exec|execute)\b/i;

const NON_OWNER_COMMAND_REFUSAL =
    "I can only run commands for my owner - I'm not able to run commands on anyone else's request.";

/** Message ids already refused, so one message is refused once across its edits. */
const refusedMessageIds = new Set<string>();
const REFUSED_IDS_MAX = 1000;

function rememberRefused( id: string ): void {
    // Refusals are rare; a periodic wipe is enough to bound this without an LRU.
    if ( refusedMessageIds.size >= REFUSED_IDS_MAX ) {
        refusedMessageIds.clear();
    }

    refusedMessageIds.add( id );
}

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

    // Streaming bots post a placeholder and edit the real text in, so a command
    // request often only exists on the edit. The refusal is the only thing that
    // runs on edits - the full trigger flow stays on create.
    client.on( Events.MessageUpdate, ( _oldMessage, newMessage ) => {
        void handleMessageEdit( client, newMessage ).catch( ( error: unknown ) => {
            GlobalLogger.$.error( registerTriggerDispatcher, "MessageUpdate trigger failed", error );
        } );
    } );

    client.on( Events.GuildMemberAdd, ( member ) => {
        void handleMemberJoin( member ).catch( ( error: unknown ) => {
            GlobalLogger.$.error( registerTriggerDispatcher, "GuildMemberAdd trigger failed", error );
        } );
    } );
}

async function handleMessageEdit( client: Client, message: Message | PartialMessage ): Promise<void> {
    // This handler exists only to refuse a non-owner's command request that
    // lands as an edit. A streaming bot keeps firing edit events after the text
    // is complete, so skip anything already refused before spending a fetch.
    if ( refusedMessageIds.has( message.id ) ) {
        return;
    }

    // The edit event delivers empty content for a streamed bot edit even when it
    // is not flagged partial (and an uncached edit is partial), so a forced REST
    // fetch is the only way to see the real author and text.
    let full: Message;

    if ( message.partial || !message.content?.trim().length ) {
        const fetched = await message.fetch( true ).catch( () => null );

        if ( !fetched ) {
            return;
        }

        full = fetched;
    } else {
        full = message;
    }

    await maybeRefuseCommandRequest( client, full );
}

/**
 * Replies with a refusal when a non-owner asks this bot to run a command.
 *
 * Shared by message create and edit, and deduped by message id so a message is
 * refused once however many times it is edited. Returns true when it refused,
 * so the create path can stop.
 */
async function maybeRefuseCommandRequest( client: Client, message: Message ): Promise<boolean> {
    if ( refusedMessageIds.has( message.id ) ) {
        return true;
    }

    if ( !message.inGuild() || !message.content.trim().length ) {
        return false;
    }

    const isMention = Boolean( client.user && message.mentions.users.has( client.user.id ) );

    // A bot addresses this one by name in text, not by a Discord mention.
    const namesBot = isMention
        || Boolean( client.user && message.content.toLowerCase().includes( client.user.username.toLowerCase() ) );

    if ( !namesBot || AIConfig.$.isOwner( message.author.id ) ) {
        return false;
    }

    const content = client.user
        ? message.content.replaceAll( `<@${ client.user.id }>`, "" ).trim()
        : message.content.trim();

    if ( !COMMAND_REQUEST_PATTERN.test( content ) || !message.channel.isSendable() ) {
        return false;
    }

    const settings = await AIGuildDataManager.$.getTriggerSettings( message.guildId );

    // Scoped to a mention or watched channel so it does not answer command talk
    // in every channel it can see.
    if ( !isMention && !settings.channelIds.includes( message.channelId ) ) {
        return false;
    }

    rememberRefused( message.id );

    GlobalLogger.$.log( maybeRefuseCommandRequest, `Refusing command request from non-owner '${ message.author.id }'` );

    await message.reply( NON_OWNER_COMMAND_REFUSAL );

    return true;
}

async function handleMessage( client: Client, message: Message ): Promise<void> {
    // A non-owner (another bot included) asking to run a command is refused here
    // rather than ignored. Everything below is for real triggers only.
    if ( await maybeRefuseCommandRequest( client, message ) ) {
        return;
    }

    // Otherwise, other bots are ignored entirely.
    if ( message.author.bot ) {
        return;
    }

    if ( !message.inGuild() || !message.content.trim().length ) {
        return;
    }

    const settings = await AIGuildDataManager.$.getTriggerSettings( message.guildId );

    if ( !settings.events.length ) {
        return;
    }

    const isMention = Boolean( client.user && message.mentions.users.has( client.user.id ) );
    const isWatchedChannel = settings.channelIds.includes( message.channelId );

    const content = client.user
        ? message.content.replaceAll( `<@${ client.user.id }>`, "" ).trim()
        : message.content.trim();

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

    // The tool already put its message in this channel; a second one restating
    // it is noise. This loses the usage footer for that turn - an extra message
    // carrying only a footer would be the same noise in smaller type.
    if ( reply.postedToChannel ) {
        GlobalLogger.$.debug( handleMessage, "Suppressed the text reply - a tool already posted here" );

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
            // Our own replies carry a usage footer; the model must never see it or
            // it will start writing its own.
            const content = isSelf
                ? AIService.$.stripUsageFooter( entry.content )
                : `${ entry.author.username }: ${ entry.content }`;

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
    const chunks = AIService.$.splitForDiscord( AIService.$.stripUsageFooter( reply.content ) );

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
