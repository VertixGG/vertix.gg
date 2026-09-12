import {
    VAR_DYNAMIC_CHANNEL_GAME,
    VAR_DYNAMIC_CHANNEL_STATE,
    VAR_DYNAMIC_CHANNEL_USER
} from "@vertix.gg/definitions/src/dynamic-channel-vars-definitions";

import { varsReplaceTokens } from "@vertix.gg/base/src/utils/vars-utils";

describe( "VertixBot/Utils/Vars", () => {

    describe( "varsReplaceTokens", () => {
        it( "should swap every token it is given a value for", () => {
            const result = varsReplaceTokens( "{user} playing {game}", {
                [ VAR_DYNAMIC_CHANNEL_USER ]: "Leonid",
                [ VAR_DYNAMIC_CHANNEL_GAME ]: "Counter-Strike"
            } );

            expect( result ).toBe( "Leonid playing Counter-Strike" );
        } );

        it( "should swap a token that appears more than once", () => {
            const result = varsReplaceTokens( "{user} and {user}", {
                [ VAR_DYNAMIC_CHANNEL_USER ]: "Leonid"
            } );

            expect( result ).toBe( "Leonid and Leonid" );
        } );

        it( "should not replace inside a value it just substituted", () => {
            // A game genuinely called "{user}" must come out as itself, not as the owner's name.
            const result = varsReplaceTokens( "playing {game}", {
                [ VAR_DYNAMIC_CHANNEL_GAME ]: VAR_DYNAMIC_CHANNEL_USER,
                [ VAR_DYNAMIC_CHANNEL_USER ]: "Leonid"
            } );

            expect( result ).toBe( "playing {user}" );
        } );

        it( "should leave a token standing when it has no value", () => {
            const result = varsReplaceTokens( "{user} in {index}", {
                [ VAR_DYNAMIC_CHANNEL_USER ]: "Leonid"
            } );

            expect( result ).toBe( "Leonid in {index}" );
        } );

        it( "should substitute an empty value rather than leaving the token", () => {
            const result = varsReplaceTokens( "{state} squad night", {
                [ VAR_DYNAMIC_CHANNEL_STATE ]: ""
            } );

            expect( result ).toBe( " squad night" );
        } );

        it( "should return the template untouched when there is nothing to replace", () => {
            expect( varsReplaceTokens( "just words", {} ) ).toBe( "just words" );
        } );

        it( "should keep everything that is not a token exactly as written", () => {
            const result = varsReplaceTokens( "{user}'s room · {game}", {
                [ VAR_DYNAMIC_CHANNEL_USER ]: "Leonid",
                [ VAR_DYNAMIC_CHANNEL_GAME ]: "Dota 2"
            } );

            expect( result ).toBe( "Leonid's room · Dota 2" );
        } );
    } );
} );
