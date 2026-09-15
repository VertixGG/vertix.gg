import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { DynamicChannelLfmPostEmbed } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/embeds/dynamic-channel-lfm-post-embed";

const BASE_ARGS = {
    channelId: "1",
    channelName: "Leo's Channel",
    ownerId: "2",
    ownerAvatarUrl: "https://cdn.example.com/a.webp",
    memberCount: 1,
    userLimit: 0
};

describe( "VertixBot/UI-V2/DynamicChannelLfmPostEmbed", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        // Frozen, because the countdown is rendered against `Date.now()` - a real clock would put
        // the assertion a fraction of a minute out depending on how long the suite took to arrive.
        jest.useFakeTimers();
    } );

    afterEach( () => {
        jest.useRealTimers();
    } );

    it( "should quote the note above everything else", async() => {
        // Arrange.
        const embed = new DynamicChannelLfmPostEmbed();

        // Act.
        const result = await embed.build( {
            ...BASE_ARGS,
            gameName: "League of Legends",
            note: "Need 2 for ranked",
            expiresAt: Date.now() + 5 * 60 * 1000
        } );

        // Assert.
        expect( result.attributes.description ).toBe(
            "> Need 2 for ranked\n\n" +
            "**Playing** League of Legends\n" +
            "**Members** 1\n" +
            "**Host** <@2>\n\n" +
            "Join them in <#1> · closes in `5 minutes`"
        );
    } );

    it( "should leave the quote out when no note was written", async() => {
        // Arrange.
        const embed = new DynamicChannelLfmPostEmbed();

        // Act.
        const result = await embed.build( {
            ...BASE_ARGS,
            gameName: "League of Legends",
            note: null,
            expiresAt: Date.now() + 5 * 60 * 1000
        } );

        // Assert - no stray blank line where the quote would have been.
        expect( result.attributes.description ).toBe(
            "**Playing** League of Legends\n" +
            "**Members** 1\n" +
            "**Host** <@2>\n\n" +
            "Join them in <#1> · closes in `5 minutes`"
        );
    } );

    it( "should count the remaining time down in tenths of a minute", async() => {
        // Arrange.
        const embed = new DynamicChannelLfmPostEmbed();

        // Act - four and a half minutes, the case whole minutes would have rounded away.
        const result = await embed.build( {
            ...BASE_ARGS,
            note: null,
            expiresAt: Date.now() + ( 4 * 60 + 30 ) * 1000
        } );

        // Assert.
        expect( result.attributes.description ).toContain( "closes in `4.5 minutes`" );
    } );
} );
