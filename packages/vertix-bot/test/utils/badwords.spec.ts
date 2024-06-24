import { badwordsSomeUsed } from "@vertix.gg/base/src/utils/badwords";

describe( "VertixBot/Utils/Badwords", () => {

    describe( "badwordsSomeUsed", () => {
        it( "should return the first matching badword", () => {
            const word = "example";
            const badwords = [ "bad", "word", "example*" ];

            const result = badwordsSomeUsed( word, badwords );
            expect( result ).toBe( "example*" );
        } );

        it( "should return null if no badword matches", () => {
            const word = "example";
            const badwords = [ "bad", "word" ];

            const result = badwordsSomeUsed( word, badwords );
            expect( result ).toBeNull();
        } );

        it( "should handle \"*\" at the beginning of a badword", () => {
            const word = "example";
            const badwords = [ "*ple", "word", "example" ];

            const result = badwordsSomeUsed( word, badwords );
            expect( result ).toBe( "*ple" );
        } );

        it( "should handle \"*\" in the middle of a badword", () => {
            const word = "example";
            const badwords = [ "ex*le", "word", "example" ];

            const result = badwordsSomeUsed( word, badwords );
            expect( result ).toBe( "ex*le" );
        } );

        it( "should handle multiple \"*\" in a badword", () => {
            const word = "example";
            const badwords = [ "ex*m*le", "word", "example" ];

            const result = badwordsSomeUsed( word, badwords );
            expect( result ).toBe( "ex*m*le" );
        } );

        it( "should handle multiple badwords with \"*\" at different positions", () => {
            const word = "example";
            const badwords = [ "*ple", "ex*m*le", "wo*d", "exa**le" ];

            const result = badwordsSomeUsed( word, badwords );
            expect( result ).toBe( "*ple" );
        } );
    } );

} );
