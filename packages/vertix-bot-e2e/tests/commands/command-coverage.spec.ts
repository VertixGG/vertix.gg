import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";

/**
 * A command nobody drives is a command nobody is testing.
 *
 * `/voice` and `/manage` are covered by loops over the definitions, so those two groups cannot fall
 * behind. The flat commands are named one at a time, and this is what notices when one is added - or,
 * as happened, when one moves: `/knock` was a flat command and is now `/voice knock`.
 */
const COVERED_GENERAL_COMMANDS = [ "/setup", "/help", "/welcome" ];

/**
 * Stated as what the suite can satisfy rather than as what the bot declares.
 *
 * Asserting the exact set breaks when a tier is retired - `in-channel` was, and this test failed for a
 * change that cost the suite nothing. What actually matters is the other direction: a tier the suite
 * has no way to arrange would leave its commands untested while the loops still looked green.
 */
const SATISFIABLE_TIERS = [ "admin", "any", "in-channel", "owner" ];

test.describe( "command coverage", () => {
    test( "every command outside a group has a test of its own", async() => {
        const declared = BotCatalog.$.commandsOfGroup( null ).map( ( command ) => command.fullName );

        expect( declared.sort() ).toEqual( [ ...COVERED_GENERAL_COMMANDS ].sort() );
    } );

    test( "every command declares a tier the suite knows how to satisfy", async() => {
        const declared = [ ...new Set( BotCatalog.$.commands.map( ( command ) => command.tier ) ) ];

        const unsupported = declared.filter( ( tier ) => ! SATISFIABLE_TIERS.includes( tier ) );

        expect( unsupported, "the suite has no way to arrange these tiers" ).toEqual( [] );
    } );
} );
