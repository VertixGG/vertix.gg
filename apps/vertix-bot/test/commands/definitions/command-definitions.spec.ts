import { COMMAND_TIERS } from "@vertix.gg/bot/src/commands/base/command-tiers";
import { COMMAND_HANDLERS } from "@vertix.gg/bot/src/commands/handlers";

import {
    COMMAND_DEFINITIONS,
    COMMAND_GROUP_DEFINITIONS,
    getAllCommandDefinitions
} from "@vertix.gg/bot/src/commands/definitions";

import type { ICommandDefinition } from "@vertix.gg/bot/src/commands/definitions/command-definitions";

/**
 * The definitions are data, and every command bug this far has been a wrong or missing field in
 * them rather than broken logic - a command pointed at an adapter that draws nothing, a `v2`
 * counterpart named for one interface version and not the other. Data is cheap to check, and
 * none of this needs a guild.
 */

const ALL = getAllCommandDefinitions();

const DISCORD_MAX_SUBCOMMANDS = 25,
    DISCORD_MAX_DESCRIPTION = 100,
    DISCORD_NAME_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;

const describeRow = ( definition: ICommandDefinition ) => definition.flowTransition;

describe( "VertixBot/Commands/Definitions", () => {
    it( "should give discord names and descriptions it accepts", () => {
        for ( const definition of ALL ) {
            expect( definition.name ).toMatch( DISCORD_NAME_PATTERN );
            expect( definition.description.length ).toBeGreaterThan( 0 );
            expect( definition.description.length ).toBeLessThanOrEqual( DISCORD_MAX_DESCRIPTION );
        }

        for ( const group of COMMAND_GROUP_DEFINITIONS ) {
            expect( group.name ).toMatch( DISCORD_NAME_PATTERN );
            expect( group.description.length ).toBeLessThanOrEqual( DISCORD_MAX_DESCRIPTION );
            expect( group.subcommands.length ).toBeLessThanOrEqual( DISCORD_MAX_SUBCOMMANDS );
            expect( group.subcommands.length ).toBeGreaterThan( 0 );
        }
    } );

    it( "should name every command once", () => {
        const transitions = ALL.map( describeRow );

        expect( new Set( transitions ).size ).toBe( transitions.length );

        for ( const group of COMMAND_GROUP_DEFINITIONS ) {
            const names = group.subcommands.map( ( subcommand ) => subcommand.name );

            expect( new Set( names ).size ).toBe( names.length );
        }

        const standalone = COMMAND_DEFINITIONS.map( ( definition ) => definition.name );

        expect( new Set( standalone ).size ).toBe( standalone.length );
    } );

    it( "should say who may run every command", () => {
        const tiers = Object.values( COMMAND_TIERS );

        for ( const definition of ALL ) {
            expect( tiers ).toContain( definition.tier );
        }
    } );

    /**
     * The `v2` fields come in sets. A command that reaches the older interface at all has to reach
     * it the same way it reaches the newer one - by opening a modal, or by running an entity's
     * handler. Naming the adapter and forgetting the rest is what left `/voice transfer`, `reset`
     * and `clear-chat` opening a v2 adapter whose handler never ran, which looks like nothing
     * happening.
     */
    it( "should reach v2 the same way it reaches v3", () => {
        for ( const definition of ALL ) {
            if ( ! definition.adapterNameV2 ) {
                continue;
            }

            if ( definition.modalName ) {
                expect( { row: describeRow( definition ), modalNameV2: definition.modalNameV2 } )
                    .toEqual( { row: describeRow( definition ), modalNameV2: expect.any( String ) } );
            }

        }
    } );

    it( "should not name a v2 modal without a v2 adapter to find it on", () => {
        for ( const definition of ALL ) {
            if ( definition.modalNameV2 ) {
                expect( { row: describeRow( definition ), adapterNameV2: definition.adapterNameV2 } )
                    .toEqual( { row: describeRow( definition ), adapterNameV2: expect.any( String ) } );
            }
        }
    } );

    it( "should ask for one thing per command", () => {
        // A modal and a step are two different ways in, and the bridge takes the modal - so a row
        // carrying both would silently never open the screen it named.
        for ( const definition of ALL ) {
            const ways = [ definition.modalName, definition.executionStep ]
                .filter( Boolean );

            expect( { row: describeRow( definition ), ways: ways.length } )
                .toEqual( { row: describeRow( definition ), ways: expect.any( Number ) } );
            expect( ways.length ).toBeLessThanOrEqual( 1 );
        }
    } );

    it( "should have a command for every handler", () => {
        const transitions = new Set( ALL.map( describeRow ) );

        for ( const transition of Object.keys( COMMAND_HANDLERS ) ) {
            expect( transitions ).toContain( transition );
        }
    } );

    it( "should point every command at a flow state", () => {
        for ( const definition of ALL ) {
            expect( definition.flowTransition ).toMatch( /^VertixBot\/Commands\/[A-Za-z]+$/ );
            expect( definition.flowTargetState ).toMatch( /^VertixBot\/UI-(V2|V3|General)\/.+\/States\/.+$/ );
        }
    } );

    /**
     * A command about the whole server has to answer the same way from either interface.
     *
     * The bridge picks the adapter by the version of whatever channel the member is standing in,
     * and answers "not in this generator's interface" when the row names none for v2. That is the
     * right answer for a feature v2 never had - and the wrong one for a feature that does not care
     * which generator made anything, where all it means is the member happened to be sitting in a
     * v2 channel while asking about somebody else's.
     */
    it( "should answer a guild-wide command from either interface version", () => {
        const guildWide = [ "knock", "claim" ];

        const silent = ALL
            .filter( ( definition ) => guildWide.includes( definition.name ) )
            .filter( ( definition ) => ! definition.adapterNameV2 )
            .map( describeRow );

        expect( silent ).toEqual( [] );
    } );
} );
