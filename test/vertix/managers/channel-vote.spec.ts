import { ChannelType, Client, MessageComponentInteraction, SnowflakeUtil, VoiceChannel } from "discord.js";

import { RawAnonymousGuildData, RawMessageComponentInteractionData } from "discord.js/typings/rawDataTypes";

import { ClientMock } from "../0_mock/discord/client-mock";
import { GuildMock } from "../0_mock/discord/guild-mock";

import { DynamicChannelVoteManager, IVoteDefaultComponentInteraction } from "@vertix/managers/dynamic-channel-vote-manager";

class MockDynamicChannelVoteManager extends DynamicChannelVoteManager {
    public getLogger() {
        return this.logger;
    }
}

class MessageComponentInteractionForVote extends MessageComponentInteraction<"cached"> implements IVoteDefaultComponentInteraction {
    private static mockRest( data: any ) {
        if ( ! data.message ) {
            data.message = {
                id: SnowflakeUtil.generate(),
            };
        }

        if ( data.channel ) {
            if ( ! data.channel_id ) {
                data.channel_id = data.channel.id;
            }

            if ( ! data.message.channel_id ) {
                data.message.channel_id = data.channel.id;
            }
        }

        if ( ! data.data ) {
            data.data = {
                custom_id: SnowflakeUtil.generate(),
                component_type: 0,
            };
        }

        return { ... data };
    }

    public constructor( client: Client<true>, dataMocker: any, data: RawMessageComponentInteractionData = MessageComponentInteractionForVote.mockRest( dataMocker ) ) {
        super( client, data );
    }

    public get channel(): VoiceChannel {
        return super.channel as VoiceChannel;
    }
}

