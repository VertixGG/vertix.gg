import { UIArgsManager } from "@vertix.gg/gui/src/bases/ui-args-manager";

import type { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

const OWNER = { getName: () => "VertixGUI/Test/ArgsOwner" } as unknown as UIBase,
    OTHER_OWNER = { getName: () => "VertixGUI/Test/OtherOwner" } as unknown as UIBase,
    MESSAGE_ID = "message-id";

function createManager() {
    const warnings: string[] = [];

    const manager = new UIArgsManager( "Test" );

    // Only `warn` is intercepted - replacing the whole logger takes `debug` with it, which the
    // methods under test call on the way in.
    const logger = ( manager as unknown as { logger: { warn: ( ...args: unknown[] ) => void } } ).logger;

    logger.warn = ( _caller: unknown, message: unknown ) => {
        warnings.push( String( message ) );
    };

    return { manager, warnings };
}

describe( "VertixGUI/UIArgsManager/deleteArgs", () => {

    it( "should delete the args it was asked to", () => {
        const { manager } = createManager();

        manager.setInitialArgs( OWNER, MESSAGE_ID, { a: 1 }, { overwrite: true, silent: true } );

        expect( manager.getArgsById( OWNER, MESSAGE_ID ) ).toEqual( { a: 1 } );

        manager.deleteArgs( OWNER, MESSAGE_ID );

        expect( manager.getArgsById( OWNER, MESSAGE_ID ) ).toBeUndefined();
    } );

    it( "should leave another id of the same owner alone", () => {
        const { manager } = createManager();

        manager.setInitialArgs( OWNER, MESSAGE_ID, { a: 1 }, { overwrite: true, silent: true } );
        manager.setInitialArgs( OWNER, "other-message", { b: 2 }, { overwrite: true, silent: true } );

        manager.deleteArgs( OWNER, MESSAGE_ID );

        expect( manager.getArgsById( OWNER, "other-message" ) ).toEqual( { b: 2 } );
    } );

    /**
     * The warning this replaces fired only when the *owner* had no bucket, so it named an id that
     * had nothing to do with the branch it came from - and stayed silent in the case it actually
     * described, an id missing from a bucket that exists. Whether a screen was reported for
     * dropping args it never had came down to what some unrelated screen of the same owner had done.
     */
    it.each( [
        [ "the owner has no args at all", false ],
        [ "the owner has other args but not this id", true ]
    ] )( "should say nothing when %s", ( _label, seedOther ) => {
        const { manager, warnings } = createManager();

        if ( seedOther ) {
            manager.setInitialArgs( OWNER, "some-other-message", { b: 2 }, { overwrite: true, silent: true } );
        }

        manager.deleteArgs( OWNER, MESSAGE_ID );

        expect( warnings ).toEqual( [] );
    } );

    it( "should not disturb a different owner", () => {
        const { manager } = createManager();

        manager.setInitialArgs( OTHER_OWNER, MESSAGE_ID, { c: 3 }, { overwrite: true, silent: true } );

        manager.deleteArgs( OWNER, MESSAGE_ID );

        expect( manager.getArgsById( OTHER_OWNER, MESSAGE_ID ) ).toEqual( { c: 3 } );
    } );
} );
