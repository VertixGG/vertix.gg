import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { getBoundHandler } from "@vertix.gg/bot/test/__test_utils__/bound-handler";

import type { SetupAdapter as TSetupAdapter } from "@vertix.gg/bot/src/ui/general/setup/setup-adapter";

const GUILD_ID = "820000000000000001",
    USER_ID = "500000000000000001",
    MAX_MASTER_CHANNELS = 2;

// Imported once the ui service is there to answer: an element reaches for it as it is constructed.
let SetupAdapter: typeof TSetupAdapter;

const asInstance = <T>( fake: object ): T => fake as T;

function setup( created: object, hasReachedLimit = false ) {
    const teamLobbyService = { createLobby: jest.fn( async() => created ) },
        masterChannelService = { isReachedMasterLimit: jest.fn( async() => hasReachedLimit ) },
        lobbyEditAdapter = { ephemeralWithStep: jest.fn( async() => undefined ) };

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( asInstance( {
        get: ( name: string ) => ( {
            "VertixBot/Services/TeamLobby": teamLobbyService,
            "VertixBot/Services/MasterChannel": masterChannelService,
            "VertixBot/Services/Entitlement": { getMaxMasterChannels: async() => MAX_MASTER_CHANNELS },
            "VertixGUI/UIService": {
                get: ( adapter: string ) => "VertixBot/UI-V3/TeamLobbySetupEditAdapter" === adapter ? lobbyEditAdapter : undefined
            }
        } as Record<string, object> )[ name ]
    } ) );

    const component = {
        clearElements: jest.fn(),
        switchEmbedsGroup: jest.fn()
    };

    const context = {
        getComponent: () => component,
        ephemeral: jest.fn( async() => undefined ),
        updateInteractionDefer: jest.fn( async() => undefined ),
        editReply: jest.fn( async() => undefined )
    };

    const interaction = {
        values: [ "lobby" ],
        guild: { id: GUILD_ID },
        user: { id: USER_ID }
    };

    const handler = getBoundHandler<typeof context, typeof interaction>(
        SetupAdapter,
        "VertixBot/UI-General/SetupMasterCreateSelectMenu"
    );

    return { teamLobbyService, masterChannelService, lobbyEditAdapter, component, context, interaction, handler };
}

/**
 * The setup screen's create menu, for the one kind of setup it makes on the spot - a team lobby asks
 * nothing first, so picking it is making it.
 */
describe( "VertixBot/UI-General/SetupAdapter/team lobby", () => {
    beforeAll( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        ( { SetupAdapter } = await import( "@vertix.gg/bot/src/ui/general/setup/setup-adapter" ) );
    } );

    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    afterEach( () => jest.restoreAllMocks() );

    it( "should make a team lobby for whoever picked it, and put the setup screen back with it listed", async() => {
        // Arrange.
        const { teamLobbyService, masterChannelService, lobbyEditAdapter, context, interaction, handler } =
            setup( { code: "success" } );

        // Act.
        await handler( context, interaction );

        // Assert.
        expect( masterChannelService.isReachedMasterLimit ).toHaveBeenCalledWith( GUILD_ID, MAX_MASTER_CHANNELS );
        expect( context.updateInteractionDefer ).toHaveBeenCalledWith( interaction );
        expect( teamLobbyService.createLobby ).toHaveBeenCalledWith( { guild: interaction.guild, userOwnerId: USER_ID } );
        expect( context.editReply ).toHaveBeenCalledWith( interaction, {} );
        expect( lobbyEditAdapter.ephemeralWithStep ).not.toHaveBeenCalled();
    } );

    it( "should say why a lobby was not made, and leave the setup screen as it is", async() => {
        // Arrange.
        const { lobbyEditAdapter, context, interaction, handler } = setup( { code: "failed" } );

        // Act.
        await handler( context, interaction );

        // Assert.
        expect( lobbyEditAdapter.ephemeralWithStep ).toHaveBeenCalledWith(
            interaction,
            "VertixBot/UI-V3/TeamLobbySetupRefused",
            { refusalCode: "failed" }
        );
        expect( context.editReply ).not.toHaveBeenCalled();
    } );

    it( "should spend a generator slot on a lobby, and refuse one past the allowance with the screen a generator gets", async() => {
        // Arrange.
        const { teamLobbyService, component, context, interaction, handler } = setup( { code: "success" }, true );

        // Act.
        await handler( context, interaction );

        // Assert - told how many the server may have, and nothing made.
        expect( component.switchEmbedsGroup ).toHaveBeenCalledWith( "VertixBot/UI-General/SetupMaxMasterChannelsEmbedGroup" );
        expect( context.ephemeral ).toHaveBeenCalledWith( interaction, { maxMasterChannels: String( MAX_MASTER_CHANNELS ) } );
        expect( teamLobbyService.createLobby ).not.toHaveBeenCalled();
        expect( context.editReply ).not.toHaveBeenCalled();
    } );
} );
