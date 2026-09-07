import { Events, GatewayIntentBits } from "discord.js";

import type { E_AI_TRIGGER_EVENT } from "@vertix.gg/prisma/._ai-client-internal";

export type TriggerEventDefinition = {
    /** Shown in the select menu. */
    label: string;
    description: string;
    emoji: string;
    /** The discord.js event this listens to. */
    event: ( typeof Events )[ keyof typeof Events ];
    /** Intents the client must request for the event to ever fire. */
    intents: GatewayIntentBits[];
    /** Discord requires these to be switched on for the application itself. */
    privileged: boolean;
};

/**
 * Every event the AI can be woken by, and what it costs to enable.
 *
 * The `intents` are why this table exists rather than a bare enum: an event with
 * a missing intent never fires and never errors, so the bot would look broken
 * with nothing in the logs.
 */
export const TRIGGER_EVENT_DEFINITIONS: Record<E_AI_TRIGGER_EVENT, TriggerEventDefinition> = {
    MESSAGE_MENTION: {
        label: "Bot is mentioned",
        description: "Someone @mentions the bot anywhere",
        emoji: "💬",
        event: Events.MessageCreate,
        intents: [ GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ],
        privileged: true
    },
    MESSAGE_IN_CHANNEL: {
        label: "Any message in chosen channels",
        description: "Every message in the channels selected below",
        emoji: "📻",
        event: Events.MessageCreate,
        intents: [ GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ],
        privileged: true
    },
    MESSAGE_EDIT: {
        label: "Message edited",
        description: "A message was changed after posting",
        emoji: "✏️",
        event: Events.MessageUpdate,
        intents: [ GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ],
        privileged: true
    },
    MESSAGE_DELETE: {
        label: "Message deleted",
        description: "A message was removed",
        emoji: "🗑️",
        event: Events.MessageDelete,
        intents: [ GatewayIntentBits.GuildMessages ],
        privileged: false
    },
    MEMBER_JOIN: {
        label: "Member joined",
        description: "Someone joined the server",
        emoji: "👋",
        event: Events.GuildMemberAdd,
        intents: [ GatewayIntentBits.GuildMembers ],
        privileged: true
    },
    MEMBER_LEAVE: {
        label: "Member left",
        description: "Someone left or was kicked",
        emoji: "🚪",
        event: Events.GuildMemberRemove,
        intents: [ GatewayIntentBits.GuildMembers ],
        privileged: true
    },
    MEMBER_BAN: {
        label: "Member banned",
        description: "Someone was banned from the server",
        emoji: "🔨",
        event: Events.GuildBanAdd,
        intents: [ GatewayIntentBits.GuildModeration ],
        privileged: false
    },
    CHANNEL_CREATE: {
        label: "Channel created",
        description: "A channel was added",
        emoji: "📁",
        event: Events.ChannelCreate,
        intents: [ GatewayIntentBits.Guilds ],
        privileged: false
    },
    CHANNEL_DELETE: {
        label: "Channel deleted",
        description: "A channel was removed",
        emoji: "📂",
        event: Events.ChannelDelete,
        intents: [ GatewayIntentBits.Guilds ],
        privileged: false
    },
    VOICE_JOIN: {
        label: "Joined voice",
        description: "Someone joined a voice channel",
        emoji: "🔊",
        event: Events.VoiceStateUpdate,
        intents: [ GatewayIntentBits.GuildVoiceStates ],
        privileged: false
    },
    VOICE_LEAVE: {
        label: "Left voice",
        description: "Someone left a voice channel",
        emoji: "🔈",
        event: Events.VoiceStateUpdate,
        intents: [ GatewayIntentBits.GuildVoiceStates ],
        privileged: false
    }
};

export const ALL_TRIGGER_EVENTS = Object.keys( TRIGGER_EVENT_DEFINITIONS ) as E_AI_TRIGGER_EVENT[];

export function isTriggerEvent( value: string ): value is E_AI_TRIGGER_EVENT {
    return Object.prototype.hasOwnProperty.call( TRIGGER_EVENT_DEFINITIONS, value );
}

/** Union of every intent any event needs - what the client must request up front. */
export function getRequiredIntents(): GatewayIntentBits[] {
    const intents = new Set<GatewayIntentBits>();

    for ( const definition of Object.values( TRIGGER_EVENT_DEFINITIONS ) ) {
        definition.intents.forEach( ( intent ) => intents.add( intent ) );
    }

    return [ ...intents ];
}
