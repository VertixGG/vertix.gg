import { jest } from "@jest/globals";

import { GlobalLogger } from "@vertix.gg/bot/src/global-logger";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { COMMAND_TIERS } from "@vertix.gg/bot/src/commands/base/command-tiers";
import { passesCommandTier } from "@vertix.gg/bot/src/commands/base/command-tier-gate";

import { getShown } from "@vertix.gg/bot/test/__test_utils__/harness";
import { aCommandInteraction, withRecordingUIService } from "@vertix.gg/bot/test/__test_utils__/run-command";

/**
 * A server that added the bot with no permissions at all - which is how list reviewers add it.
 *
 * `/voice` cannot do anything there and says so. `/help` only describes the bot, and answering it
 * with "missing permissions" is how the bot met its reviewers: top.gg declined it for that.
 */

const asInstance = <T>( fake: object ): T => fake as T;

const MISSING_PERMISSIONS = "VertixGUI/InternalAdapters/MissingPermissionsAdapter";

describe( "VertixBot/Commands/TierGate", () => {
    beforeEach( () => {
        withRecordingUIService();

        jest.spyOn( PermissionsManager, "$", "get" ).mockReturnValue( asInstance( {
            isSelfAdministratorRole: () => false,
            getMissingPermissions: () => [ "ManageChannels", "MoveMembers" ]
        } ) );

        jest.spyOn( GlobalLogger, "$", "get" ).mockReturnValue( asInstance( {
            admin: () => undefined,
            log: () => undefined
        } ) );
    } );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should let a public command through while the bot holds no permissions", async() => {
        // Arrange.
        const interaction = aCommandInteraction( { commandName: "help", userId: "member-1", channelId: "text-1" } );

        // Act.
        const passes = await passesCommandTier( COMMAND_TIERS.PUBLIC, interaction, null );

        // Assert.
        expect( passes ).toBe( true );
        expect( getShown() ).toEqual( { kind: "nothing" } );
    } );

    it( "should refuse a command for anyone while the bot holds no permissions, and say why", async() => {
        // Arrange.
        const interaction = aCommandInteraction( { commandName: "voice", subcommand: "knock", userId: "member-1", channelId: "text-1" } );

        // Act.
        const passes = await passesCommandTier( COMMAND_TIERS.ANY, interaction, null );

        // Assert.
        expect( passes ).toBe( false );
        expect( getShown() ).toEqual( expect.objectContaining( { kind: "screen", adapter: MISSING_PERMISSIONS } ) );
    } );
} );
