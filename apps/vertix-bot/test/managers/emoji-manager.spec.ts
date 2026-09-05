import { EmojiManager } from "@vertix.gg/bot/src/managers/emoji-manager";

import type { RESTGetAPIApplicationEmojisResult } from "discord-api-types/v9";

const APPLICATION_EMOJIS = {
    items: [
        { id: "100000000000000001", name: "ChannelRename" },
        { id: "100000000000000002", name: "UserLimit" },
        { id: "100000000000000003", name: "ClaimChannel" }
    ]
} as RESTGetAPIApplicationEmojisResult;

describe( "VertixBot/Managers/Emoji", () => {
    const withEmojis = ( emojis: RESTGetAPIApplicationEmojisResult | undefined ) => {
        const manager = new EmojiManager();

        Object.assign( manager, { emojis } );

        return manager;
    };

    describe( "getToken", () => {
        it( "should wrap the base name with the token syntax", () => {
            expect( EmojiManager.getToken( "ChannelRename" ) ).toBe( "<emoji name='ChannelRename'>" );
        } );
    } );

    describe( "resolveTokens", () => {
        it( "should resolve a token to the markdown of the running application", () => {
            const manager = withEmojis( APPLICATION_EMOJIS );

            expect( manager.resolveTokens( "<emoji name='ChannelRename'>  ∙ **Rename**" ) )
                .toBe( "<:ChannelRename:100000000000000001>  ∙ **Rename**" );
        } );

        it( "should resolve every token of a multi line content", () => {
            const manager = withEmojis( APPLICATION_EMOJIS );

            expect( manager.resolveTokens( "- ( <emoji name='UserLimit'> )\n- ( <emoji name='ClaimChannel'> )" ) )
                .toBe( "- ( <:UserLimit:100000000000000002> )\n- ( <:ClaimChannel:100000000000000003> )" );
        } );

        it( "should keep native discord markdown untouched", () => {
            const manager = withEmojis( APPLICATION_EMOJIS );

            const content = "<#1234567890> <@&1234567890> <:Foreign:1234567890> <t:1234567890> <https://vertix.gg>";

            expect( manager.resolveTokens( content ) ).toBe( content );
        } );

        it( "should accept the double quoted and self closing forms", () => {
            const manager = withEmojis( APPLICATION_EMOJIS );

            expect( manager.resolveTokens( "<emoji name=\"UserLimit\"> <emoji name='UserLimit' />" ) )
                .toBe( "<:UserLimit:100000000000000002> <:UserLimit:100000000000000002>" );
        } );

        it( "should keep an unresolvable token untouched", () => {
            const manager = withEmojis( APPLICATION_EMOJIS );

            expect( manager.resolveTokens( "<emoji name='NotAnEmoji'> stays" ) )
                .toBe( "<emoji name='NotAnEmoji'> stays" );
        } );

        it( "should keep tokens untouched while the emojis are not loaded yet", () => {
            const manager = withEmojis( undefined );

            expect( manager.resolveTokens( "<emoji name='ChannelRename'>" ) )
                .toBe( "<emoji name='ChannelRename'>" );
        } );

        it( "should return the content as is when it holds no token", () => {
            const manager = withEmojis( APPLICATION_EMOJIS );

            expect( manager.resolveTokens( "There are no buttons selected!" ) )
                .toBe( "There are no buttons selected!" );
        } );
    } );
} );
