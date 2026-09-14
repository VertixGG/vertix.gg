import { Events } from "discord.js";

import { AIChannelPromptModel } from "@vertix.gg/data/src/models/ai-channel-prompt-model";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";
import { AgentManager } from "@vertix.gg/bot/src/managers/agent-manager";

import {
    buildPublicChannelPrompt,
    CHANNEL_PROMPT_EXTRA_TOOLS,
    takePublicSession
} from "@vertix.gg/bot/src/listeners/mention-handler-public";

import type { Client, GuildMember } from "discord.js";

/**
 * Wakes the channels that asked to hear about people joining.
 *
 * The mention handlers only ever run when somebody talks to the bot, so a channel prompt written
 * around "when a user newly enters the guild" described something that could never happen. This is
 * the event that makes that sentence true.
 *
 * Runs at the same reach as a public mention - read-only plus the challenge tools - because the
 * person it is acting on is a stranger who has been in the server for a second.
 */
export function memberJoinHandler( client: Client ) {
    client.on( Events.GuildMemberAdd, async( member ) => {
        await handleJoin( member ).catch( ( error: unknown ) => {
            GlobalLogger.$.error( memberJoinHandler, "[JOIN] Failed handling a member join", error );
        } );
    } );

    GlobalLogger.$.log( memberJoinHandler, "[JOIN] Listening for members joining" );
}

async function handleJoin( member: GuildMember ): Promise<void> {
    if ( member.user.bot ) {
        return;
    }

    const channels = await AIChannelPromptModel.$.findJoinChannels( member.guild.id );

    if ( ! channels.length ) {
        return;
    }

    GlobalLogger.$.log(
        handleJoin,
        `[JOIN] ${ member.user.username } joined ${ member.guild.name } - waking '${ channels.length }' channel(s)`
    );

    for ( const channel of channels ) {
        await greetIn( member, channel.channelId ).catch( ( error: unknown ) => {
            GlobalLogger.$.error( handleJoin, `[JOIN] Failed greeting in '${ channel.channelId }'`, error );
        } );
    }
}

async function greetIn( member: GuildMember, channelId: string ): Promise<void> {
    const channel = await member.client.channels.fetch( channelId ).catch( () => null );

    if ( ! channel?.isTextBased() || ! ( "send" in channel ) ) {
        return;
    }

    const session = takePublicSession( member.guild.id, channelId );

    // Told as an event rather than as something they said, so the bot does not answer a message
    // nobody wrote - and given their id, because every tool it might reach for takes one.
    const event = [
        `[Member joined] ${ member.user.username } (<@${ member.id }>, id: ${ member.id }) just joined`,
        `${ member.guild.name }. Act on this however the instructions for this channel say you should.`,
        "Speak to them directly in this channel. If they need to do nothing, say nothing."
    ].join( " " );

    const context = [
        "Context:",
        `- Guild: ${ member.guild.name } (ID: ${ member.guild.id })`,
        `- Channel: (ID: ${ channelId })`,
        `- New member: ${ member.user.username } (ID: ${ member.id })`
    ].join( "\n" );

    const isNewSession = ! session.conversationId;

    const prompt = isNewSession
        ? `${ await buildPublicChannelPrompt( channelId, member.client.user?.username ?? "an AI assistant" ) }\n\n${ context }\n\n${ event }`
        : `${ context }\n\n${ event }`;

    const { response, conversationId } = await AgentManager.$.runChat( prompt, {
        conversationId: session.conversationId,
        readOnly: true,
        model: AgentManager.$.getPublicModel(),
        extraTools: CHANNEL_PROMPT_EXTRA_TOOLS,
        caller: {
            guildId: member.guild.id,
            channelId,
            userId: member.id
        }
    } );

    if ( conversationId ) {
        session.conversationId = conversationId;
    }

    // A turn that only posted a challenge has nothing left to say, and Discord rejects empty
    // content - the image is already the greeting.
    if ( response.trim() ) {
        await channel.send( response );
    }

    GlobalLogger.$.log( greetIn, `[JOIN] ${ response.trim() ? "Greeted" : "Acted without a text reply" } in '${ channelId }'` );
}

export default memberJoinHandler;
