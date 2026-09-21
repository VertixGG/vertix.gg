import { jest } from "@jest/globals";

import { VoiceRoleManager } from "@vertix.gg/bot/src/managers/voice-role-manager";

import type { Guild } from "discord.js";

/**
 * A guild is only ever asked for its id here, because `reconcileGuild()` is replaced in every test.
 *
 * What is under test is the gate in front of it - how many times it runs, and whether a failure
 * leaves the guild able to try again - not the reconcile itself.
 */
function aGuild( id: string ): Guild {
    return { id, name: `guild-${ id }` } as unknown as Guild;
}

/**
 * Each test uses an id of its own.
 *
 * `VoiceRoleManager` is a singleton and the map of reconciled guilds is deliberately process-wide,
 * so there is nothing to reset between tests - a fresh id is the isolation.
 */
let nextGuildId = 0;

const anUnseenGuild = () => aGuild( `guild-${ ++nextGuildId }` );

describe( "VertixBot/Managers/VoiceRole", () => {
    afterEach( () => {
        jest.restoreAllMocks();
    } );

    describe( "ensureGuildReconciled()", () => {
        it( "should reconcile a guild the first time it is asked", async() => {
            const guild = anUnseenGuild(),
                reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                    .mockResolvedValue( undefined );

            await VoiceRoleManager.$.ensureGuildReconciled( guild );

            expect( reconcile ).toHaveBeenCalledTimes( 1 );
            expect( reconcile ).toHaveBeenCalledWith( guild );
        } );

        // The whole point of moving this off startup: a guild pays for it once, on first use, not
        // once per process-start for every guild the bot is in.
        it( "should not reconcile the same guild twice", async() => {
            const guild = anUnseenGuild(),
                reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                    .mockResolvedValue( undefined );

            await VoiceRoleManager.$.ensureGuildReconciled( guild );
            await VoiceRoleManager.$.ensureGuildReconciled( guild );
            await VoiceRoleManager.$.ensureGuildReconciled( guild );

            expect( reconcile ).toHaveBeenCalledTimes( 1 );
        } );

        // Several people joining at once is the normal way a guild wakes up, and every one of those
        // joins calls this. Holding the promise rather than a flag is what keeps that one reconcile.
        it( "should fold concurrent callers into one reconcile", async() => {
            const guild = anUnseenGuild();

            let release: () => void = () => {};

            const reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                .mockImplementation( () => new Promise<void>( ( resolve ) => {
                    release = resolve;
                } ) );

            const callers = [
                VoiceRoleManager.$.ensureGuildReconciled( guild ),
                VoiceRoleManager.$.ensureGuildReconciled( guild ),
                VoiceRoleManager.$.ensureGuildReconciled( guild )
            ];

            release();

            await Promise.all( callers );

            expect( reconcile ).toHaveBeenCalledTimes( 1 );
        } );

        // A guild left un-reconciled goes on handing out a role nobody should hold, so a failure
        // must not be remembered as success.
        it( "should try again after a failed reconcile", async() => {
            const guild = anUnseenGuild(),
                reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                    .mockRejectedValueOnce( new Error( "discord said no" ) )
                    .mockResolvedValue( undefined );

            await VoiceRoleManager.$.ensureGuildReconciled( guild );
            await VoiceRoleManager.$.ensureGuildReconciled( guild );

            expect( reconcile ).toHaveBeenCalledTimes( 2 );
        } );

        it( "should not reject when the reconcile fails", async() => {
            const guild = anUnseenGuild();

            jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                .mockRejectedValue( new Error( "discord said no" ) );

            await expect( VoiceRoleManager.$.ensureGuildReconciled( guild ) ).resolves.toBeUndefined();
        } );

        it( "should keep guilds apart", async() => {
            const first = anUnseenGuild(),
                second = anUnseenGuild(),
                reconcile = jest.spyOn( VoiceRoleManager.$, "reconcileGuild" )
                    .mockResolvedValue( undefined );

            await VoiceRoleManager.$.ensureGuildReconciled( first );
            await VoiceRoleManager.$.ensureGuildReconciled( second );

            expect( reconcile ).toHaveBeenCalledTimes( 2 );
        } );
    } );
} );
