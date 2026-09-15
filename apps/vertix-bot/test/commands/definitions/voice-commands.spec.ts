import { jest } from "@jest/globals";

import { openAdapterFromCommand } from "@vertix.gg/bot/src/commands/base/command-adapter-bridge";

import { COMMAND_TIERS } from "@vertix.gg/bot/src/commands/base/command-tiers";

import { VOICE_COMMAND_GROUP } from "@vertix.gg/bot/src/commands/definitions/voice-commands";

import {
    V2_VERSION,
    aGuild,
    getShown,
    mockChannelModel
} from "@vertix.gg/bot/test/__test_utils__/harness";

import { aCommandInteraction, withRecordingUIService } from "@vertix.gg/bot/test/__test_utils__/run-command";

import { COMMAND_HANDLERS } from "@vertix.gg/bot/src/commands/handlers";

import type { ICommandDefinition } from "@vertix.gg/bot/src/commands/definitions/command-definitions";

/**
 * Every `/voice` subcommand, driven through the bridge the way discord drives it.
 *
 * What is asserted is the rule each one was built to: that it opens the interface it is supposed
 * to, in the shape that feature needs - a modal for the ones that are typed, an entity's handler
 * for the ones whose work happens before anything is drawn, the screen itself for the rest.
 *
 * Every command bug this far was one of those three being wrong, and none of them could be seen
 * from a type or a name.
 */

const OWNER = "owner-1",
    MY_CHANNEL = "channel-1",
    A_TEXT_CHANNEL = "text-1";

/**
 * What each subcommand is expected to do, written out rather than read off the definitions.
 *
 * Deriving the expectation from the thing under test asserts nothing: a row that loses its
 * `modalName` simply stops matching the filter, the case disappears, and the suite stays green
 * while the command opens an empty adapter. That is exactly the bug this suite exists for, so the
 * expectation is stated here independently and the definitions are checked against it.
 */
const EXPECTED_SHAPE: Record<string, "modal" | "entity" | "screen" | "handler"> = {
    rename: "modal",
    limit: "modal",
    status: "modal",

    invite: "handler",
    transfer: "handler",
    templates: "handler",
    reset: "handler",
    "clear-chat": "handler",

    privacy: "screen",
    access: "screen",
    region: "screen",
    message: "screen",
    panel: "screen",

    claim: "handler",
    knock: "handler"
};

/**
 * Whether the command does something of its own rather than opening an interface.
 *
 * Read off the registry rather than listed here, so a command that grows a handler is not still
 * described as opening a screen. What it then does is not exercised below: a handler reaches for
 * the services this harness does not stand up, and asserting on a stub of them would only restate
 * the stub.
 */
const hasHandler = ( definition: ICommandDefinition ) => Boolean( COMMAND_HANDLERS[ definition.flowTransition ] );

const shapeOf = ( definition: ICommandDefinition ) => {
    if ( definition.modalName ) {
        return "modal";
    }

    if ( hasHandler( definition ) ) {
        return "handler";
    }

    return "screen";
};

const subcommandsBy = ( predicate: ( definition: ICommandDefinition ) => boolean ) =>
    VOICE_COMMAND_GROUP.subcommands.filter( predicate ).map( ( definition ) => [ definition.name, definition ] as const );

/**
 * The version tests run only over owner-tier rows.
 *
 * Which interface a command opens is decided from the channel it is about, and only an owner's
 * command finds one from a text channel - the rest are about somebody else's channel, or none, and
 * resolve through the service this harness does not stand up. `claim` is excluded for a reason of
 * its own: its tier is `in-channel`, so typed away from a channel the right answer is the sentence
 * saying where claiming happens, whatever version the generator runs.
 */
const versionedSubcommandsBy = ( predicate: ( definition: ICommandDefinition ) => boolean ) =>
    subcommandsBy( ( definition ) => COMMAND_TIERS.OWNER_OF_DYNAMIC === definition.tier && predicate( definition ) );

