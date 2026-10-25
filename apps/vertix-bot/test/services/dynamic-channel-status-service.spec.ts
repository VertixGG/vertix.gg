import { jest } from "@jest/globals";

import { PermissionsBitField, Routes } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import type { DynamicChannelStatusService } from "@vertix.gg/bot/src/services/dynamic-channel-status-service";

const GUILD_ID = "820000000000000001",
    CHANNEL_ID = "840000000000000001";

const noop = () => {};

/**
 * Stands up the service in front of one voice channel, holding what the bot was granted there.
 *
 * Built off the prototype, as the lobby spec does: the constructor reaches for the config manager,
 * and nothing `write()` does needs it. The channel answers `permissionsFor()` with the granted set
 * and records what reaches discord.
 */
async function makeService( granted: bigint | "no-member" ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const { DynamicChannelStatusService } = await import( "@vertix.gg/bot/src/services/dynamic-channel-status-service" );

    const put = jest.fn( async() => undefined ),
        debug = jest.fn();

    const channel = {
        id: CHANNEL_ID,
        guildId: GUILD_ID,
        guild: { members: { me: "no-member" === granted ? null : { id: "800000000000000001" } } },
        permissionsFor: () => new PermissionsBitField( "no-member" === granted ? 0n : granted ),
        client: { rest: { put } }
    };

    const service = Object.create( DynamicChannelStatusService.prototype ) as DynamicChannelStatusService;

    Object.assign( service, {
        logger: { info: noop, log: noop, warn: noop, error: noop, admin: noop },
        debugger: { log: debug }
    } );

    // `write()` is private - the public writers are what call it - so it is reached as they do.
    const writer = service as unknown as { write( channel: unknown, status: string ): Promise<void> };

    return { write: ( status: string ) => writer.write( channel, status ), put, debug };
}

describe( "VertixBot/Services/DynamicChannelStatus", () => {
    describe( "write()", () => {
        it( "should not write where the bot lacks Set Voice Channel Status", async() => {
            // Arrange - everything the invite asked for until 2026-10-25, which did not include it.
            const { write, put, debug } = await makeService(
                PermissionsBitField.Flags.ManageChannels | PermissionsBitField.Flags.Connect
            );

            // Act.
            await write( "Valorant · 3/5" );

            // Assert.
            expect( put ).not.toHaveBeenCalled();
            expect( debug ).toHaveBeenCalledWith(
                expect.anything(),
                expect.stringContaining( "Missing Set Voice Channel Status" )
            );
        } );

        it( "should write where the bot holds it", async() => {
            // Arrange.
            const { write, put } = await makeService( PermissionsBitField.Flags.SetVoiceChannelStatus );

            // Act.
            await write( "Valorant · 3/5" );

            // Assert.
            expect( put ).toHaveBeenCalledWith(
                `${ Routes.channel( CHANNEL_ID ) }/voice-status`,
                { body: { status: "Valorant · 3/5" } }
            );
        } );

        it( "should leave the answer to discord when the bot's own member is not cached", async() => {
            // Arrange.
            const { write, put } = await makeService( "no-member" );

            // Act.
            await write( "" );

            // Assert.
            expect( put ).toHaveBeenCalledTimes( 1 );
        } );
    } );
} );
