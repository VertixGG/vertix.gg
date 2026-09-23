import { jest } from "@jest/globals";

import { ChannelType, MessageComponentInteraction, SnowflakeUtil, VoiceChannel } from "discord.js";

import { ClientMock } from "@vertix.gg/test-utils/src/__mock__/discord/client-mock";
import { GuildMock } from "@vertix.gg/test-utils/src/__mock__/discord/guild-mock";

import { DynamicChannelVoteManager, VoteManagerResult } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";

import type { IDynamicChannelVoteStoredState } from "@vertix.gg/data/src/interfaces/dynamic-channel-vote";

import type { IVoteDefaultComponentInteraction } from "@vertix.gg/bot/src/managers/dynamic-channel-vote-manager";
import type { RawAnonymousGuildData, RawMessageComponentInteractionData } from "discord.js/typings/rawDataTypes";

import type { Client } from "discord.js";

// Real snowflakes rather than the "1"/"2" the older tests use, so a vote reads the way one does in
// a guild: ids above 2^32 are ordinary string keys and stay in the order they were added, where
// small numeric ones are reordered numerically by the object holding them.
const OWNER_ID = "830000000000000001",
    VOTER_ID = "830000000000000002",
    RIVAL_ID = "830000000000000003";

class MockDynamicChannelVoteManager extends DynamicChannelVoteManager {
    public getLogger() {
        return this.logger;
    }
}

