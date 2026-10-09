import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { getBoundHandler } from "@vertix.gg/bot/test/__test_utils__/bound-handler";

import type { TeamLobbyAdapter as TTeamLobbyAdapter } from "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-adapter";

const LOBBY_ID = "840000000000000001",
    PANEL_ID = "870000000000000001",
    SCREEN_ID = "880000000000000001",
    USER_ID = "500000000000000001",
    ALEX_ID = "600000000000000001",
    MIA_ID = "600000000000000002";

// Imported once the ui service is there to answer: an element reaches for it as it is constructed.
let TeamLobbyAdapter: typeof TTeamLobbyAdapter;

const asInstance = <T>( fake: object ): T => fake as T;

interface IAnswers {
    refusal?: object | null;
    split?: object;
    recall?: object;
    /** The panel's lobby was deleted while the bot was away, so its channel names nothing. */
    isLobbyGone?: boolean;
    /** What the screen already holds - members picked on it, and the number. */
    storedArgs?: Record<string, unknown>;
    /** Who is in the lobby, of the members a screen asks about. */
    inLobby?: string[];
    /** Why the lobby could not make the split the screen asks for, when it could not. */
    planRefusal?: object | null;
}

function setup( answers: IAnswers = {} ) {
    const lobby = { id: LOBBY_ID };

    const inLobby = new Set( answers.inLobby ?? [ ALEX_ID, MIA_ID ] );

    // The screens the adapter asked to have drawn again as the lobby changes, by screen.
    const watchers = new Map<string, () => Promise<void>>();

    const service = {
        getLobbyByPanelChannel: jest.fn( async() => answers.isLobbyGone ? null : lobby ),
        getSplitAccessRefusal: jest.fn( async() => answers.refusal ?? null ),
        getPlayersPresence: jest.fn( ( _lobby: unknown, playerIds: string[] ) =>
            playerIds.map( ( id ) => ( { id, isReady: inLobby.has( id ) } ) )
        ),
        getSplitPlanRefusal: jest.fn( async() => answers.planRefusal ?? null ),
        watchLobbyPresence: jest.fn( ( _lobbyId: string, screenId: string, redraw: () => Promise<void> ) => {
            watchers.set( screenId, redraw );
        } ),
        unwatchLobbyPresence: jest.fn( ( _lobbyId: string, screenId: string ) => {
            watchers.delete( screenId );
        } ),
        split: jest.fn( async() => answers.split ?? { code: "success", rooms: [ {}, {} ], moved: 4, missed: 0 } ),
        recall: jest.fn( async() => answers.recall ?? { code: "success", moved: 4, missed: 0 } )
    };

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( asInstance( { get: () => service } ) );

    // Args are kept per screen, as the adapter keeps them per message.
    let stored: Record<string, unknown> | undefined = answers.storedArgs;

    const context = {
        ephemeralWithStep: jest.fn( async() => undefined ),
        editReplyWithStep: jest.fn( async() => undefined ),
        updateInteractionDefer: jest.fn( async() => undefined ),
        getArgs: jest.fn( () => stored ),
        setArgs: jest.fn( ( _interaction: unknown, args: Record<string, unknown> ) => {
            stored = args;
        } ),
        deleteArgs: jest.fn( () => {
            stored = undefined;
        } )
    };

    // Pressed in the lobby's panel channel, on the screen a press opened.
    const interaction = ( values: string[] = [] ) => ( {
        values,
        channel: { id: PANEL_ID },
        member: { id: USER_ID },
        message: { id: SCREEN_ID },
        createdTimestamp: Date.now()
    } );

    const handler = ( elementId: string ) =>
        getBoundHandler<typeof context, ReturnType<typeof interaction>>( TeamLobbyAdapter, elementId );

    return { lobby, service, context, interaction, handler, inLobby, watchers };
}

/**
 * The panel in a team lobby's panel channel and its own chat. What it decides is only which screen
 * answers a press: the service decides whether the press may do anything, and these pin that each
 * answer reaches the member the right way - the screen asking how to split is filled in and redrawn
 * in place, **Apply** turns it into the split or into why not, and a call back that worked says
 * nothing because the panel itself changes.
 */
