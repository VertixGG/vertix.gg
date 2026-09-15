import { jest } from "@jest/globals";

import { createCommandGroup, createAdapterCommand } from "@vertix.gg/bot/src/commands/base/command-builder";

import { VOICE_COMMAND_GROUP } from "@vertix.gg/bot/src/commands/definitions/voice-commands";
import { GENERAL_COMMAND_DEFINITIONS } from "@vertix.gg/bot/src/commands/definitions/general-commands";

import { getShown, resetShown } from "@vertix.gg/bot/test/__test_utils__/harness";
import { withRecordingUIService } from "@vertix.gg/bot/test/__test_utils__/run-command";

import type { Client, CommandInteraction } from "discord.js";

/**
 * A command typed into the bot's own DM.
 *
 * Every one of these is about a voice channel or a server's configuration, and a DM has neither -
 * so the interaction arrives with no guild, no member and no channel. The first thing to read one
 * of those threw, and what a member got for asking was discord's own bare red line rather than
 * anything the bot had to say.
 *
 * They are still offered there on purpose. Somebody who types `/voice rename` into the wrong place
 * is better told where it belongs than left to wonder why it does not exist, and that telling is
 * what this asserts.
 */

const NOT_IN_A_SERVER = "VertixBot/UI-General/NotInAServerAdapter";

/** What discord hands the bot for a command sent in a DM: no guild, and nothing hanging off one. */
const aDirectMessageInteraction = () => ( {
    id: "interaction-dm",
    guildId: null,
    guild: null,
    member: null,
    channelId: "dm-1",
    commandName: "voice",
    user: { id: "member-1", username: "member-1" },
    replied: false,
    deferred: false,

    isCommand: () => true,
    isChatInputCommand: () => true,
    isMessageComponent: () => false,
    isModalSubmit: () => false,

    options: {
        getSubcommand: () => "rename"
    },

    reply: async() => undefined
} ) as unknown as CommandInteraction<"cached">;

describe( "VertixBot/Commands/InDirectMessage", () => {
    beforeEach( () => {
        resetShown();
        withRecordingUIService();
    } );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should tell a subcommand's caller to run it in a server", async() => {
        const voice = createCommandGroup( VOICE_COMMAND_GROUP );

        await voice.run( {} as Client, aDirectMessageInteraction() );

        expect( getShown() ).toEqual( { kind: "screen", adapter: NOT_IN_A_SERVER, args: undefined } );
    } );

    it( "should tell a standalone command's caller the same", async() => {
        const welcome = createAdapterCommand(
            GENERAL_COMMAND_DEFINITIONS.find( ( definition ) => "welcome" === definition.name )!
        );

        await welcome.run( {} as Client, aDirectMessageInteraction() );

        expect( getShown() ).toEqual( { kind: "screen", adapter: NOT_IN_A_SERVER, args: undefined } );
    } );

    /**
     * And that it is the first thing either does. A guard that ran after the channel was resolved
     * would have thrown on the way there, which is the whole bug.
     */
    it( "should answer before anything reads the guild", async() => {
        const interaction = aDirectMessageInteraction();

        Object.defineProperty( interaction, "guild", {
            get: () => {
                throw new Error( "read the guild in a direct message" );
            }
        } );

        const voice = createCommandGroup( VOICE_COMMAND_GROUP );

        await expect( voice.run( {} as Client, interaction ) ).resolves.toBeUndefined();
    } );
} );
