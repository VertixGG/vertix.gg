import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { instantiateEmbed } from "@vertix.gg/bot/test/__test_utils__/instantiate-embed";

import {
    ChannelCreateFailedEmbed
} from "@vertix.gg/bot/src/ui/general/channel-create-failed/channel-create-failed-embed";

describe( "VertixBot/UI-General/ChannelCreateFailedEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    it( "should name the category's missing permissions, spaced as the server spells them", async() => {
        // Arrange.
        const embed = instantiateEmbed( ChannelCreateFailedEmbed );

        // Act - what a 403 from a category that denies the bot arrives as.
        const result = await embed.build( {
            masterChannelId: "123456789",
            categoryName: "Staff Only",
            missingPermissions: [ "ManageChannels", "ViewChannel" ]
        } );

        // Assert.
        expect( result.attributes.description ).toContain( "**Staff Only**" );
        expect( result.attributes.description ).toContain( "- Manage Channels" );
        expect( result.attributes.description ).toContain( "- View Channel" );
    } );

    it( "should fall back to the unknown reason when nothing was found missing", async() => {
        // Arrange.
        const embed = instantiateEmbed( ChannelCreateFailedEmbed );

        // Act - a create that failed for something the bot cannot work out.
        const result = await embed.build( { masterChannelId: "123456789", missingPermissions: [] } );

        // Assert.
        expect( result.attributes.description ).toContain( "The reason is written to the bot logs." );
    } );

    it( "should leave a refusal's own reason alone", async() => {
        // Arrange.
        const embed = instantiateEmbed( ChannelCreateFailedEmbed );

        // Act - a generator at its cap is told it is full, whatever a category withholds.
        const result = await embed.build( {
            masterChannelId: "123456789",
            isGeneratorFull: true,
            maxActiveDynamicChannels: 20,
            missingPermissions: []
        } );

        // Assert.
        expect( result.attributes.description ).toContain( "20 channels open" );
    } );

    it( "should never show a template variable to the member", async() => {
        // Arrange.
        const embed = instantiateEmbed( ChannelCreateFailedEmbed );

        // Act.
        const result = await embed.build( {
            masterChannelId: "123456789",
            categoryName: "Staff Only",
            missingPermissions: [ "ManageChannels" ]
        } );

        // Assert.
        expect( result.attributes.description ).not.toMatch( /\{[a-zA-Z]+\}/ );
    } );
} );
