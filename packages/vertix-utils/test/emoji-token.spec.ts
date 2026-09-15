import {
    createEmojiToken,
    getEmojiTokenName,
    hasEmojiToken,
    replaceEmojiMarkdownWithTokens,
    replaceEmojiTokens
} from "@vertix.gg/utils/src/emoji-token";

const ICONS: Record<string, string> = {
    ChannelRename: "rename.svg",
    UserLimit: "limit.svg"
};

const resolveIcon = ( name: string ) => ICONS[ name ];

describe( "VertixUtils/EmojiToken", () => {

    describe( "createEmojiToken", () => {
        it( "should emit the single quoted form", () => {
            expect( createEmojiToken( "ChannelRename" ) ).toBe( "<emoji name='ChannelRename'>" );
        } );
    } );

    describe( "hasEmojiToken", () => {
        it( "should detect a token and ignore native discord markdown", () => {
            expect( hasEmojiToken( "a <emoji name='UserLimit'> b" ) ).toBe( true );
            expect( hasEmojiToken( "<#123> <@&123> <:UserLimit:123>" ) ).toBe( false );
        } );
    } );

    describe( "getEmojiTokenName", () => {
        it( "should return the name of a whole-string token", () => {
            expect( getEmojiTokenName( "<emoji name='ChannelRename'>" ) ).toBe( "ChannelRename" );
            expect( getEmojiTokenName( "<emoji name=\"ChannelRename\" />" ) ).toBe( "ChannelRename" );
        } );

        it( "should return null when the string is not exactly one token", () => {
            expect( getEmojiTokenName( "x <emoji name='ChannelRename'>" ) ).toBeNull();
            expect( getEmojiTokenName( "<:ChannelRename:123>" ) ).toBeNull();
        } );
    } );

    describe( "replaceEmojiTokens", () => {
        it( "should replace each token with what the resolver returns", () => {
            expect( replaceEmojiTokens( "<emoji name='ChannelRename'> and <emoji name='UserLimit'>", resolveIcon ) )
                .toBe( "rename.svg and limit.svg" );
        } );

        it( "should leave a token the resolver has nothing for", () => {
            expect( replaceEmojiTokens( "<emoji name='Unknown'>", resolveIcon ) ).toBe( "<emoji name='Unknown'>" );
        } );

        it( "should leave native discord markdown untouched", () => {
            const content = "<#123> <@&123> <:ChannelRename:123> <t:123> <https://vertix.gg>";

            expect( replaceEmojiTokens( content, resolveIcon ) ).toBe( content );
        } );
    } );

    describe( "replaceEmojiMarkdownWithTokens", () => {
        it( "should drop the application specific id", () => {
            expect( replaceEmojiMarkdownWithTokens( "<:ChannelRename:1272447740034682952>  ∙ **Rename**" ) )
                .toBe( "<emoji name='ChannelRename'>  ∙ **Rename**" );
        } );

        it( "should handle animated emoji and leave every other discord token alone", () => {
            expect( replaceEmojiMarkdownWithTokens( "<a:Spin:123> <#123> <@&123> <t:123>" ) )
                .toBe( "<emoji name='Spin'> <#123> <@&123> <t:123>" );
        } );

        it( "should round trip back through replaceEmojiTokens", () => {
            const tokenized = replaceEmojiMarkdownWithTokens( "<:UserLimit:123>" );

            expect( replaceEmojiTokens( tokenized, resolveIcon ) ).toBe( "limit.svg" );
        } );
    } );
} );
