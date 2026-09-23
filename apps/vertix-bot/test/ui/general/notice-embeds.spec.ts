import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import { FeatureMissingInV2Adapter } from "@vertix.gg/bot/src/ui/general/feature-missing-in-v2/feature-missing-in-v2-adapter";
import { MissingAdminPermissionsAdapter } from "@vertix.gg/bot/src/ui/general/missing-admin-permissions/missing-admin-permissions-adapter";
import { NotClaimableAdapter } from "@vertix.gg/bot/src/ui/general/not-claimable/not-claimable-adapter";

import { VERTIX_BRAND_THUMBNAIL_URL, VERTIX_DEFAULT_COLOR_BRAND } from "@vertix.gg/bot/src/definitions/app";

const NOTICES = [
    FeatureMissingInV2Adapter,
    MissingAdminPermissionsAdapter,
    NotClaimableAdapter
];

/** A built adapter hands its component back untyped - this is all the spec asks of it. */
type NoticeComponent = { getEmbeds(): unknown[] };

const getEmbed = ( Adapter: typeof NOTICES[ number ] ) =>
    instantiateEmbed( ( Adapter.getComponent() as unknown as NoticeComponent ).getEmbeds()[ 0 ] );

describe( "VertixBot/UI-General/", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it.each( NOTICES.map( ( Adapter ) => [ Adapter.getName(), Adapter ] as const ) )(
        "%s should offer its words to the language manager",
        async( _name, Adapter ) => {
            // Arrange.
            const embed = getEmbed( Adapter );

            // Act - this is what is called at start-up to snapshot `assets/languages/*.json`,
            // and it is called without args exactly like this.
            const content = await embed.getTranslatableContent();

            // Assert - a sentence, not a template variable standing in for one. Taking the words
            // as call-time arguments is what used to put `{title}` in the language files.
            expect( content.title ).toBeTruthy();
            expect( content.description ).toBeTruthy();
            expect( content.title ).not.toMatch( /^\{[a-zA-Z]+\}$/ );
            expect( content.description ).not.toMatch( /^\{[a-zA-Z]+\}$/ );
        }
    );

    it.each( NOTICES.map( ( Adapter ) => [ Adapter.getName(), Adapter ] as const ) )(
        "%s should carry the brand",
        async( _name, Adapter ) => {
            // Arrange.
            const embed = getEmbed( Adapter );

            // Act.
            const result = await embed.build( {} );

            // Assert.
            expect( result.attributes.thumbnail ).toEqual( { url: VERTIX_BRAND_THUMBNAIL_URL } );
            expect( result.attributes.color ).toBe( VERTIX_DEFAULT_COLOR_BRAND );
        }
    );

    it.each( NOTICES.map( ( Adapter ) => [ Adapter.getName(), Adapter ] as const ) )(
        "%s should say all of itself, with nothing left for the caller to fill in",
        async( _name, Adapter ) => {
            // Arrange.
            const embed = getEmbed( Adapter );

            // Act - built with nothing, the way every notice is now sent.
            const result = await embed.build( {} );

            // Assert - a notice that needed an argument would show its own variable name here.
            expect( result.attributes.description ).not.toMatch( /\{[a-zA-Z]+\}/ );
            expect( result.attributes.title ).not.toMatch( /\{[a-zA-Z]+\}/ );
        }
    );
} );
