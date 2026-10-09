import { TeamLobbySplitPlanner } from "@vertix.gg/bot/src/utils/team-lobby/team-lobby-split-planner";

import type { ITeamLobbyRoomNaming } from "@vertix.gg/bot/src/utils/team-lobby/team-lobby-split-planner";

const NAMING: ITeamLobbyRoomNaming = {
    teamRoomName: "{color} Team {index}",
    teamRoomColors: [ "🔴", "🔵", "🟢" ],
    groupRoomName: "👥 Group {index}"
};

const members = ( count: number ) => Array.from( { length: count }, ( _, index ) => `member-${ index + 1 }` );

/** A shuffle that leaves every order as it came - Fisher-Yates swaps each place with itself. */
const keepOrder = () => 0.999999;

/**
 * Who goes where when a lobby splits. Pure rules - nothing here touches discord - so each of them
 * is checked on its own, with the shuffle held still where the order matters.
 */
describe( "VertixBot/Utils/TeamLobbySplitPlanner", () => {
    const planner = TeamLobbySplitPlanner.$;

    describe( "isValidCount()", () => {
        it( "should take from two to eight teams", () => {
            // Act & Assert.
            expect( planner.isValidCount( "random-teams", 2 ) ).toBe( true );
            expect( planner.isValidCount( "pick-teams", 8 ) ).toBe( true );
            expect( planner.isValidCount( "random-teams", 1 ) ).toBe( false );
            expect( planner.isValidCount( "pick-teams", 9 ) ).toBe( false );
        } );

        it( "should take groups of two to ten - a group of one is a member alone in a room", () => {
            // Act & Assert.
            expect( planner.isValidCount( "groups", 2 ) ).toBe( true );
            expect( planner.isValidCount( "groups", 10 ) ).toBe( true );
            expect( planner.isValidCount( "groups", 1 ) ).toBe( false );
            expect( planner.isValidCount( "groups", 11 ) ).toBe( false );
        } );

        it( "should refuse a count that is not a whole number", () => {
            // Act & Assert.
            expect( planner.isValidCount( "random-teams", 2.5 ) ).toBe( false );
            expect( planner.isValidCount( "groups", Number.NaN ) ).toBe( false );
        } );
    } );

    describe( "random teams", () => {
        it( "should deal everyone into the teams, each exactly once, no team bigger than another by more than one", () => {
            // Act.
            const plan = planner.plan( { mode: "random-teams", count: 3, memberIds: members( 7 ) }, NAMING, Math.random );

            // Assert.
            const sizes = plan.map( ( room ) => room.memberIds.length ).sort();

            expect( sizes ).toEqual( [ 2, 2, 3 ] );
            expect( plan.flatMap( ( room ) => room.memberIds ).sort() ).toEqual( members( 7 ).sort() );
        } );

        it( "should name each team by its colour, in order, and hold none of them to a limit", () => {
            // Act.
            const plan = planner.plan( { mode: "random-teams", count: 2, memberIds: members( 4 ) }, NAMING, keepOrder );

            // Assert.
            expect( plan ).toEqual( [
                { name: "🔴 Team 1", userLimit: 0, memberIds: [ "member-1", "member-3" ] },
                { name: "🔵 Team 2", userLimit: 0, memberIds: [ "member-2", "member-4" ] }
            ] );
        } );

        it( "should go round the colours again when there are more teams than colours", () => {
            // Act.
            const plan = planner.plan( { mode: "random-teams", count: 4, memberIds: members( 4 ) }, NAMING, keepOrder );

            // Assert.
            expect( plan.map( ( room ) => room.name ) ).toEqual( [ "🔴 Team 1", "🔵 Team 2", "🟢 Team 3", "🔴 Team 4" ] );
        } );
    } );

    describe( "picked teams", () => {
        it( "should open the teams empty, each held to its share of the lobby", () => {
            // Act - five members, two teams: three to a team, so nobody is turned away.
            const plan = planner.plan( { mode: "pick-teams", count: 2, memberIds: members( 5 ) }, NAMING );

            // Assert.
            expect( plan ).toEqual( [
                { name: "🔴 Team 1", userLimit: 3, memberIds: [] },
                { name: "🔵 Team 2", userLimit: 3, memberIds: [] }
            ] );
        } );

        it( "should hold the teams to nothing while the lobby has fewer members than teams", () => {
            // Act - opened ahead of the players, a limit worked out from one member would turn the rest away.
            const plan = planner.plan( { mode: "pick-teams", count: 3, memberIds: members( 1 ) }, NAMING );

            // Assert.
            expect( plan.map( ( room ) => room.userLimit ) ).toEqual( [ 0, 0, 0 ] );
        } );
    } );

    describe( "groups", () => {
        it( "should open as few groups as hold everyone, none over its size", () => {
            // Act.
            const plan = planner.plan( { mode: "groups", count: 3, memberIds: members( 7 ) }, NAMING, keepOrder );

            // Assert.
            expect( plan ).toEqual( [
                { name: "👥 Group 1", userLimit: 3, memberIds: [ "member-1", "member-4", "member-7" ] },
                { name: "👥 Group 2", userLimit: 3, memberIds: [ "member-2", "member-5" ] },
                { name: "👥 Group 3", userLimit: 3, memberIds: [ "member-3", "member-6" ] }
            ] );
        } );

        it( "should pair everyone up for groups of two", () => {
            // Act.
            const plan = planner.plan( { mode: "groups", count: 2, memberIds: members( 4 ) }, NAMING, keepOrder );

            // Assert.
            expect( plan ).toEqual( [
                { name: "👥 Group 1", userLimit: 2, memberIds: [ "member-1", "member-3" ] },
                { name: "👥 Group 2", userLimit: 2, memberIds: [ "member-2", "member-4" ] }
            ] );
        } );
    } );

    describe( "countRooms()", () => {
        it( "should open as many rooms as teams, whoever is in the lobby", () => {
            // Act & Assert.
            expect( planner.countRooms( { mode: "random-teams", count: 4, memberIds: members( 10 ) } ) ).toBe( 4 );
            expect( planner.countRooms( { mode: "pick-teams", count: 2, memberIds: [] } ) ).toBe( 2 );
        } );

        it( "should open as many groups as it takes to hold everyone", () => {
            // Act & Assert.
            expect( planner.countRooms( { mode: "groups", count: 4, memberIds: members( 10 ) } ) ).toBe( 3 );
            expect( planner.countRooms( { mode: "groups", count: 2, memberIds: members( 10 ) } ) ).toBe( 5 );
        } );
    } );

    describe( "nameRoom()", () => {
        it( "should leave no stray space where the colour list is empty", () => {
            // Act.
            const name = planner.nameRoom( "random-teams", 2, 1, { ... NAMING, teamRoomColors: [] } );

            // Assert.
            expect( name ).toBe( "Team 1" );
        } );
    } );

    describe( "shuffle()", () => {
        it( "should keep every member exactly once, in whatever order", () => {
            // Act.
            const shuffled = planner.shuffle( members( 12 ), Math.random );

            // Assert.
            expect( [ ... shuffled ].sort() ).toEqual( members( 12 ).sort() );
        } );

        it( "should not touch the list it was given", () => {
            // Arrange.
            const given = members( 5 );

            // Act.
            planner.shuffle( given, () => 0 );

            // Assert.
            expect( given ).toEqual( members( 5 ) );
        } );
    } );
} );
