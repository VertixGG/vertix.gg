import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelModel } from "@vertix.gg/data/src/models/channel/channel-model";

import { getBoundHandler } from "@vertix.gg/bot/test/__test_utils__/bound-handler";

import type { TeamLobbySetupEditAdapter as TTeamLobbySetupEditAdapter } from "@vertix.gg/bot/src/ui/v3/team-lobby-setup/team-lobby-setup-edit-adapter";

const GUILD_ID = "820000000000000001",
    LOBBY_ROW_ID = "lobby-row-1",
    ROLE_A = "700000000000000001",
    ROLE_B = "700000000000000002";

// Imported once the ui service is there to answer: an element reaches for it as it is constructed.
let TeamLobbySetupEditAdapter: typeof TTeamLobbySetupEditAdapter;

const asInstance = <T>( fake: object ): T => fake as T;

function setup( options: { isLobby?: boolean } = {} ) {
    const { isLobby = true } = options;

    const lobbyDB = { id: LOBBY_ROW_ID, channelId: "840000000000000001", isLobbyMaster: isLobby };

    const teamLobbyService = { setHostRoles: jest.fn( async() => undefined ) },
        cleanupService = { deleteLobbyMasterChannelWithCleanup: jest.fn( async() => true ) },
        setupAdapter = { editReply: jest.fn( async() => undefined ) };

    jest.spyOn( ChannelModel, "$", "get" ).mockReturnValue( asInstance( { getById: async() => lobbyDB } ) );

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( asInstance( {
        get: ( name: string ) => ( {
            "VertixBot/Services/TeamLobby": teamLobbyService,
            "VertixBot/Services/ChannelCleanup": cleanupService,
            "VertixGUI/UIService": { get: () => setupAdapter }
        } as Record<string, object> )[ name ]
    } ) );

    const context = {
        getArgs: () => ( { lobbyRowId: LOBBY_ROW_ID } ),
        deleteArgs: jest.fn(),
        editReplyWithStep: jest.fn( async() => undefined ),
        updateInteractionDefer: jest.fn( async() => undefined ),
        showModal: jest.fn( async() => undefined ),
        customIdStrategy: { generateId: ( id: string ) => id }
    };

    const interaction = ( extra: object = {} ) => ( {
        guild: { id: GUILD_ID },
        message: { id: "screen-1" },
        deferred: false,
        replied: false,
        deferUpdate: jest.fn( async() => undefined ),
        ... extra
    } );

    const handler = ( elementId: string ) =>
        getBoundHandler<typeof context, ReturnType<typeof interaction>>( TeamLobbySetupEditAdapter, elementId );

    return { lobbyDB, teamLobbyService, cleanupService, setupAdapter, context, interaction, handler };
}

/**
 * A team lobby's own screen in `/setup`: naming its hosts, and taking it down.
 */
describe( "VertixBot/UI-V3/TeamLobbySetupEditAdapter", () => {
    beforeAll( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        ( { TeamLobbySetupEditAdapter } = await import( "@vertix.gg/bot/src/ui/v3/team-lobby-setup/team-lobby-setup-edit-adapter" ) );
    } );

    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    afterEach( () => jest.restoreAllMocks() );

    describe( "host roles", () => {
        it( "should save the roles picked and redraw the screen with them", async() => {
            // Arrange.
            const { lobbyDB, teamLobbyService, context, interaction, handler } = setup();

            const picked = interaction( { values: [ ROLE_B, ROLE_A ] } );

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyHostRolesMenu" )( context, picked );

            // Assert.
            expect( teamLobbyService.setHostRoles ).toHaveBeenCalledWith( picked.guild, lobbyDB, [ ROLE_A, ROLE_B ] );
            expect( context.editReplyWithStep ).toHaveBeenCalledWith( picked, "VertixBot/UI-V3/TeamLobbySetupEdit" );
        } );

        it( "should save nothing for a lobby that is gone, and go back to setup", async() => {
            // Arrange.
            const { teamLobbyService, setupAdapter, context, interaction, handler } = setup( { isLobby: false } );

            // Act.
            await handler( "VertixBot/UI-V3/TeamLobbyHostRolesMenu" )( context, interaction( { values: [ ROLE_A ] } ) );

            // Assert.
            expect( teamLobbyService.setHostRoles ).not.toHaveBeenCalled();
            expect( setupAdapter.editReply ).toHaveBeenCalledTimes( 1 );
        } );
    } );

    describe( "delete", () => {
        it( "should take the lobby down once 'delete' was typed, and go back to setup", async() => {
            // Arrange.
            const { cleanupService, setupAdapter, context, interaction, handler } = setup();

            // Act.
            await handler( "VertixBot/UI-General/DeleteConfirmModal" )(
                context,
                interaction( { fields: { getTextInputValue: () => " Delete " } } )
            );

            // Assert.
            expect( cleanupService.deleteLobbyMasterChannelWithCleanup ).toHaveBeenCalledWith( {
                guildId: GUILD_ID,
                masterChannelId: LOBBY_ROW_ID
            } );
            expect( setupAdapter.editReply ).toHaveBeenCalledTimes( 1 );
        } );

        it( "should take nothing down when anything else was typed", async() => {
            // Arrange.
            const { cleanupService, setupAdapter, context, interaction, handler } = setup();

            // Act.
            await handler( "VertixBot/UI-General/DeleteConfirmModal" )(
                context,
                interaction( { fields: { getTextInputValue: () => "nope" } } )
            );

            // Assert.
            expect( cleanupService.deleteLobbyMasterChannelWithCleanup ).not.toHaveBeenCalled();
            expect( setupAdapter.editReply ).not.toHaveBeenCalled();
        } );

        it( "should ask before deleting anything", async() => {
            // Arrange.
            const { context, interaction, handler } = setup();

            const pressed = interaction();

            // Act.
            await handler( "VertixBot/UI-General/DeleteButton" )( context, pressed );

            // Assert.
            expect( context.showModal ).toHaveBeenCalledWith( pressed, "VertixBot/UI-General/DeleteConfirmModal" );
        } );
    } );

    it( "should go back to setup when done", async() => {
        // Arrange.
        const { setupAdapter, context, interaction, handler } = setup();

        // Act.
        await handler( "VertixBot/UI-General/DoneButton" )( context, interaction() );

        // Assert.
        expect( setupAdapter.editReply ).toHaveBeenCalledTimes( 1 );
    } );
} );
