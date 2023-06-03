import { ClaimVoteEmbed } from "@vertix/ui-v2/claim/vote/claim-vote-embed";

describe( "Vertix/UI-V2/ClaimVoteEmbed", () => {
    beforeEach( () => {
        jest.useFakeTimers();
    } );

    afterEach( () => {
        jest.clearAllTimers();
    } );

    it( "should passthroughs sanity check", async () => {
        // Arrange.
        const embed = new ClaimVoteEmbed();

        // Act.
        const result = await embed.build( {
            timeEnd: Date.now() + 1000,
        } );

        // Assert.
        expect( result ).toEqual( {
            "name": "Vertix/UI-V2/ClaimVoteEmbed",
            "type": "embed",
            "attributes": {
                "title": "👑  0 Candidates wish to claim this channel",
                "description": "The countdown is on!\n" +
                    "In just `1 second`, the voting will come to a close.\n" +
                    "In case of a tie, <@{userInitiatorId}> will become the new owner.\n\n" +
                    "There are no candidates yet."
            },
            "isAvailable": true,
        } );
    } );

    it( "it should work according to spec", async () => {
        // Arrange.
        const embed = new ClaimVoteEmbed();

        // Act.
        const result = await embed.build( {
            timeEnd: Date.now() + 90000, // 1 Minute and 30 Seconds.
            userInitiatorId: "bob",
            results: {
                "bob": 1,
                "iNewLegend": 5,
                "alice": 2,
            },
        } );

        // Assert.
        expect( result ).toEqual( {
            "name": "Vertix/UI-V2/ClaimVoteEmbed",
            "type": "embed",
            "attributes": {
                "title": "👑  3 Candidates wish to claim this channel",
                "description": "The countdown is on!\n" +
                    "In just `1.5 minutes`, the voting will come to a close.\n" +
                    "In case of a tie, <@bob> will become the new owner.\n\n" +
                    "🏅 <@iNewLegend> - 5 Votes\n" +
                    "<@alice> - 2 Votes\n" +
                    "<@bob> - 1 Votes"
            },
            "isAvailable": true,
        } );
    } );
} );