const runFromTextChannel = async( definition: ICommandDefinition ) => {
    const interaction = aCommandInteraction( {
        commandName: "voice",
        subcommand: definition.name,
        userId: OWNER,
        channelId: A_TEXT_CHANNEL
    } );

    await openAdapterFromCommand( { interaction, definition } );

    return getShown();
};

describe( "VertixBot/Commands/Voice", () => {
    beforeEach( () => {
        jest.restoreAllMocks();

        aGuild( { dynamicChannels: [ { id: MY_CHANNEL, ownerId: OWNER } ] } );

        mockChannelModel();
        withRecordingUIService();
    } );

    it( "should dispatch every subcommand the way its feature needs", () => {
        const actual = Object.fromEntries(
            VOICE_COMMAND_GROUP.subcommands.map( ( definition ) => [ definition.name, shapeOf( definition ) ] )
        );

        expect( actual ).toEqual( EXPECTED_SHAPE );
    } );

    it.each( subcommandsBy( ( definition ) => Boolean( definition.modalName ) ) )(
        "/voice %s should open its modal, because the feature is typed and its adapter draws nothing first",
        async( _name, definition ) => {
            expect( await runFromTextChannel( definition ) ).toEqual( {
                kind: "modal",
                name: definition.modalName
            } );
        }
    );

    it.each( subcommandsBy( ( definition ) =>
        ! definition.modalName && ! definition.executionStep && ! hasHandler( definition )
    ) )(
        "/voice %s should open its own screen, holding the channel it is about",
        async( _name, definition ) => {
            expect( await runFromTextChannel( definition ) ).toEqual( {
                kind: "screen",
                adapter: definition.adapterName,

                // Named on the args rather than left to the interaction. Every press after the
                // first arrives on the ephemeral rather than in the channel, and without this the
                // resolution falls back to wherever the member is sitting by then.
                args: { channelId: MY_CHANNEL }
            } );
        }
    );

    /**
     * Your rule: an owner's command means the channel they own, wherever they typed it. Typed from a
     * text channel, with no voice state at all, it still finds the channel and opens the interface -
     * rather than answering "you have no active dynamic channel" because the member was not sitting
     * in one at the time.
     */
    it( "should find the member's own channel from anywhere", async() => {
        const rename = VOICE_COMMAND_GROUP.subcommands.find( ( item ) => "rename" === item.name )!;

        expect( await runFromTextChannel( rename ) ).toEqual( {
            kind: "modal",
            name: "VertixBot/UI-V3/DynamicChannelRenameModal"
        } );
    } );

    /**
     * A v2 generator gets the v2 interface, named per row - the gap that left four commands opening
     * a v2 adapter whose handler never ran.
     */
    it.each( versionedSubcommandsBy( ( definition ) =>
        Boolean( definition.adapterNameV2 ) && ! hasHandler( definition )
    ) )(
        "/voice %s should reach v2 the same way it reaches v3",
        async( _name, definition ) => {
            aGuild( {
                version: V2_VERSION,
                dynamicChannels: [ { id: MY_CHANNEL, ownerId: OWNER } ]
            } );

            const shown = await runFromTextChannel( definition );

            if ( definition.modalNameV2 ) {
                expect( shown ).toEqual( { kind: "modal", name: definition.modalNameV2 } );

                return;
            }

            expect( shown ).toEqual( {
                kind: "screen",
                adapter: definition.adapterNameV2,
                args: { channelId: MY_CHANNEL }
            } );
        }
    );

    /**
     * A feature v2 never had says so, rather than opening a v3 interface onto a v2 channel.
     */
    it.each( versionedSubcommandsBy( ( definition ) => ! definition.adapterNameV2 ) )(
        "/voice %s should say it is not in the older interface",
        async( _name, definition ) => {
            aGuild( {
                version: V2_VERSION,
                dynamicChannels: [ { id: MY_CHANNEL, ownerId: OWNER } ]
            } );

            expect( await runFromTextChannel( definition ) ).toEqual( {
                kind: "screen",
                adapter: "VertixBot/UI-General/FeatureMissingInV2Adapter",
                args: undefined
            } );
        }
    );
} );
