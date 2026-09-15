import { jest } from "@jest/globals";

import { PrismaBot } from "@vertix.gg/prisma/bot-client";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { ChannelType } from "discord.js";

/**
 * Discord's part in a test.
 *
 * The bot only ever meets discord as an object handed to its interaction handler, so a test can
 * play that part: build the object, let the bot's own code run - the bridge, the gate, the adapters
 * - and read back what it tried to say. No token, no network, no account.
 *
 * What this does not do is draw anything. It answers "did the right interface open, with the right
 * arguments", which is where every command bug so far has been, and says nothing about how discord
 * renders the result.
 */

export interface HarnessChannel {
    channelId: string;
    name: string;
    type: ChannelType;
    internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES;
    userOwnerId: string;
    createdAtDiscord: number;
    ownerChannelId: string | null;
    version: string;
}

/** What the bot tried to put in front of the member. */
export type ShownResult =
    | { kind: "modal"; name: string }
    | { kind: "screen"; adapter: string; args?: Record<string, unknown> }
    | { kind: "nothing" };

let channels: HarnessChannel[] = [];
let worldVersion = "0.0.0.3";
let shown: ShownResult = { kind: "nothing" };

export const V3_VERSION = "0.0.0.3",
    V2_VERSION = "0.0.0.2";

/**
 * Function aGuild() :: The world a test runs in.
 *
 * A generator and whatever channels it made, as rows - which is all the bot reads them as. Given to
 * `ChannelModel` by spying on its singleton accessor, the way the service locator is already faked
 * for tests here.
 */
export function aGuild( options: {
    generatorId?: string;
    version?: string;
    dynamicChannels?: Array<{ id: string; ownerId: string; name?: string }>;
} = {} ) {
    const generatorId = options.generatorId ?? "generator-1",
        version = options.version ?? V3_VERSION;

    worldVersion = version;

    channels = [
        {
            channelId: generatorId,
            name: "➕ New Channel",
            type: ChannelType.GuildVoice,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            userOwnerId: "admin",
            ownerChannelId: null,
            createdAtDiscord: 1,
            version
        },
        ...( options.dynamicChannels ?? [] ).map( ( channel ) => ( {
            channelId: channel.id,
            name: channel.name ?? `${ channel.ownerId }'s Channel`,
            type: ChannelType.GuildVoice,
            internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL,
            userOwnerId: channel.ownerId,
            ownerChannelId: generatorId,
            createdAtDiscord: 2,
            version
        } ) )
    ];

    return { generatorId, channels };
}

export function getHarnessChannels() {
    return channels;
}

/**
 * Which interface the generator in this world runs. Read by the versioning service the harness
 * stands in for - the bot asks it, never the row, so the test answers where the bot asks.
 */
export function getWorldVersionNumber() {
    return V2_VERSION === worldVersion ? 2 : 3;
}

export function recordShown( result: ShownResult ) {
    shown = result;
}

export function getShown() {
    return shown;
}

export function resetShown() {
    shown = { kind: "nothing" };
}

/**
 * Function mockChannelModel() :: Hands the bot the world instead of the database.
 *
 * Spying on the singleton accessor rather than the module, which is how `ServiceLocatorMock` does
 * it here - the bot keeps importing `ChannelModel` exactly as it does in production.
 */
export function mockChannelModel() {
    const findById = ( channelId: string | null ) =>
        channels.find( ( channel ) => channel.channelId === channelId ) ?? null;

    const fake = {
        getByChannelId: async( channelId: string | null ) => findById( channelId ),

        getMasterByDynamicChannelId: async( dynamicChannelId: string ) => {
            const dynamic = findById( dynamicChannelId );

            return dynamic?.ownerChannelId ? findById( dynamic.ownerChannelId ) : null;
        },

        getDynamics: async() => channels.filter(
            ( channel ) => PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL === channel.internalType
        ),

        getMasters: async() => channels.filter(
            ( channel ) => PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL === channel.internalType
        )
    };

    jest.spyOn( ChannelModel, "$", "get" )
        .mockImplementation( () => fake as unknown as ChannelModel );
}