class MessageComponentInteractionForVote extends MessageComponentInteraction<"cached"> implements IVoteDefaultComponentInteraction {
    private static mockRest( data: any ) {
        if ( ! data.entitlements ) {
            data.entitlements = [];
        }

        if ( ! data.authorizing_integration_owners ) {
            data.authorizing_integration_owners = {};
        }

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

describe( "VertixBot/Managers/ChannelVote", () => {
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

    afterEach( async() => {
        manager.destroy();

        jest.clearAllTimers();
        jest.clearAllMocks();
    } );

    const interactionFor = ( userId: string ) => {
        const interaction = new MessageComponentInteractionForVote( client, { channel, user: { id: userId } } );

        interaction.channelId = channel.id;

        return interaction;
    };

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

            it( "should not start the vote manager if it is already running for the specified channel", async() => {
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

        describe( "addCandidateFor()", () => {
            /*
             * A command names the room rather than standing in it.
             *
             * `addCandidate()` reads both the room and the member off the press, which holds for a
             * button on the claim message and not for `/voice claim` - so the pair is handed over
             * instead. Without it the command could only ever point at the message and let somebody
             * press it themselves.
             */
            it( "enters a candidate from a channel and a user id", () => {
                manager.start( channel, () => Promise.resolve() );

                const result = manager.addCandidateFor( channel, channel.id, VOTER_ID );

                expect( result ).toEqual( VoteManagerResult.Success );
                expect( Object.keys( manager.getResults( channel.id ) ) ).toEqual( [ VOTER_ID ] );
            } );

            it( "refuses the same candidate twice", () => {
                manager.start( channel, () => Promise.resolve() );

                manager.addCandidateFor( channel, channel.id, VOTER_ID );

                expect( manager.addCandidateFor( channel, channel.id, VOTER_ID ) )
                    .toEqual( VoteManagerResult.Already );
            } );

            it( "refuses a channel with no vote running", () => {
                expect( manager.addCandidateFor( channel, channel.id, VOTER_ID ) )
                    .toEqual( VoteManagerResult.NotRunning );
            } );
        } );

        describe( "stop()", () => {
            it( "should stop the channel and call the callback", async() => {
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

            it( "should log an error if the channel is not running", async() => {
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

        it( "full integration", async() => {
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

    /**
     * A claim vote is drawn by editing the message its button sits on, so the message goes on
     * standing whatever happens to the process. Everything that made it mean anything lived in
     * memory, which is the whole of this: a vote has to be sayable as plain facts, and those facts
     * have to add back up to the same vote.
     */
    describe( "surviving a restart", () => {
        const MESSAGE_ID = "830000000000000009";

        const storedVote = ( overrides: Partial<IDynamicChannelVoteStoredState> = {} ): IDynamicChannelVoteStoredState => ( {
            channelId: channel.id,
            messageId: MESSAGE_ID,
            initiatorId: OWNER_ID,
            startedAt: Date.now() - 1000,
            endsAt: Date.now() + 60000,
            isInitialInterval: false,
            isInitialCandidate: false,
            timings: { voteTimeout: 60000, voteAddTime: 1000, voteTimerInterval: 1000 },
            candidateIds: [ OWNER_ID, RIVAL_ID ],
            votes: { [ VOTER_ID ]: RIVAL_ID },
            ... overrides
        } );

        it( "says what the vote is every time it changes", () => {
            const changes: ( IDynamicChannelVoteStoredState | null )[] = [];

            manager.start( channel, () => Promise.resolve(), {
                initiatorId: OWNER_ID,
                messageId: MESSAGE_ID,
                onChanged: ( _channelId, state ) => void changes.push( state )
            } );

            manager.addCandidate( interactionFor( OWNER_ID ) );
            manager.addCandidate( interactionFor( RIVAL_ID ) );
            manager.addVote( interactionFor( VOTER_ID ), RIVAL_ID );

            const latest = changes[ changes.length - 1 ];

            expect( latest?.messageId ).toBe( MESSAGE_ID );
            expect( latest?.initiatorId ).toBe( OWNER_ID );
            expect( [ ... latest?.candidateIds ?? [] ].sort() ).toEqual( [ OWNER_ID, RIVAL_ID ].sort() );
            expect( latest?.votes ).toEqual( { [ VOTER_ID ]: RIVAL_ID } );
        } );

        it( "says there is nothing left once the vote is over", () => {
            const changes: ( IDynamicChannelVoteStoredState | null )[] = [];

            manager.start( channel, () => Promise.resolve(), {
                initiatorId: OWNER_ID,
                messageId: MESSAGE_ID,
                onChanged: ( _channelId, state ) => void changes.push( state )
            } );

            manager.clear( channel.id );

            expect( changes[ changes.length - 1 ] ).toBeNull();
        } );

        it( "brings back the candidates, the votes, the initiator and the deadline", () => {
            const stored = storedVote();

            manager.restore( channel, stored, () => Promise.resolve() );

            expect( manager.getState( channel.id ) ).toBe( "active" );
            expect( manager.getInitiatorId( channel.id ) ).toBe( OWNER_ID );
            expect( manager.getEndTime( channel.id ) ).toBe( stored.endsAt );
            expect( manager.getStartTime( channel.id ) ).toBe( stored.startedAt );
            expect( manager.getCandidatesCount( channel.id ) ).toBe( 2 );
            expect( manager.getMemberVotes( channel.id ) ).toEqual( { [ VOTER_ID ]: RIVAL_ID } );

            // Someone who only stepped in reads as nought rather than as absent, which is what puts
            // them on the board at all.
            expect( manager.getResults( channel.id ) ).toEqual( { [ OWNER_ID ]: 0, [ RIVAL_ID ]: 1 } );
            expect( manager.getWinnerId( channel.id ) ).toBe( RIVAL_ID );
        } );

        it( "keeps the deadline it was given rather than counting a fresh one", () => {
            const stored = storedVote( { endsAt: Date.now() + 5000 } );

            manager.restore( channel, stored, () => Promise.resolve() );

            expect( manager.getEndTime( channel.id ) ).toBe( stored.endsAt );
            expect( manager.isTimeExpired( channel.id ) ).toBe( false );
        } );

        it( "closes out a vote whose time ran out while nothing was running", async() => {
            const states: string[] = [],
                changes: ( IDynamicChannelVoteStoredState | null )[] = [];

            manager.restore(
                channel,
                storedVote( { endsAt: Date.now() - 1 } ),
                ( _channel, state ) => {
                    states.push( state );

                    return Promise.resolve();
                },
                ( _channelId, state ) => void changes.push( state )
            );

            await jest.advanceTimersByTimeAsync( 0 );

            // The outcome it would have reached had nothing stopped: the tally it already had,
            // announced, and the room handed over.
            expect( states ).toContain( "done" );
            expect( manager.getState( channel.id ) ).toBe( "idle" );
            expect( changes[ changes.length - 1 ] ).toBeNull();
        } );

        /**
         * `start()` armed its interval after the first tick without asking whether there was still
         * a vote. Live that is almost always true; restoring one that has already expired makes it
         * false every time, and the interval would then belong to an idle event and fire for the
         * rest of the process.
         */
        it( "leaves no timer behind when it closes one out", async() => {
            manager.restore( channel, storedVote( { endsAt: Date.now() - 1 } ), () => Promise.resolve() );

            await jest.advanceTimersByTimeAsync( 0 );

            expect( jest.getTimerCount() ).toBe( 0 );
        } );
    } );

    describe( "unit tests", () => {
        beforeEach( () => {
            // Stands in for what `start()` would have left behind. Carries the timings it settles
            // too, taken from the manager under test rather than repeated as numbers - anything
            // that extends the vote reads them, and an event without them throws rather than
            // reporting the thing being tested.
            const { runTime, addTime, timerIntervalTime } = manager.getTimeSettings();

            manager.getEvents()[ channel.id ] = {
                channel,
                state: "active",
                isInitialInterval: false,
                isInitialCandidate: false,
                timings: {
                    voteTimeout: runTime,
                    voteAddTime: addTime,
                    voteTimerInterval: timerIntervalTime,
                },
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

                // Assert - a voter is recorded by id and nothing else. The interaction the press
                // arrived on used to be kept beside it, was never read, and could not have survived
                // a restart if anything had wanted it.
                expect( manager[ "voteMembers" ][ channel.id ].votes[ targetId ] ).toEqual( {
                    [ interaction.user.id ]: {},
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

        describe( "getWinnerId()", () => {
            // As `startVote()` leaves it: whoever opened the vote is entered as a candidate right
            // after it starts, which is also what puts them on the board to be voted for. Nobody
            // can be voted for before that, so there is no arrangement where a name in the tally
            // arrived any other way.
            beforeEach( () => {
                manager.getEvents()[ channel.id ].initiatorId = OWNER_ID;

                manager.addCandidate( interactionFor( OWNER_ID ) );
            } );

            it( "should declare the person with the most votes the winner, not the initiator", () => {
                // Arrange - somebody else steps in.
                manager.addCandidate( interactionFor( RIVAL_ID ) );

                // Act - a vote for the rival. Nobody votes for the person who opened it.
                manager.addVote( interactionFor( VOTER_ID ), RIVAL_ID );

                // Assert.
                expect( manager.getResults( channel.id )[ RIVAL_ID ] ).toBe( 1 );
                expect( manager.getResults( channel.id )[ OWNER_ID ] ).toBe( 0 );

                expect( manager.getWinnerId( channel.id ) ).toBe( RIVAL_ID );
            } );

            it( "should hand a tie to whoever opened the vote", () => {
                // Arrange - both on the board, neither voted for.
                manager.addCandidate( interactionFor( RIVAL_ID ) );

                // Assert.
                expect( manager.getWinnerId( channel.id ) ).toBe( OWNER_ID );
            } );
        } );
    } );
} );
