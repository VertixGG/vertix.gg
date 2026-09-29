import {
    GUILD_BRANDING_BIO_MAX_LENGTH,
    GUILD_BRANDING_IMAGE_MAX_BYTES,
    GUILD_BRANDING_NICK_MAX_LENGTH,
    parseGuildBrandingImage,
    validateGuildBrandingProfile
} from "@vertix.gg/definitions/src/guild-branding-definitions";

import type { IGuildBrandingProfile } from "@vertix.gg/definitions/src/guild-branding-definitions";

// Real images, one pixel each - the bytes are what is being checked, so they have to be the real ones.
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    JPEG = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==",
    GIF89A = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    GIF87A = "R0lGODdhAQABAIAAAAAAAP///ywAAAAAAQABAAACAkQBADs=";

const EMPTY: IGuildBrandingProfile = { nick: null, bio: null, avatar: null, banner: null };

describe( "VertixDefinitions/GuildBranding", () => {
    describe( "parseGuildBrandingImage()", () => {
        it( "should accept a png, a jpeg and both kinds of gif whose bytes are what they say", () => {
            // Act & Assert.
            expect( parseGuildBrandingImage( `data:image/png;base64,${ PNG }` )?.mimeType ).toBe( "image/png" );
            expect( parseGuildBrandingImage( `data:image/jpeg;base64,${ JPEG }` )?.mimeType ).toBe( "image/jpeg" );
            expect( parseGuildBrandingImage( `data:image/gif;base64,${ GIF89A }` )?.mimeType ).toBe( "image/gif" );
            expect( parseGuildBrandingImage( `data:image/gif;base64,${ GIF87A }` )?.mimeType ).toBe( "image/gif" );
        } );

        it( "should measure the decoded size, not the length of the text", () => {
            // Act.
            const image = parseGuildBrandingImage( `data:image/png;base64,${ PNG }` );

            // Assert - what `atob` hands back for it, which is shorter than the text by a third and
            // shorter again by the two padding characters it ends in.
            expect( image?.byteLength ).toBe( atob( PNG ).length );
        } );

        // Each of these would reach discord.js as something it resolves: a url it fetches, or a path it
        // reads off the disk. That is the reason this function exists.
        it.each( [
            [ "an http url", "http://169.254.169.254/latest/meta-data" ],
            [ "an https url", "https://example.com/avatar.png" ],
            [ "a file path", "/etc/passwd" ],
            [ "a relative path", "../../.env" ],
            [ "a file url", "file:///etc/passwd" ]
        ] )( "should refuse %s", ( _label, value ) => {
            // Act & Assert.
            expect( parseGuildBrandingImage( value ) ).toBeNull();
        } );

        it( "should refuse a type discord does not take for a profile", () => {
            // Act & Assert.
            expect( parseGuildBrandingImage( `data:image/webp;base64,${ PNG }` ) ).toBeNull();
            expect( parseGuildBrandingImage( `data:text/html;base64,${ PNG }` ) ).toBeNull();
            expect( parseGuildBrandingImage( `data:image/svg+xml;base64,${ PNG }` ) ).toBeNull();
        } );

        it( "should refuse an image whose bytes are not the type it claims", () => {
            // Act & Assert.
            expect( parseGuildBrandingImage( `data:image/png;base64,${ JPEG }` ) ).toBeNull();
            expect( parseGuildBrandingImage( `data:image/gif;base64,${ PNG }` ) ).toBeNull();
            expect( parseGuildBrandingImage( `data:image/jpeg;base64,${ GIF89A }` ) ).toBeNull();
        } );

        it( "should refuse something that is not base64, or is empty", () => {
            // Act & Assert.
            expect( parseGuildBrandingImage( "data:image/png;base64," ) ).toBeNull();
            expect( parseGuildBrandingImage( "data:image/png;base64,!!!notbase64!!!" ) ).toBeNull();
            expect( parseGuildBrandingImage( `data:image/png,${ PNG }` ) ).toBeNull();
            expect( parseGuildBrandingImage( ` data:image/png;base64,${ PNG }` ) ).toBeNull();
            expect( parseGuildBrandingImage( `data:image/png;base64,${ PNG }\n` ) ).toBeNull();
        } );

        it( "should refuse base64 that does not come in whole groups of four", () => {
            // Act & Assert - a real png header, one character short of decoding, and padding in the
            // wrong place.
            expect( parseGuildBrandingImage( "data:image/png;base64,iVBORw0KGgoAB" ) ).toBeNull();
            expect( parseGuildBrandingImage( "data:image/png;base64,iVBO=w0KGgoA" ) ).toBeNull();
        } );

        it( "should refuse an image over the ceiling, and take one exactly at it", () => {
            // Arrange - a real png header padded out with zero bytes ("A" is six zero bits). Every four
            // characters are three bytes; a group ending "==" carries one byte and one ending "=" two.
            const header = PNG.slice( 0, 12 ),
                encodedLength = Math.ceil( GUILD_BRANDING_IMAGE_MAX_BYTES / 3 ) * 4,
                encode = ( bytes: number ) => {
                    const padding = ( 3 - bytes % 3 ) % 3;

                    return header + "A".repeat( encodedLength - header.length - padding ) + "=".repeat( padding );
                };

            // Act.
            const atLimit = parseGuildBrandingImage( `data:image/png;base64,${ encode( GUILD_BRANDING_IMAGE_MAX_BYTES ) }` ),
                overLimit = parseGuildBrandingImage( `data:image/png;base64,${ encode( GUILD_BRANDING_IMAGE_MAX_BYTES + 1 ) }` );

            // Assert.
            expect( atLimit?.byteLength ).toBe( GUILD_BRANDING_IMAGE_MAX_BYTES );
            expect( overLimit ).toBeNull();
        } );
    } );

    describe( "validateGuildBrandingProfile()", () => {
        it( "should take a profile with every field left as the bot's own", () => {
            // Act & Assert.
            expect( validateGuildBrandingProfile( EMPTY ) ).toEqual( [] );
        } );

        it( "should take a full profile inside every bound", () => {
            // Arrange.
            const profile: IGuildBrandingProfile = {
                nick: "N".repeat( GUILD_BRANDING_NICK_MAX_LENGTH ),
                bio: "B".repeat( GUILD_BRANDING_BIO_MAX_LENGTH ),
                avatar: `data:image/png;base64,${ PNG }`,
                banner: `data:image/gif;base64,${ GIF89A }`
            };

            // Act & Assert.
            expect( validateGuildBrandingProfile( profile ) ).toEqual( [] );
        } );

        it( "should refuse a name past discord's length, or one that is only spaces", () => {
            // Act & Assert.
            expect( validateGuildBrandingProfile( { ... EMPTY, nick: "N".repeat( GUILD_BRANDING_NICK_MAX_LENGTH + 1 ) } ) )
                .toHaveLength( 1 );
            expect( validateGuildBrandingProfile( { ... EMPTY, nick: "   " } ) ).toHaveLength( 1 );
        } );

        it( "should refuse a bio past its length", () => {
            // Act & Assert.
            expect( validateGuildBrandingProfile( { ... EMPTY, bio: "B".repeat( GUILD_BRANDING_BIO_MAX_LENGTH + 1 ) } ) )
                .toHaveLength( 1 );
        } );

        it( "should give one reason per field that is wrong", () => {
            // Act.
            const reasons = validateGuildBrandingProfile( {
                nick: "",
                bio: null,
                avatar: "https://example.com/a.png",
                banner: "/etc/passwd"
            } );

            // Assert.
            expect( reasons ).toHaveLength( 3 );
        } );
    } );
} );
