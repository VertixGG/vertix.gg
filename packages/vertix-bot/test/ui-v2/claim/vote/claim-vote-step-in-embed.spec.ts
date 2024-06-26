import { jest } from "@jest/globals";

import { ServiceLocatorMock } from "@vertix.gg/utils/src/service-locator-mock";

import { ClaimVoteStepInEmbed } from "@vertix.gg/bot/src/ui-v2/claim/vote/claim-vote-step-in-embed";

describe( "VertixBot/UI-V2/ClaimVoteStepInEmbed", () => {
    beforeEach( async () => {
        // Reset ServiceLocator.
        ServiceLocatorMock.reset();

        // Mock ServiceLocator.
        jest.mock( "@vertix.gg/base/src/modules/service/service-locator",
            () => ServiceLocatorMock
        );

        // Register UIAdapterService
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/bot/src/ui-v2/ui-adapter-service" ) ).UIAdapterService );

        // Await for all services to be registered.
        await ServiceLocatorMock.$.waitForAll();
    } );

    afterEach( () => {
        jest.clearAllMocks();
    } );

    it( "should passthroughs sanity check", async () => {
        // Arrange.
        const embed = new ClaimVoteStepInEmbed();

        // Act.
        const result = await embed.build( {} );

        // Assert.
        expect( result ).toEqual( {
            "name": "VertixBot/UI-V2/ClaimVoteStepInEmbed",
            "type": "embed",
            "attributes": {
                "title": "👑  {userInitiatorDisplayName} wish to claim this channel",
                "description": "Unless someone else steps up, <@{userInitiatorId}> will be the proud owner of this channel in just `NaN minute`."
            },
            "isAvailable": true,
        } );
    } );

    it( "should support timeout in minutes and seconds (less then minute = seconds)", async () => {
        // Arrange.
        jest.useFakeTimers();

        const embed = new ClaimVoteStepInEmbed();

        // Act - Minutes.
        let result = await embed.build( {
            timeEnd: Date.now() + 1000 * 60 * 2, // 2 minutes.
        } );

        // Assert - Minutes.
        expect( result.attributes.description ).toEqual(
            "Unless someone else steps up, <@{userInitiatorId}> will be the proud owner of this channel in just `2 minutes`."
        );

        // Act - Seconds.
        result = await embed.build( {
            timeEnd: Date.now() + 1000 * 30, // 30 seconds.
        } );

        // Assert - Seconds.
        expect( result.attributes.description ).toEqual(
            "Unless someone else steps up, <@{userInitiatorId}> will be the proud owner of this channel in just `30 seconds`."
        );

        // Cleanup.
        jest.clearAllTimers();
    } );

    it( "should work according to the spec", async () => {
        // Arrange.
        const embed = new ClaimVoteStepInEmbed();

        // Act.
        const result = await embed.build( {
            userId: "user-id",
            userDisplayName: "user-display-name",
            timeEnd: Date.now() + 1000 * 60 * 2, // 2 minutes.
        } );

        // Assert.
        expect( result ).toEqual( {
            "name": "VertixBot/UI-V2/ClaimVoteStepInEmbed",
            "type": "embed",
            "attributes": {
                "description": "Unless someone else steps up, <@{userInitiatorId}> will be the proud owner of this channel in just `2 minutes`.",
                "title": "👑  {userInitiatorDisplayName} wish to claim this channel",
            },
            "isAvailable": true,
        } );
    } );
} );
