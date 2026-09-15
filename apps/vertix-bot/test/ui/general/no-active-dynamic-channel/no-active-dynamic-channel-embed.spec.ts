import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import {
    NoActiveDynamicChannelEmbed
} from "@vertix.gg/bot/src/ui/general/no-active-dynamic-channel/no-active-dynamic-channel-embed";

describe( "VertixBot/UI-General/NoActiveDynamicChannelEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should offer the generator when there is one to offer", async() => {
        // Arrange.
        const embed = instantiateEmbed( NoActiveDynamicChannelEmbed );

        // Act.
        const result = await embed.build( { masterChannelId: "123456789" } );

        // Assert.
        expect( result.attributes.description ).toContain( "Join <#123456789>" );
    } );

    it( "should say nothing about joining when the guild has no generator", async() => {
        // Arrange.
        const embed = instantiateEmbed( NoActiveDynamicChannelEmbed );

        // Act - what a member standing in an ordinary voice channel gets.
        const result = await embed.build( {} );

        // Assert - the sentence ends where it ends; no dangling offer.
        expect( result.attributes.description ).toBe( "You don't own an active dynamic channel." );
    } );

    it( "should never show a template variable to the member", async() => {
        // Arrange.
        const embed = instantiateEmbed( NoActiveDynamicChannelEmbed );

        // Act.
        const withNone = await embed.build( {} );
        const withOne = await embed.build( { masterChannelId: "123456789" } );

        // Assert - this is the bug: `Join <#{masterChannelId}>` reached real members.
        expect( withNone.attributes.description ).not.toMatch( /\{[a-zA-Z]+\}/ );
        expect( withOne.attributes.description ).not.toMatch( /\{[a-zA-Z]+\}/ );
    } );
} );
