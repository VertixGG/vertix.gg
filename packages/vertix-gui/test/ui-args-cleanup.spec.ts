import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";

import type { UIArgsManager } from "@vertix.gg/gui/src/bases/ui-args-manager";

import type { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

import type { UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-definitions";

const OWNER = { getName: () => "VertixGUI/Test/CleanupAdapter" } as unknown as UIBase,
    MESSAGE_ID = "message-id";

const MINUTE = 60 * 1000,
    // The screen is swept ten minutes after it stops being used; eleven is a minute past that.
    PAST_THE_TIMEOUT = 11 * MINUTE;

// A command context, which is the branch of `getArgsId` that answers with the context's own id -
// enough to reach the args of a screen without standing up a discord message.
const CONTEXT = { id: MESSAGE_ID, isCommand: () => true } as unknown as UIAdapterStartContext;

function getStaticArgs() {
    return ( UIAdapterBase as unknown as { staticArgs: UIArgsManager } ).staticArgs;
}

describe( "VertixGUI/UIAdapterBase/cleanupTimer", () => {
    beforeEach( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        jest.useFakeTimers();
        jest.setSystemTime( new Date( "2026-01-01T00:00:00.000Z" ) );

        getStaticArgs().setInitialArgs( OWNER, MESSAGE_ID, { ChannelDBId: "owner-id" }, { overwrite: true } );
    } );

    afterEach( () => {
        getStaticArgs().deleteArgs( OWNER, MESSAGE_ID );

        jest.useRealTimers();
    } );

    it( "should keep a screen that is still being read", () => {
        // Arrange - the member works down the menu without submitting anything, so the args are
        // read and never written.
        jest.advanceTimersByTime( PAST_THE_TIMEOUT );

        getStaticArgs().getArgs( OWNER, CONTEXT );

        // Act.
        UIAdapterBase.cleanupTimer();

        // Assert - reading it is using it, and what is in use is not swept.
        expect( getStaticArgs().getArgsById( OWNER, MESSAGE_ID ) ).toEqual( { ChannelDBId: "owner-id" } );
    } );

    it( "should sweep a screen nobody has touched", () => {
        // Arrange - nothing reads it.
        jest.advanceTimersByTime( PAST_THE_TIMEOUT );

        // Act.
        UIAdapterBase.cleanupTimer();

        // Assert.
        expect( getStaticArgs().getArgsById( OWNER, MESSAGE_ID ) ).toBeUndefined();
    } );

    it( "should keep a screen inside the timeout either way", () => {
        // Arrange.
        jest.advanceTimersByTime( 9 * MINUTE );

        // Act.
        UIAdapterBase.cleanupTimer();

        // Assert.
        expect( getStaticArgs().getArgsById( OWNER, MESSAGE_ID ) ).toEqual( { ChannelDBId: "owner-id" } );
    } );
} );