describe( "Vertix/Managers/ChannelVote", () => {
    let client: ClientMock;

    let manager: MockDynamicChannelVoteManager;

    let guild: GuildMock;
    let channel: VoiceChannel;

    beforeEach( () => {
        client = new ClientMock();

        guild = new GuildMock( client, {
            id: "825823483284238",
            name: "Test Guild",
        } as RawAnonymousGuildData );

        channel = new VoiceChannel( guild, {
            id: "825823483284238",
            type: ChannelType.GuildVoice,
            name: "Test Channel",

            // @ts-ignore
        }, client );

        jest.useFakeTimers();

        manager = new MockDynamicChannelVoteManager( 0, 1, 0 );
    } );

    afterEach( async () => {
        manager.destroy();

        jest.clearAllTimers();
        jest.clearAllMocks();
    } );

    describe( "integration tests", () => {

        describe( "start()", () => {
            it( "should start the vote manager for the specified channel", () => {
                // Arrange - Define a mock callback function.
                const mockCallback = jest.fn( () => Promise.resolve() );

                // Act - Call the start method.
                manager.start( channel, mockCallback );

                // Assert.
                expect( manager.getEvents()[ channel.id ].state ).toEqual( "active" );
                expect( mockCallback ).toHaveBeenCalled();
            } );

            it( "should not start the vote manager if it is already running for the specified channel", async () => {
                // Arrange - Define a mock callback function.
                const mockCallback = jest.fn( () => Promise.resolve() );

                manager.start( channel, mockCallback );

                // Give it time to tick.
                jest.runAllTimers();

                // Act - Call the start method twice.
                manager.start( channel, mockCallback );

                // Assert.
                expect( manager.getEvents()[ channel.id ].state ).toEqual( "active" );
                expect( mockCallback ).toHaveBeenCalledTimes( 1 );
            } );
        } );

        describe( "stop()", () => {
            it( "should stop the channel and call the callback", async () => {
                // Arrange - Define a mock callback function.
                const mockCallback = jest.fn( () => Promise.resolve() );

                // Set up the channel.
                manager.start( channel, mockCallback );
                expect( manager.getEvents()[ channel.id ].state ).toBe( "active" );

                // Act - Call the function.
                await manager.stop( channel, mockCallback );

                // Assert.
                expect( manager.getEvents()[ channel.id ].state ).toBe( "idle" );
                expect( mockCallback ).toHaveBeenCalledWith( channel, "done" );
            } );

            it( "should log an error if the channel is not running", async () => {
                // Arrange - Define a mock callback function.
                const mockCallback = jest.fn( () => Promise.resolve() );

                jest.spyOn( manager.getLogger(), "error" );

                // Act - Call the function.
                await manager.stop( channel, mockCallback );

                // Assert.
                expect( manager.getEvents()[ channel.id ]?.state ).toBeUndefined();
                expect( manager.getLogger().error ).toHaveBeenCalledWith(
                    manager.stop,
                    `Guild id: '${ guild.id }', channel id: '${ channel.id }' - Channel not running`
                );
                expect( mockCallback ).not.toHaveBeenCalled();
            } );
        } );

        it( "full integration", async () => {
            // Arrange - Define a mock callback function.
            const mockCallback = jest.fn( () => Promise.resolve() );

            manager.start( channel, mockCallback );

            // Set up initial variables and interactions.
            const interaction1 = new MessageComponentInteractionForVote( client, { channel, user: { id: "1" } } ),
                interaction2 = new MessageComponentInteractionForVote( client, { channel, user: { id: "2" } } ),
                interaction3 = new MessageComponentInteractionForVote( client, { channel, user: { id: "3" } } ),
                interaction4 = new MessageComponentInteractionForVote( client, { channel, user: { id: "4" } } ),
                interactionCandidate = new MessageComponentInteractionForVote( client, { channel, user: { id: "5" } } );

            // Set the channelId for each interaction.
            interaction1.channelId = channel.id;
            interaction2.channelId = channel.id;
            interaction3.channelId = channel.id;
            interaction4.channelId = channel.id;
            interactionCandidate.channelId = channel.id;

            // Add interactions to manager.
            manager.addVote( interaction1, interaction1.user.id ); // 1 -> 1 = 1(0) (self vote)

            manager.addVote( interaction2, interaction1.user.id ); // 2 -> 1 = 1(1)

            manager.addVote( interaction1, interaction2.user.id ); // 1 -> 2 = 2(1)

            manager.addVote( interaction1, interaction3.user.id ); // 1 -> 3 = 3(0) (already voted)

            manager.addVote( interaction3, interaction4.user.id ); // 3 -> 4 = 4(1)

            // Add only the candidate interaction to the manager.
            manager.addCandidate( interactionCandidate );

            // Ensure that interactions have been added to manager and have voted.
            expect( manager.hasVoted( interaction1 ) ).toBe( true );
            expect( manager.hasVoted( interaction2 ) ).toBe( true );
            expect( manager.hasVoted( interaction3 ) ).toBe( true );
            expect( manager.hasVoted( interaction4 ) ).toBe( false );

            // Get results from the manager.
            let results = manager.getResults( channel.id );

            // Ensure results are as expected.
            expect( results[ interaction1.user.id ] ).toBe( 1 );
            expect( results[ interaction2.user.id ] ).toBe( 1 );
            expect( results[ interaction3.user.id ] ).toBeUndefined();
            expect( results[ interaction4.user.id ] ).toBe( 1 );

            manager.removeVote( interaction1 );
            manager.removeVote( interaction2 );

            // Do not remove interaction3.

            manager.removeVote( interaction4 );

            // Ensure that interactions have been removed from manager and have not voted.
            expect( manager.hasVoted( interaction1 ) ).toBe( false );
            expect( manager.hasVoted( interaction2 ) ).toBe( false );
            expect( manager.hasVoted( interaction3 ) ).toBe( true );
            expect( manager.hasVoted( interaction4 ) ).toBe( false );

            // Get results from the manager after removal.
            results = manager.getResults( channel.id );

            // Ensure results are as expected after removal.
            expect( results[ interaction1.user.id ] ).toBeUndefined();
            expect( results[ interaction2.user.id ] ).toBeUndefined();
            expect( results[ interaction3.user.id ] ).toBeUndefined();
            expect( results[ interaction4.user.id ] ).toBe( 1 ); // Since 3 voted for 4.
            expect( results[ interactionCandidate.user.id ] ).toBe( 0 );

            // Stop the manager.
            await manager.stop( channel, mockCallback );

            // Ensure that the callback has been called.
            expect( mockCallback ).toHaveBeenCalledWith( channel, "done" );

            // Ensure that the channel has been cleared.
            expect( manager.getEvents()[ channel.id ].state ).toBe( "idle" );
        } );

    } );

    describe( "unit tests", () => {
        beforeEach( () => {
            manager.getEvents()[ channel.id ] = {
                channel,
                state: "active",
                isInitialInterval: false,
                isInitialCandidate: false,
            };
        } );

        afterEach( () => {
            manager.clear( channel.id );
        } );

        describe( "add()", () => {
            it( "should add an interaction to the votes map for the given targetId", () => {
                // Arrange.
                const targetId = "789",
                    interaction = new MessageComponentInteractionForVote( client, {
                        channel,
                        user: { id: "user-123" }
                    } );

                interaction.channelId = channel.id;

                // Act.
                manager.addVote( interaction, targetId );

                // Assert.
                expect( manager[ "voteMembers" ][ channel.id ].votes[ targetId ] ).toEqual( {
                    [ interaction.user.id ]: { interaction },
                } );
            } );

            it( "should log an error if the interaction has no channelId", () => {
                // Arrange.
                const userId = "user-456",
                    interaction = new MessageComponentInteractionForVote( client, { user: { id: userId } } );

                jest.spyOn( manager.getLogger(), "error" );

                // Act.
                manager.addVote( interaction, "789" );

                // Assert.
                expect( manager.getLogger().error ).toHaveBeenCalledWith(
                    manager[ "addInternal" ],
                    `Guild id: 'null', user id: '${ interaction.user.id }' - Interaction has no channelId`
                );
            } );
        } );

        describe( "remove", () => {
            const userId = "user-123",
                targetId = "789";

            it( "should remove the vote", () => {
                // Arrange.
                const interaction = new MessageComponentInteractionForVote( client, { channel, user: { id: userId } } );

                interaction.channelId = channel.id;

                manager.addVote( interaction, targetId );

                // Act.
                manager.removeVote( interaction );

                // Assert.
                expect( manager[ "voteMembers" ][ channel.id ].votes[ targetId ] ).toEqual( {} );
            } );

            it( "should log an error if the interaction has no channelId", () => {
                // Arrange.
                const interaction = new MessageComponentInteractionForVote( client, { user: { id: userId } } );

                jest.spyOn( manager.getLogger(), "error" );

                // Act.
                manager.removeVote( interaction );

                // Assert.
                expect( manager.getLogger().error ).toHaveBeenCalledWith(
                    manager.removeVote,
                    `Guild id: 'null', user id: '${ interaction.user.id }' - Interaction has no channelId`
                );
            } );

            it( "should log a warning if the interaction has no channel in membersVote", () => {
                // Arrange.
                const interaction = new MessageComponentInteractionForVote( client, { channel, user: { id: userId } } );

                interaction.channelId = channel.id;

                jest.spyOn( manager.getLogger(), "warn" );

                // Act.
                manager.removeVote( interaction );

                // Assert.
                expect( manager.getLogger().warn ).toHaveBeenCalledWith(
                    manager.removeVote,
                    `Guild id: 'null', channel id: '${ interaction.channelId }', user id: '${ interaction.user.id }' - Interaction has no channel in membersVote`
                );
            } );
        } );

        describe( "hasVoted()", () => {
            const userId = "user-123",
                targetId = "789";

            it( "returns false if interaction has no channelId", () => {
                // Arrange.
                const interaction = new MessageComponentInteractionForVote( client, { channel, user: { id: userId } } ),
                    errorSpy = jest.spyOn( manager.getLogger(), "error" );

                interaction.channelId = "";

                // Act.
                const result = manager.hasVoted( interaction );

                // Assert.
                expect( errorSpy ).toHaveBeenCalledWith(
                    manager.hasVoted,
                    `Guild id: 'null', user id: '${ userId }' - Interaction has no channelId`
                );
                expect( result ).toBe( false );
            } );

            it( "should returns false if interaction has no channel in votes", () => {
                // Arrange.
                const interaction = new MessageComponentInteractionForVote( client, { channel, user: { id: userId } } ),
                    warnSpy = jest.spyOn( manager.getLogger(), "warn" );

                interaction.channelId = channel.id;

                // Act.
                const result = manager.hasVoted( interaction );

                // Assert.
                expect( warnSpy ).toHaveBeenCalledWith(
                    manager.hasVoted,
                    `Guild id: 'null', channel id: '${ channel.id }', user id: '${ userId }' - Interaction has no channel in votes`
                );
                expect( result ).toBe( false );
            } );

            it( "should returns false if interaction has not voted", () => {
                // Arrange.
                const interaction = new MessageComponentInteractionForVote( client, { channel, user: { id: userId } } );

                manager[ "voteKeeper" ][ channel.id ] = {};

                // Act.
                const result = manager.hasVoted( interaction );

                // Assert.
                expect( result ).toBe( false );
            } );

            it( "should returns true if interaction has voted", () => {
                // Arrange.
                const interaction = new MessageComponentInteractionForVote( client, { channel, user: { id: userId } } );

                interaction.channelId = channel.id;

                manager[ "voteKeeper" ][ channel.id ] = {
                    [ userId ]: targetId,
                };

                // Act.
                const result = manager.hasVoted( interaction );

                // Assert.
                expect( result ).toBe( true );
            } );
        } );

        describe( "getResults()", () => {
            const userId = "user-123";

            it( "should returns empty object if there are no votes for a channel", () => {
                // Arrange.
                const expectedResults = {};

                // Act.
                const results = manager.getResults( "what-ever" );

                // Assert.
                expect( results ).toEqual( expectedResults );
            } );

            it( "should returns object with targetIds as keys and vote counts as values if there are votes for a channel", () => {
                // Arrange.
                const interaction = new MessageComponentInteractionForVote( client, { channel, user: { id: userId } } ),
                    interaction2 = new MessageComponentInteractionForVote( client, {
                        channel,
                        user: { id: "user-bob" }
                    } ),
                    interaction3 = new MessageComponentInteractionForVote( client, {
                        channel,
                        user: { id: "user-greg" }
                    } ),
                    targetId1 = "789",
                    targetId2 = "456";

                interaction.channelId = channel.id;
                interaction2.channelId = channel.id;
                interaction3.channelId = channel.id;

                manager.addVote( interaction, targetId1 );

                manager.addVote( interaction, targetId2 );
                manager.addVote( interaction2, targetId2 );
                manager.addVote( interaction2, targetId2 );

                manager.addVote( interaction3, targetId2 );

                const expectedResults = {
                    [ targetId1 ]: 1,
                    [ targetId2 ]: 2,
                };

                // Act.
                const results = manager.getResults( channel.id );

                // Assert.
                expect( results ).toEqual( expectedResults );
            } );

            it( "should returns empty object if the channelId is invalid", () => {
                // Arrange.
                const invalidChannelId = "456",
                    expectedResults = {};

                // Act.
                const results = manager.getResults( invalidChannelId );

                // Assert.
                expect( results ).toEqual( expectedResults );
            } );
        } );
    } );
} );
