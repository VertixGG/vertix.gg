import { jest } from "@jest/globals";

import { ChannelType } from "discord.js";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { GuildEventSettingsModel } from "@vertix.gg/data/src/models/guild-event-settings-model";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import { getBoundHandler } from "@vertix.gg/bot/test/__test_utils__/bound-handler";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { EventsAdapter as TEventsAdapter } from "@vertix.gg/bot/src/ui/general/events/events-adapter";
import type { EventsEnableButton as TEventsEnableButton } from "@vertix.gg/bot/src/ui/general/events/events-enable-button";

const GUILD_ID = "820000000000000001",
    APP_ID = "900000000000000001",
    USER_ID = "500000000000000001",
    CHANNEL_ID = "600000000000000002";

// Imported once the ui service is there to answer: an element reaches for it as it is constructed.
let EventsAdapter: typeof TEventsAdapter,
    EventsEnableButton: typeof TEventsEnableButton;

interface ISettings {
    enabled: boolean;
    channelId: string | null;
    subPostsEnabled: boolean;
}

const asInstance = <T>( fake: object ): T => fake as T;

function setup( settings: ISettings | null, missingPermissions: string[] = [] ) {
    const save = jest.fn( async() => undefined ),
        notice = jest.fn( async() => undefined );

    jest.spyOn( GuildEventSettingsModel, "$", "get" ).mockReturnValue( asInstance( {
        get: async() => settings,
        save
    } ) );

    jest.spyOn( PermissionsManager, "$", "get" ).mockReturnValue( asInstance( {
        getMissingChannelPermissionsForBot: () => missingPermissions
    } ) );

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( asInstance( {
        get: () => ( { get: () => ( { ephemeral: notice } ) } )
    } ) );

    const context = { triggerTransition: jest.fn( async() => undefined ) };

    const guild = {
        id: GUILD_ID,
        channels: { cache: new Map( [ [ CHANNEL_ID, { id: CHANNEL_ID, type: ChannelType.GuildText } ] ] ) },
        client: { user: { username: "VoiceChannels" } }
    };

    const interaction = ( values: string[] = [] ) => ( {
        values,
        guild,
        guildId: GUILD_ID,
        client: { user: { id: APP_ID } },
        user: { id: USER_ID }
    } );

    const handler = ( elementId: string ) =>
        getBoundHandler<typeof context, ReturnType<typeof interaction>>( EventsAdapter, elementId );

    return { save, notice, context, interaction, handler };
}

/**
 * The Events screen under `/setup`: the channel it posts in, and the two switches.
 *
 * Every save names this bot as the one that runs Events in the server - two bots read this
 * database, and whichever an admin set it up from is the one that posts.
 */
describe( "VertixBot/UI-General/EventsAdapter", () => {
    beforeAll( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        ( { EventsAdapter } = await import( "@vertix.gg/bot/src/ui/general/events/events-adapter" ) );
        ( { EventsEnableButton } = await import( "@vertix.gg/bot/src/ui/general/events/events-enable-button" ) );
    } );

    // Put back after every test: restoring the mocks takes the ui service with them, and an element
    // drawn without one has nothing to ask for its words.
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();
    } );

    afterEach( () => jest.restoreAllMocks() );

    describe( "the channel", () => {
        it( "should save the picked channel and redraw the screen", async() => {
            // Arrange.
            const { save, context, interaction, handler } = setup( null );

            // Act.
            await handler( "VertixBot/UI-General/EventsChannelSelectMenu" )( context, interaction( [ CHANNEL_ID ] ) );

            // Assert.
            expect( save ).toHaveBeenCalledWith( GUILD_ID, APP_ID, { channelId: CHANNEL_ID, enabled: false }, USER_ID );
            expect( context.triggerTransition ).toHaveBeenCalledWith( "SelectChannel", expect.anything(), {} );
        } );

        it( "should refuse a channel the bot cannot post in, and save nothing", async() => {
            // Arrange.
            const { save, notice, context, interaction, handler } = setup( null, [ "SendMessages" ] );

            // Act.
            await handler( "VertixBot/UI-General/EventsChannelSelectMenu" )( context, interaction( [ CHANNEL_ID ] ) );

            // Assert.
            expect( notice ).toHaveBeenCalledTimes( 1 );
            expect( save ).not.toHaveBeenCalled();
            expect( context.triggerTransition ).not.toHaveBeenCalled();
        } );

        it( "should turn Events off when the channel is cleared", async() => {
            // Arrange.
            const { save, context, interaction, handler } = setup( { enabled: true, channelId: CHANNEL_ID, subPostsEnabled: true } );

            // Act.
            await handler( "VertixBot/UI-General/EventsChannelSelectMenu" )( context, interaction( [] ) );

            // Assert.
            expect( save ).toHaveBeenCalledWith( GUILD_ID, APP_ID, { channelId: null, enabled: false }, USER_ID );
        } );
    } );

    describe( "the switches", () => {
        it( "should turn Events on in a server with a channel", async() => {
            // Arrange.
            const { save, context, interaction, handler } = setup( { enabled: false, channelId: CHANNEL_ID, subPostsEnabled: true } );

            // Act.
            await handler( "VertixBot/UI-General/EventsEnableButton" )( context, interaction() );

            // Assert.
            expect( save ).toHaveBeenCalledWith( GUILD_ID, APP_ID, { enabled: true }, USER_ID );
            expect( context.triggerTransition ).toHaveBeenCalledWith( "ToggleEnabled", expect.anything(), {} );
        } );

        it( "should refuse to turn Events on once the bot can no longer post in its channel", async() => {
            // Arrange.
            const { save, notice, context, interaction, handler } = setup(
                { enabled: false, channelId: CHANNEL_ID, subPostsEnabled: true },
                [ "EmbedLinks" ]
            );

            // Act.
            await handler( "VertixBot/UI-General/EventsEnableButton" )( context, interaction() );

            // Assert.
            expect( notice ).toHaveBeenCalledTimes( 1 );
            expect( save ).not.toHaveBeenCalled();
        } );

        it( "should switch the sub posts over", async() => {
            // Arrange.
            const { save, context, interaction, handler } = setup( { enabled: true, channelId: CHANNEL_ID, subPostsEnabled: true } );

            // Act.
            await handler( "VertixBot/UI-General/EventsSubPostsButton" )( context, interaction() );

            // Assert.
            expect( save ).toHaveBeenCalledWith( GUILD_ID, APP_ID, { subPostsEnabled: false }, USER_ID );
        } );
    } );

    describe( "the on switch", () => {
        const build = async( args: UIArgs ) => ( await new EventsEnableButton().build( args ) ).attributes;

        it( "should not be pressable while there is no channel to post in", async() => {
            // Act.
            const attributes = await build( { eventsEnabled: false, eventsChannelId: null } );

            // Assert.
            expect( attributes.disabled ).toBe( true );
        } );

        it( "should say what pressing it does", async() => {
            // Act.
            const off = await build( { eventsEnabled: false, eventsChannelId: CHANNEL_ID } ),
                on = await build( { eventsEnabled: true, eventsChannelId: CHANNEL_ID } );

            // Assert.
            expect( off.label ).toBe( "Turn on" );
            expect( off.disabled ).toBeUndefined();
            expect( on.label ).toBe( "Turn off" );
        } );
    } );
} );
