import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { BOT_INVITE_LINK_LABEL } from "@vertix.gg/bot/src/utils/bot-invite";

import { EDITED_DESCRIPTION, drawPanelDescription } from "@vertix.gg/bot/test/__test_utils__/panel-invite-line";

import type { DynamicChannelAdapter as TDynamicChannelAdapter } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/dynamic-channel-adapter";

// Imported once the ui service is there to answer: the elements group builds every button it knows
// about as the module loads, and a button reaches for the ui service as it is constructed.
let DynamicChannelAdapter: typeof TDynamicChannelAdapter;

/**
 * The room's panel ends in the bot's own invite, and the interface editor has no say in it: the line
 * is added once the message is built, over whatever the editor's overrides made of the description.
 */
describe( "VertixBot/UI-V3/DynamicChannelAdapter/invite", () => {
    beforeAll( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        ( { DynamicChannelAdapter } = await import( "@vertix.gg/bot/src/ui/v3/dynamic-channel/dynamic-channel-adapter" ) );
    } );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it( "should end the panel in the invite, under what the interface editor wrote", async() => {
        // Act.
        const description = await drawPanelDescription( DynamicChannelAdapter, false );

        // Assert.
        expect( description?.startsWith( `${ EDITED_DESCRIPTION }\n\n-# ➕ [${ BOT_INVITE_LINK_LABEL }](` ) ).toBe( true );
        expect( description ).toContain( "state=bot-room-panel" );
    } );

    it( "should leave the panel as the editor left it on a server that pays for Pro", async() => {
        // Act.
        const description = await drawPanelDescription( DynamicChannelAdapter, true );

        // Assert.
        expect( description ).toBe( EDITED_DESCRIPTION );
    } );
} );
