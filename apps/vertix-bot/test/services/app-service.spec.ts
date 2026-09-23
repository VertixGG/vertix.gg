import { jest } from "@jest/globals";

import { ApplicationCommandType, PermissionsBitField } from "discord.js";

import { SHARD_COUNT_ENV_KEY, SHARD_IDS_ENV_KEY } from "@vertix.gg/bot/src/definitions/sharding";

import type { ICommand } from "@vertix.gg/bot/src/interfaces/command";

const APPLICATION_ID = "1538844311062581339";

/**
 * A command the way the builders make one: a description that can change, a permission that is a
 * bigint - which JSON refuses outright - and a `run` that is a function.
 */
function aCommand( description = "Set up a dynamic channel generator" ): ICommand {
    return {
        name: "setup",
        description,
        type: ApplicationCommandType.ChatInput,
        defaultMemberPermissions: [ PermissionsBitField.Flags.ManageGuild ],
        run: () => {}
    };
}

/**
 * Stands up only what `registerCommands()` reaches for: the stored registration, and the one call to
 * discord that sends the set. What is recorded is what was sent and what was remembered.
 */
async function makeService( registered: string | null | Error ) {
    const { AppService } = await import( "@vertix.gg/bot/src/services/app-service" );
    const { CommandsRegistrationModel } = await import( "@vertix.gg/data/src/models/commands-registration-model" );

    const recorded = {
        reads: 0,
        sent: [] as ICommand[][],
        stored: [] as { applicationId: string; hash: string }[]
    };

    jest.spyOn( CommandsRegistrationModel.$, "getRegisteredHash" ).mockImplementation( async() => {
        recorded.reads++;

        if ( registered instanceof Error ) {
            throw registered;
        }

        return registered;
    } );

    jest.spyOn( CommandsRegistrationModel.$, "setRegisteredHash" ).mockImplementation( async( applicationId, hash ) => {
        recorded.stored.push( { applicationId, hash } );
    } );

    const client = {
        application: {
            id: APPLICATION_ID,
            commands: {
                set: async( commands: ICommand[] ) => {
                    recorded.sent.push( commands );
                }
            }
        }
    };

    const service = Object.create( AppService.prototype ) as InstanceType<typeof AppService>;

    Object.assign( service, {
        logger: { log: () => {}, info: () => {}, warn: () => {}, error: () => {} }
    } );

    const register = ( commands: ICommand[] ) => service[ "registerCommands" ]( client as never, commands );

    return { register, recorded };
}

/**
 * Registers a set once, the way the first start after this change finds every application, and hands
 * back the hash it remembered - which is what the next start compares against.
 */
async function registeredHashOf( commands: ICommand[] ) {
    const { register, recorded } = await makeService( null );

    await register( commands );

    return recorded.stored[ 0 ].hash;
}

/**
 * Every restart used to send the whole set, from both shards, and wait on discord before counting
 * as ready - thirty-seven seconds once, when the route's rate limit was reached by deploys minutes
 * apart.
 */
describe( "VertixBot/Services/App - slash command registration", () => {
    const originalCount = process.env[ SHARD_COUNT_ENV_KEY ],
        originalIds = process.env[ SHARD_IDS_ENV_KEY ];

    beforeEach( () => {
        delete process.env[ SHARD_COUNT_ENV_KEY ];
        delete process.env[ SHARD_IDS_ENV_KEY ];
    } );

    afterEach( () => {
        jest.restoreAllMocks();

        if ( undefined === originalCount ) {
            delete process.env[ SHARD_COUNT_ENV_KEY ];
        } else {
            process.env[ SHARD_COUNT_ENV_KEY ] = originalCount;
        }

        if ( undefined === originalIds ) {
            delete process.env[ SHARD_IDS_ENV_KEY ];
        } else {
            process.env[ SHARD_IDS_ENV_KEY ] = originalIds;
        }
    } );

    it( "should send the set and remember it when nothing was registered before", async() => {
        // Arrange.
        const commands = [ aCommand() ],
            { register, recorded } = await makeService( null );

        // Act.
        await register( commands );

        // Assert.
        expect( recorded.sent ).toEqual( [ commands ] );
        expect( recorded.stored ).toEqual( [ { applicationId: APPLICATION_ID, hash: expect.any( String ) } ] );
    } );

    it( "should not send a set discord was already sent", async() => {
        // Arrange.
        const hash = await registeredHashOf( [ aCommand() ] );

        const { register, recorded } = await makeService( hash );

        // Act.
        await register( [ aCommand() ] );

        // Assert - nothing asked of discord, and nothing written.
        expect( recorded.sent ).toEqual( [] );
        expect( recorded.stored ).toEqual( [] );
    } );

    it( "should send the set again once a command in it changed", async() => {
        // Arrange.
        const hash = await registeredHashOf( [ aCommand() ] ),
            changed = [ aCommand( "Set up a generator for dynamic channels" ) ];

        const { register, recorded } = await makeService( hash );

        // Act.
        await register( changed );

        // Assert.
        expect( recorded.sent ).toEqual( [ changed ] );
        expect( recorded.stored ).toHaveLength( 1 );
        expect( recorded.stored[ 0 ].hash ).not.toBe( hash );
    } );

    // Global commands belong to the application, not to a shard: two processes starting together
    // would both see the same change and both send it.
    it( "should leave the set to the process that owns singleton work", async() => {
        // Arrange.
        process.env[ SHARD_COUNT_ENV_KEY ] = "2";
        process.env[ SHARD_IDS_ENV_KEY ] = "1";

        const { register, recorded } = await makeService( null );

        // Act.
        await register( [ aCommand() ] );

        // Assert.
        expect( recorded.reads ).toBe( 0 );
        expect( recorded.sent ).toEqual( [] );
        expect( recorded.stored ).toEqual( [] );
    } );

    // What every start did before - so a store that cannot be read costs a send, not a missing set.
    it( "should still send the set when what was registered cannot be read", async() => {
        // Arrange.
        const commands = [ aCommand() ],
            { register, recorded } = await makeService( new Error( "database unavailable" ) );

        // Act.
        await register( commands );

        // Assert.
        expect( recorded.sent ).toEqual( [ commands ] );
    } );
} );
