import { fillGapsFrom } from "@vertix.gg/gui/src/bases/ui-adapter-base";

/**
 * What a screen is opened with has to survive what the adapter works out.
 *
 * An adapter rebuilds its screen from the channel and answers with what it knows. Anything that
 * exists only in the press being answered - which member was picked, which way an owner answered -
 * is not something it can know, and arrives as the args the caller passed.
 */
describe( "VertixGUI/UIAdapterBase/fillGapsFrom", () => {
    test( "Should keep what the adapter worked out", () => {
        expect( fillGapsFrom( { name: "fresh" }, { name: "stale" } ) )
            .toEqual( { name: "fresh" } );
    } );

    test( "Should carry what the adapter never mentioned", () => {
        expect( fillGapsFrom( { name: "fresh" }, { isKnockAllowed: true } ) )
            .toEqual( { name: "fresh", isKnockAllowed: true } );
    } );

    /**
     * The case both wholesale merges get wrong. Assigning the adapter's answer over the caller's
     * would blank the value with an explicit `undefined`; assigning the caller's over the adapter's
     * would throw away every fresh value it just worked out.
     */
    test( "Should treat an undefined answer as no answer", () => {
        expect( fillGapsFrom( { name: undefined }, { name: "handed in" } ) )
            .toEqual( { name: "handed in" } );
    } );

    test( "Should answer with the adapter's own when nothing was handed in", () => {
        expect( fillGapsFrom( { name: "fresh" } ) ).toEqual( { name: "fresh" } );
    } );

    test( "Should not write back into either object it was given", () => {
        const args = { name: "fresh" },
            handedIn = { other: 1 };

        fillGapsFrom( args, handedIn );

        expect( args ).toEqual( { name: "fresh" } );
        expect( handedIn ).toEqual( { other: 1 } );
    } );
} );
