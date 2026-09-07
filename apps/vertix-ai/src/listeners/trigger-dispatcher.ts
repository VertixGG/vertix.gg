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

/** A component node as it comes back from `Component#toJSON()`. */
interface ComponentNode {
    content?: unknown;
    components?: unknown;
    accessory?: unknown;
}

/** Collects the text out of a components-v2 node and everything nested in it. */
function collectComponentText( node: unknown, out: string[] ): void {
    if ( !node || "object" !== typeof node ) {
        return;
    }

    const record = node as ComponentNode;

    // TextDisplay (type 10) and button/section labels expose their text here.
    if ( "string" === typeof record.content && record.content.trim().length ) {
        out.push( record.content );
    }

    if ( Array.isArray( record.components ) ) {
        for ( const child of record.components ) {
            collectComponentText( child, out );
        }
    }

    if ( record.accessory ) {
        collectComponentText( record.accessory, out );
    }
}

/**
 * The visible text of a message, wherever Discord put it.
 *
 * A components-v2 bot (SuperBot is one) leaves `content` empty and carries its
 * text in TextDisplay components instead, so reading `content` alone sees
 * nothing. This falls back to walking the component tree.
 */
function messageText( message: Message ): string {
    if ( message.content.trim().length ) {
        return message.content;
    }

    const out: string[] = [];

    for ( const component of message.components ) {
        collectComponentText( component.toJSON(), out );
    }

    return out.join( "\n" );
}