describe( "VertixBot/UI-V3/TeamLobbyAdapter", () => {
    beforeAll( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        ( { TeamLobbyAdapter } = await import( "@vertix.gg/bot/src/ui/v3/team-lobby/team-lobby-adapter" ) );
    } );

    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    afterEach( () => jest.restoreAllMocks() );

    it( "should keep each member to one screen beside the panel - a new press replaces the last", () => {
        // Arrange - the hook the adapter's ephemeral screens read for whether to take the last one away.
        const adapter = Object.create( TeamLobbyAdapter.prototype ) as { shouldDeletePreviousReply(): boolean };

        // Act & Assert.
        expect( adapter.shouldDeletePreviousReply() ).toBe( true );
    } );

    describe( "a mode's button", () => {
        it.each( [
            [ "VertixBot/UI-V3/TeamLobbyRandomTeamsButton", "VertixBot/UI-V3/TeamLobbyRandomTeams" ],
            [ "VertixBot/UI-V3/TeamLobbyPickTeamsButton", "VertixBot/UI-V3/TeamLobbyPickTeams" ],
            [ "VertixBot/UI-V3/TeamLobbyGroupsButton", "VertixBot/UI-V3/TeamLobbyGroups" ]
        ] )( "%s should ask how on a screen of its own, with nothing yet to apply", async( button, step ) => {
            // Arrange.
            const { context, interaction, handler } = setup();

            const pressed = interaction();

            // Act.
            await handler( button )( context, pressed );

            // Assert.
            expect( context.ephemeralWithStep ).toHaveBeenCalledWith( pressed, step, { isApplyEnabled: false } );
        } );

        it( "should say why instead, and ask nothing, when the split could not happen", async() => {
            // Arrange.
            const { context, interaction, handler } = setup( { refusal: { code: "not-covered" } } );

            const pressed = interaction();

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyRandomTeamsButton" )( context, pressed );

            // Assert.
            expect( context.ephemeralWithStep ).toHaveBeenCalledTimes( 1 );
            expect( context.ephemeralWithStep ).toHaveBeenCalledWith(
                pressed,
                "VertixBot/UI-V3/TeamLobbyRefused",
                expect.objectContaining( { refusalCode: "not-covered" } )
            );
        } );
    } );

    describe( "the screen asking how", () => {
        it.each( [
            [ "VertixBot/UI-V3/TeamLobbyRandomTeamsMenu", "VertixBot/UI-V3/TeamLobbyRandomTeams" ],
            [ "VertixBot/UI-V3/TeamLobbyPickTeamsMenu", "VertixBot/UI-V3/TeamLobbyPickTeams" ],
            [ "VertixBot/UI-V3/TeamLobbyGroupSizeMenu", "VertixBot/UI-V3/TeamLobbyGroups" ]
        ] )( "%s should remember the number and ready Apply, splitting nothing yet", async( menu, step ) => {
            // Arrange.
            const { service, context, interaction, handler } = setup();

            const picked = interaction( [ "3" ] );

            // Act.
            await handler( menu )( context, picked );

            // Assert.
            expect( context.setArgs ).toHaveBeenCalledWith( picked, { count: "3" } );
            expect( context.editReplyWithStep ).toHaveBeenCalledWith( picked, step, {
                playerIds: [],
                count: "3",
                players: [],
                isApplyEnabled: true,
                planRefusal: null,
                roomsLimit: null
            } );
            expect( service.split ).not.toHaveBeenCalled();
        } );

        it.each( [
            [ "VertixBot/UI-V3/TeamLobbyRandomTeamsPlayersMenu", "VertixBot/UI-V3/TeamLobbyRandomTeams" ],
            [ "VertixBot/UI-V3/TeamLobbyPickTeamsPlayersMenu", "VertixBot/UI-V3/TeamLobbyPickTeams" ],
            [ "VertixBot/UI-V3/TeamLobbyGroupsPlayersMenu", "VertixBot/UI-V3/TeamLobbyGroups" ]
        ] )( "%s should list who was picked, each marked by whether they are in the lobby", async( menu, step ) => {
            // Arrange - Mia is not in the lobby.
            const { context, interaction, handler } = setup( { inLobby: [ ALEX_ID ], storedArgs: { count: "2" } } );

            const picked = interaction( [ ALEX_ID, MIA_ID ] );

            // Act.
            await handler( menu )( context, picked );

            // Assert - Apply waits for Mia.
            expect( context.editReplyWithStep ).toHaveBeenCalledWith( picked, step, {
                playerIds: [ ALEX_ID, MIA_ID ],
                count: "2",
                players: [ { id: ALEX_ID, isReady: true }, { id: MIA_ID, isReady: false } ],
                isApplyEnabled: false,
                planRefusal: null,
                roomsLimit: null
            } );
        } );

        it( "should keep Apply off until a number is picked, even with everybody picked in the lobby", async() => {
            // Arrange.
            const { context, interaction, handler } = setup();

            const picked = interaction( [ ALEX_ID ] );

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyRandomTeamsPlayersMenu" )( context, picked );

            // Assert.
            expect( context.editReplyWithStep ).toHaveBeenCalledWith(
                picked,
                "VertixBot/UI-V3/TeamLobbyRandomTeams",
                expect.objectContaining( { isApplyEnabled: false } )
            );
        } );

        it( "should draw the screen again when a member picked comes into the lobby, readying Apply", async() => {
            // Arrange - Mia picked while away.
            const { context, interaction, handler, inLobby, watchers } = setup( {
                inLobby: [ ALEX_ID ],
                storedArgs: { count: "2" }
            } );

            const picked = interaction( [ ALEX_ID, MIA_ID ] );

            await handler( "VertixBot/UI-V3/TeamLobbyRandomTeamsPlayersMenu" )( context, picked );

            // Act - Mia joins, and the lobby has the screen drawn again.
            inLobby.add( MIA_ID );

            await watchers.get( SCREEN_ID )?.();

            // Assert.
            expect( context.editReplyWithStep ).toHaveBeenLastCalledWith(
                picked,
                "VertixBot/UI-V3/TeamLobbyRandomTeams",
                expect.objectContaining( {
                    players: [ { id: ALEX_ID, isReady: true }, { id: MIA_ID, isReady: true } ],
                    isApplyEnabled: true
                } )
            );
        } );

        it( "should keep Apply off for a split the lobby cannot make, and say why", async() => {
            // Arrange - three in the lobby, four teams asked for.
            const { service, context, interaction, handler } = setup( { planRefusal: { code: "too-few-members" } } );

            const picked = interaction( [ "4" ] );

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyRandomTeamsMenu" )( context, picked );

            // Assert.
            expect( service.getSplitPlanRefusal ).toHaveBeenCalledWith( { id: LOBBY_ID }, "random-teams", 4, [] );
            expect( context.editReplyWithStep ).toHaveBeenCalledWith(
                picked,
                "VertixBot/UI-V3/TeamLobbyRandomTeams",
                expect.objectContaining( { isApplyEnabled: false, planRefusal: "too-few-members" } )
            );
        } );

        it( "should name how many rooms a setup may open, when that is what stands in the way", async() => {
            // Arrange.
            const { context, interaction, handler } = setup( { planRefusal: { code: "too-many-rooms", roomsLimit: 20 } } );

            const picked = interaction( [ "2" ] );

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyGroupSizeMenu" )( context, picked );

            // Assert.
            expect( context.editReplyWithStep ).toHaveBeenCalledWith(
                picked,
                "VertixBot/UI-V3/TeamLobbyGroups",
                expect.objectContaining( { isApplyEnabled: false, planRefusal: "too-many-rooms", roomsLimit: 20 } )
            );
        } );

        it( "should draw it again as people come and go once a number is picked, with nobody picked too", async() => {
            // Arrange.
            const { context, interaction, handler, watchers } = setup();

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyRandomTeamsMenu" )( context, interaction( [ "2" ] ) );

            // Assert - who is in the lobby decides whether two teams can be made.
            expect( watchers.has( SCREEN_ID ) ).toBe( true );
        } );

        it( "should stop drawing it again once nobody is picked, since the whole lobby has nothing to wait for", async() => {
            // Arrange.
            const { context, interaction, handler, watchers } = setup();

            await handler( "VertixBot/UI-V3/TeamLobbyRandomTeamsPlayersMenu" )( context, interaction( [ ALEX_ID ] ) );

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyRandomTeamsPlayersMenu" )( context, interaction( [] ) );

            // Assert.
            expect( watchers.has( SCREEN_ID ) ).toBe( false );
        } );
    } );

    describe( "apply", () => {
        it.each( [
            [ "VertixBot/UI-V3/TeamLobbyRandomTeamsApplyButton", "random-teams" ],
            [ "VertixBot/UI-V3/TeamLobbyPickTeamsApplyButton", "pick-teams" ],
            [ "VertixBot/UI-V3/TeamLobbyGroupsApplyButton", "groups" ]
        ] )( "%s should split the lobby %s by the number and the members picked on the screen", async( button, mode ) => {
            // Arrange.
            const { lobby, service, context, interaction, handler } = setup( {
                storedArgs: { count: "3", playerIds: [ ALEX_ID, MIA_ID ] }
            } );

            const pressed = interaction();

            // Act.
            await handler( button )( context, pressed );

            // Assert - the lobby found through the panel it was pressed on.
            expect( service.getLobbyByPanelChannel ).toHaveBeenCalledWith( pressed.channel );
            expect( service.split ).toHaveBeenCalledWith( expect.objectContaining( {
                lobby,
                mode,
                count: 3,
                playerIds: [ ALEX_ID, MIA_ID ]
            } ) );
        } );

        it( "should split everybody in the lobby when nobody was picked", async() => {
            // Arrange.
            const { service, context, interaction, handler } = setup( { storedArgs: { count: "2" } } );

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyGroupsApplyButton" )( context, interaction() );

            // Assert.
            expect( service.split ).toHaveBeenCalledWith( expect.objectContaining( { playerIds: [] } ) );
        } );

        it( "should answer first, then turn the screen into what the split did, done with what was picked", async() => {
            // Arrange.
            const { service, context, interaction, handler } = setup( { storedArgs: { count: "2" } } );

            const pressed = interaction();

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyRandomTeamsApplyButton" )( context, pressed );

            // Assert - opening rooms and moving people outlasts discord's three seconds.
            expect( context.updateInteractionDefer ).toHaveBeenCalledWith( pressed );
            expect( context.editReplyWithStep ).toHaveBeenCalledWith( pressed, "VertixBot/UI-V3/TeamLobbySplit", {
                mode: "random-teams",
                roomsCount: "2",
                moved: "4"
            } );
            expect( context.ephemeralWithStep ).not.toHaveBeenCalled();
            expect( context.deleteArgs ).toHaveBeenCalled();
            expect( service.unwatchLobbyPresence ).toHaveBeenCalledWith( LOBBY_ID, SCREEN_ID );
        } );

        it( "should turn the screen into why the split was refused, rather than add a third message", async() => {
            // Arrange.
            const { context, interaction, handler } = setup( {
                split: { code: "too-many-rooms", roomsLimit: 20 },
                storedArgs: { count: "2", playerIds: [ ALEX_ID ] }
            } );

            const pressed = interaction();

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyGroupsApplyButton" )( context, pressed );

            // Assert.
            expect( context.ephemeralWithStep ).not.toHaveBeenCalled();
            expect( context.editReplyWithStep ).toHaveBeenCalledWith( pressed, "VertixBot/UI-V3/TeamLobbyRefused", {
                refusalCode: "too-many-rooms",
                roomsLimit: 20,
                missingPermissions: undefined
            } );
            expect( context.deleteArgs ).toHaveBeenCalled();
        } );
    } );

    describe( "recall", () => {
        it( "should say nothing when it worked - the panel redrawn is the answer", async() => {
            // Arrange.
            const { lobby, service, context, interaction, handler } = setup();

            const pressed = interaction();

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyRecallButton" )( context, pressed );

            // Assert.
            expect( context.updateInteractionDefer ).toHaveBeenCalledWith( pressed );
            expect( service.recall ).toHaveBeenCalledWith( { lobby, member: pressed.member } );
            expect( context.ephemeralWithStep ).not.toHaveBeenCalled();
        } );

        it( "should say why it could not", async() => {
            // Arrange.
            const { context, interaction, handler } = setup( { recall: { code: "not-host" } } );

            const pressed = interaction();

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyRecallButton" )( context, pressed );

            // Assert.
            expect( context.ephemeralWithStep ).toHaveBeenCalledWith(
                pressed,
                "VertixBot/UI-V3/TeamLobbyRefused",
                expect.objectContaining( { refusalCode: "not-host" } )
            );
        } );
    } );

    describe( "a panel whose lobby is gone", () => {
        it.each( [
            [ "VertixBot/UI-V3/TeamLobbyRandomTeamsButton", "ephemeralWithStep" ],
            [ "VertixBot/UI-V3/TeamLobbyGroupsApplyButton", "editReplyWithStep" ],
            [ "VertixBot/UI-V3/TeamLobbyRecallButton", "ephemeralWithStep" ]
        ] as const )( "%s should say it could not, and touch nothing", async( elementId, answer ) => {
            // Arrange - a press on the panel answers with a screen of its own, one on a screen edits it.
            const { service, context, interaction, handler } = setup( { isLobbyGone: true, storedArgs: { count: "2" } } );

            const pressed = interaction();

            // Act.
            await handler( elementId )( context, pressed );

            // Assert.
            expect( context[ answer ] ).toHaveBeenCalledWith( pressed, "VertixBot/UI-V3/TeamLobbyRefused", { refusalCode: "failed" } );
            expect( service.getSplitAccessRefusal ).not.toHaveBeenCalled();
            expect( service.split ).not.toHaveBeenCalled();
            expect( service.recall ).not.toHaveBeenCalled();
        } );
    } );
} );
