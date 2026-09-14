import { pickRoleButtons } from "@vertix.gg/bot/src/utils/dynamic-channel-buttons";

const GUILD_ID = "guild-1",
    HIGHER_ROLE = "role-higher",
    LOWER_ROLE = "role-lower",
    PLAIN_ROLE = "role-plain";

describe( "VertixBot/Utils/DynamicChannelButtons", () => {

    describe( "pickRoleButtons", () => {
        it( "should return the set of the only role carrying one", () => {
            const result = pickRoleButtons(
                { [ HIGHER_ROLE ]: [ "1", "2" ] },
                [ HIGHER_ROLE, PLAIN_ROLE ],
                GUILD_ID
            );

            expect( result ).toEqual( [ "1", "2" ] );
        } );

        // The roles arrive highest first, so the first match is the highest role that carries a
        // set - the whole reason the caller sorts them before asking.
        it( "should return the highest role's set when more than one carries one", () => {
            const result = pickRoleButtons(
                {
                    [ HIGHER_ROLE ]: [ "1" ],
                    [ LOWER_ROLE ]: [ "2" ]
                },
                [ HIGHER_ROLE, LOWER_ROLE ],
                GUILD_ID
            );

            expect( result ).toEqual( [ "1" ] );
        } );

        // A role set stands in place of the default rather than adding to it, so two roles are
        // never summed - an owner holding both gets one of them, not four buttons.
        it( "should not combine the sets of two roles", () => {
            const result = pickRoleButtons(
                {
                    [ HIGHER_ROLE ]: [ "1", "2" ],
                    [ LOWER_ROLE ]: [ "3", "4" ]
                },
                [ HIGHER_ROLE, LOWER_ROLE ],
                GUILD_ID
            );

            expect( result ).toEqual( [ "1", "2" ] );
        } );

        // An empty entry is a set that was removed, not a set of no buttons - so it is passed over
        // and the next role down decides.
        it( "should pass over an emptied set and take the next role's", () => {
            const result = pickRoleButtons(
                {
                    [ HIGHER_ROLE ]: [],
                    [ LOWER_ROLE ]: [ "2" ]
                },
                [ HIGHER_ROLE, LOWER_ROLE ],
                GUILD_ID
            );

            expect( result ).toEqual( [ "2" ] );
        } );

        // discord.js seeds every member's role cache with `@everyone` under the guild's own id, so
        // a set stored there would match every owner alive and leave the default unreachable.
        it( "should ignore a set stored against the everyone role", () => {
            const result = pickRoleButtons(
                { [ GUILD_ID ]: [ "1" ] },
                [ PLAIN_ROLE, GUILD_ID ],
                GUILD_ID
            );

            expect( result ).toBeUndefined();
        } );

        it( "should ignore the everyone role but still answer a real one below it", () => {
            const result = pickRoleButtons(
                {
                    [ GUILD_ID ]: [ "1" ],
                    [ LOWER_ROLE ]: [ "2" ]
                },
                [ GUILD_ID, LOWER_ROLE ],
                GUILD_ID
            );

            expect( result ).toEqual( [ "2" ] );
        } );

        it( "should answer nothing when no role of the owner's carries a set", () => {
            const result = pickRoleButtons(
                { [ HIGHER_ROLE ]: [ "1" ] },
                [ PLAIN_ROLE ],
                GUILD_ID
            );

            expect( result ).toBeUndefined();
        } );

        it( "should answer nothing for an owner with no roles at all", () => {
            expect( pickRoleButtons( { [ HIGHER_ROLE ]: [ "1" ] }, [], GUILD_ID ) ).toBeUndefined();
        } );

        it( "should answer nothing when no role has ever been given a set", () => {
            expect( pickRoleButtons( {}, [ HIGHER_ROLE ], GUILD_ID ) ).toBeUndefined();
            expect( pickRoleButtons( undefined, [ HIGHER_ROLE ], GUILD_ID ) ).toBeUndefined();
        } );

        // One caller resolves the guild from the channel and can come up without one. Nothing is
        // skipped then, which is what that caller did before it asked this function.
        it( "should skip nothing when the guild is unknown", () => {
            const result = pickRoleButtons(
                { [ GUILD_ID ]: [ "1" ] },
                [ GUILD_ID ],
                undefined
            );

            expect( result ).toEqual( [ "1" ] );
        } );
    } );
} );