async function handleMessageEdit( client: Client, message: Message | PartialMessage ): Promise<void> {
    // This handler exists only to refuse a non-owner's command request that
    // lands as an edit. A streaming bot keeps firing edit events after the text
    // is complete, so skip anything already refused before spending a fetch.
    if ( refusedMessageIds.has( message.id ) ) {
        return;
    }

    // A streamed or components-v2 edit arrives with empty `content` even when not
    // flagged partial (and an uncached edit is partial), so a forced REST fetch
    // is the reliable way to read the final author, text and components.
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

    const text = messageText( message );

    if ( !message.inGuild() || !text.trim().length ) {
        return false;
    }

    const isMention = Boolean( client.user && message.mentions.users.has( client.user.id ) );

    // A bot addresses this one by name in text, not by a Discord mention.
    const namesBot = isMention
        || Boolean( client.user && text.toLowerCase().includes( client.user.username.toLowerCase() ) );

    if ( !namesBot || AIConfig.$.isOwner( message.author.id ) ) {
        return false;
    }

    const content = client.user
        ? text.replaceAll( `<@${ client.user.id }>`, "" ).trim()
        : text.trim();

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

/**
 * True when the last messages in the channel are all bots, up to the configured
 * cap - the guard that stops this bot and another from answering each other
 * forever. A human message resets the run; this bot's own replies count as bot
 * turns, so the exchange decays on its own.
 */
async function botConversationExhausted( message: Message ): Promise<boolean> {
    const max = AIConfig.$.getBotConversationMaxTurns();

    const recent = await ( message.channel as TextBasedChannel ).messages
        .fetch( { limit: max + 1 } )
        .catch( () => null );

    if ( !recent ) {
        return false;
    }

    let botRun = 0;

    // Newest first; the first human ends the run.
    for ( const entry of recent.values() ) {
        if ( !entry.author.bot ) {
            break;
        }

        botRun += 1;
    }

    return botRun >= max;
}

async function handleMessage( client: Client, message: Message ): Promise<void> {
    // A non-owner (another bot included) asking to run a command is refused here
    // rather than ignored. Everything below is for real triggers only.
    if ( await maybeRefuseCommandRequest( client, message ) ) {
        return;
    }

    // Never react to our own messages - that would loop instantly.
    if ( message.author.id === client.user?.id ) {
        return;
    }

    const text = messageText( message );

    if ( !message.inGuild() || !text.trim().length ) {
        return;
    }

    const botId = client.user?.id ?? "";
    const botName = ( client.user?.username ?? "" ).toLowerCase();

    const isMention = message.mentions.users.has( botId );

    // Addressed by a Discord mention, or by this bot's name in the text.
    const namesBot = isMention || ( botName.length > 0 && text.toLowerCase().includes( botName ) );

    // A message that pings someone else and does not name this bot is theirs to
    // answer - "@SuperBot which model are you" is not for us, even in a watched
    // channel. This is deterministic so the model never gets to butt in.
    const mentionsSomeoneElse = message.mentions.users.some( ( user ) => user.id !== botId );

    if ( mentionsSomeoneElse && !namesBot ) {
        return;
    }

    // Another bot is ignored unless it addresses this one by name or mention,
    // and even then only until the turn cap, so two bots cannot loop forever.
    if ( message.author.bot ) {
        if ( !namesBot ) {
            return;
        }

        if ( await botConversationExhausted( message ) ) {
            GlobalLogger.$.debug( handleMessage, "Bot-to-bot turn cap reached - staying quiet" );

            return;
        }
    }

    const settings = await AIGuildDataManager.$.getTriggerSettings( message.guildId );

    if ( !settings.events.length ) {
        return;
    }

    const isWatchedChannel = settings.channelIds.includes( message.channelId );

    const content = botId ? text.replaceAll( `<@${ botId }>`, "" ).trim() : text;

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

    // A direct address - a mention, or a bot naming this one - skips the gate.
    // Passive channel chatter still has to earn its reply.
    const directlyAddressed = isMention || ( message.author.bot && namesBot );

    GlobalLogger.$.log(
        handleMessage,
        `Trigger '${ event }' - guildId: '${ message.guildId }' channelId: '${ message.channelId }'`
    );

    if ( !message.channel.isSendable() ) {
        return;
    }

    const { messages: history, participants } = await fetchHistory( client, message );

    // The speaker is not in the fetched history (that is strictly older messages),
    // so add them to the roster - most recent first, deduped by id.
    const roster: Participant[] = [
        {
            id: message.author.id,
            name: message.member?.displayName ?? message.author.displayName,
            aliases: nameAliases( message )
        },
        ...participants
    ].filter( ( person, index, all ) => index === all.findIndex( ( other ) => other.id === person.id ) );

    const triggerContext = {
        guildId: message.guildId,
        event,
        botName: client.user?.username ?? "the bot",
        rawMessage: content,
        history,
        participants: roster,
        location: {
            guildName: message.guild?.name ?? "unknown",
            channelId: message.channelId,
            channelName: "name" in message.channel ? ( message.channel.name ?? "unknown" ) : "unknown",
            userId: message.author.id,
            userName: message.member?.displayName ?? message.author.displayName
        },
        summary: `${ message.member?.displayName ?? message.author.displayName } said in #${ "name" in message.channel ? message.channel.name : "channel" }:\n${ content }`
    };

    // A direct address is an unambiguous request, so it skips the gate. Everything
    // passive has to earn a reply first - otherwise a watched channel gets
    // answered on every message, including ones aimed at other people.
    if ( !directlyAddressed && !await AIService.$.shouldRespond( triggerContext ) ) {
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

    // Convert any plain "@name" the model typed into a real, linking mention.
    await sendChunked(
        message.channel,
        { ...reply, content: linkifyPlainMentions( reply.content, roster ) },
        message
    );
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
type Participant = { id: string; name: string; aliases: string[] };

/** Enough to cover the recent speakers without bloating the prompt. */
const MAX_PARTICIPANTS = 12;

/** Every name form a person can be addressed by - nick, global name, username. */
function nameAliases( message: Message ): string[] {
    const forms = [
        message.member?.nickname,
        message.member?.displayName,
        message.author.globalName,
        message.author.displayName,
        message.author.username
    ];

    return [ ...new Set( forms.filter( ( form ): form is string => Boolean( form && form.trim().length ) ) ) ];
}

/**
 * Turns a plain "@name" the model typed as text into a real `<@id>` mention.
 *
 * The model copies "@SuperBot" from its own past replies (a components-v2 bot's
 * nickname), and a plain "@name" neither links nor notifies. Rewriting every
 * known alias - nick, global name, username - is what makes the mention work,
 * without the model having to reproduce an 18-digit id.
 */
function linkifyPlainMentions( content: string, participants: Participant[] ): string {
    if ( !content.includes( "@" ) ) {
        return content;
    }

    const aliases = participants
        .flatMap( ( person ) => person.aliases.map( ( alias ) => ( { alias, id: person.id } ) ) )
        .filter( ( entry ) => entry.alias.trim().length )
        // Longest first so "@Superuser" is never half-matched by a shorter alias.
        .sort( ( a, b ) => b.alias.length - a.alias.length );

    let out = content;

    for ( const { alias, id } of aliases ) {
        const escaped = alias.replace( /[.*+?^${}()|[\]\\]/g, "\\$&" );

        // Skip when a word char or "#" follows, so "@SuperBot" matches but
        // "@SuperBotFoo" and an old-style "@name#1234" do not.
        out = out.replace( new RegExp( `@${ escaped }(?![\\w#])`, "gi" ), `<@${ id }>` );
    }

    return out;
}

async function fetchHistory( client: Client, message: Message ): Promise<{ messages: OllamaMessage[]; participants: Participant[] }> {
    const maxMessages = AIConfig.$.getHistoryLimit();
    const maxChars = AIConfig.$.getHistoryMaxChars();

    const collected: OllamaMessage[] = [];
    const speakers = new Map<string, Participant>();

    let before = message.id;
    let usedChars = 0;

    const roster = (): Participant[] => [ ...speakers.values() ].slice( 0, MAX_PARTICIPANTS );

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

            const isSelf = entry.author.id === client.user?.id;

            // The roster comes from every author - even a components-v2 bot whose
            // `content` is empty - so the model can still mention them by tag.
            if ( !isSelf && !speakers.has( entry.author.id ) ) {
                speakers.set( entry.author.id, {
                    id: entry.author.id,
                    name: entry.member?.displayName ?? entry.author.displayName,
                    aliases: nameAliases( entry )
                } );
            }

            // A components-v2 bot leaves `content` empty, so read its text out of
            // the component tree - otherwise its side of the chat is invisible.
            const entryText = isSelf ? entry.content : messageText( entry );

            if ( !entryText.trim().length ) {
                continue;
            }

            // Our own replies carry a usage footer; the model must never see it or
            // it will start writing its own. Others are prefixed with the name they
            // are shown as (nickname), so the model refers to them the same way.
            const content = isSelf
                ? AIService.$.stripUsageFooter( entryText )
                : `${ entry.member?.displayName ?? entry.author.displayName }: ${ entryText }`;

            if ( usedChars + content.length > maxChars ) {
                GlobalLogger.$.debug(
                    fetchHistory,
                    `History budget reached at '${ collected.length }' messages ('${ usedChars }' chars)`
                );

                return { messages: collected.reverse(), participants: roster() };
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

    return { messages: collected.reverse(), participants: roster() };
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
