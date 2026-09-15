import fs from "fs";
import path from "path";

/**
 * Every screen a command handler opens at must be a screen that exists.
 *
 * A handler names its screen as a string passed to `ephemeralWithStep()`, and nothing checks it. A
 * step that does not exist is not an error anywhere: the name resolves to nothing, and the member
 * gets whatever the adapter happened to be on. This was not hypothetical - sharing the transfer
 * screens between its two adapters renamed them, and the handler went on naming the old ones.
 *
 * Read out of the handler sources rather than declared here, so a handler added tomorrow is covered
 * without anyone remembering to add it.
 */

const HANDLERS_DIR = path.resolve( process.cwd(), "src/commands/handlers" );
const FLOWS = path.resolve( process.cwd(), "../../exports/ui/flows.json" );

interface ExportedFlow {
    states?: Array<{ options?: { executionStep?: string | null } }>;
}

const knownSteps = (): Set<string> => {
    const flows = JSON.parse( fs.readFileSync( FLOWS, "utf-8" ) ) as ExportedFlow[];

    const steps = flows.flatMap( ( flow ) =>
        ( flow.states ?? [] ).map( ( state ) => state.options?.executionStep ?? "" )
    );

    return new Set( steps.filter( Boolean ) );
};

/**
 * The entity names a handler hands to `ephemeralWithStep()`.
 *
 * Only the second argument counts - the first is the interaction, and the third is the args - so
 * what is collected is the literal sitting in that position, however the call is wrapped over
 * lines or spread across the arms of a conditional.
 */
const stepsNamedBy = ( source: string ): string[] =>
    [ ...source.matchAll( /ephemeralWithStep\(([\s\S]*?)\)\s*;/g ) ]
        .flatMap( ( call ) => [ ...call[ 1 ].matchAll( /"(VertixBot\/[^"]+)"/g ) ] )
        .map( ( match ) => match[ 1 ] );

describe( "VertixBot/Commands/HandlerSteps", () => {
    const handlers = fs.readdirSync( HANDLERS_DIR ).filter( ( file ) => file.endsWith( "-handler.ts" ) );

    it( "should have handlers to check", () => {
        expect( handlers.length ).toBeGreaterThan( 0 );
    } );

    it( "should open every command at a screen that exists", () => {
        const steps = knownSteps();

        expect( steps.size ).toBeGreaterThan( 0 );

        const missing = handlers.flatMap( ( file ) =>
            stepsNamedBy( fs.readFileSync( path.join( HANDLERS_DIR, file ), "utf-8" ) )
                .filter( ( step ) => ! steps.has( step ) )
                .map( ( step ) => `${ file }: no exported step '${ step }'` )
        );

        expect( missing ).toEqual( [] );
    } );
} );
