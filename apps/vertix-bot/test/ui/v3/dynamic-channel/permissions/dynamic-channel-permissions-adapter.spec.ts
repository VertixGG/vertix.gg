import { jest } from "@jest/globals";

import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";

import { getBoundHandler } from "@vertix.gg/bot/test/__test_utils__/bound-handler";

import type {
    DynamicChannelPermissionsAdapter as TDynamicChannelPermissionsAdapter
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/dynamic-channel-permissions-adapter";

// Imported once the ui service is there to answer: the adapter's elements reach for it as they load.
let DynamicChannelPermissionsAdapter: typeof TDynamicChannelPermissionsAdapter;

/** What the handlers use of their context before they reach the channel. */
function createContext() {
    return {
        updateInteractionDefer: jest.fn<( interaction: object ) => Promise<void>>().mockResolvedValue( undefined ),
        ephemeralWithStep: jest.fn<( interaction: object, step: string ) => Promise<void>>().mockResolvedValue( undefined )
    };
}

/** A pick on one of the room's user menus, in a guild whose member cache holds nobody. */
function createPick( values: string[], fetch: ( userId?: string ) => Promise<unknown> ) {
    return {
        values,
        guild: {
            members: {
                cache: new Map(),
                fetch: jest.fn( fetch )
            }
        }
    };
}

/**
 * The room's user menus take zero values, so clearing the user that is still ticked sends a pick with
 * nobody in it. Asked for `undefined`, discord.js fetches the whole member list over the gateway -
 * which the bot has no intent for - and waits two minutes for it, so the owner's kick never answered.
 */
describe( "VertixBot/UI-V3/DynamicChannelPermissionsAdapter/user-menus", () => {
    beforeAll( async() => {
        await TestWithServiceLocatorMock.withUIServiceMock();

        ( { DynamicChannelPermissionsAdapter } = await import(
            "@vertix.gg/bot/src/ui/v3/dynamic-channel/permissions/dynamic-channel-permissions-adapter"
        ) );
    } );

    afterEach( () => {
        jest.restoreAllMocks();
    } );

    it.each( [
        "VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu",
        "VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu",
        "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu",
        "VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu",
        "VertixBot/UI-V3/DynamicChannelPermissionsKickMenu"
    ] )( "should acknowledge a cleared %s without asking discord for anybody", async( menu ) => {
        // Arrange.
        const context = createContext(),
            pick = createPick( [], async() => new Map() ),
            onPick = getBoundHandler<typeof context, typeof pick>( DynamicChannelPermissionsAdapter, menu );

        // Act.
        await onPick( context, pick );

        // Assert.
        expect( pick.guild.members.fetch ).not.toHaveBeenCalled();
        expect( context.updateInteractionDefer ).toHaveBeenCalledWith( pick );
        expect( context.ephemeralWithStep ).not.toHaveBeenCalled();
    } );

    it.each( [
        "VertixBot/UI-V3/DynamicChannelPermissionsGrantMenu",
        "VertixBot/UI-V3/DynamicChannelPermissionsDenyMenu",
        "VertixBot/UI-V3/DynamicChannelPermissionsBlockMenu",
        "VertixBot/UI-V3/DynamicChannelPermissionsUnblockMenu",
        "VertixBot/UI-V3/DynamicChannelPermissionsKickMenu"
    ] )( "should answer %s with the error notice when the user picked has left the server", async( menu ) => {
        // Arrange.
        const context = createContext(),
            pick = createPick( [ "user-id" ], async() => {
                throw new Error( "Unknown Member" );
            } ),
            onPick = getBoundHandler<typeof context, typeof pick>( DynamicChannelPermissionsAdapter, menu );

        // Act.
        await onPick( context, pick );

        // Assert.
        expect( pick.guild.members.fetch ).toHaveBeenCalledWith( "user-id" );
        expect( context.ephemeralWithStep ).toHaveBeenCalledWith( pick, "VertixBot/UI-V3/DynamicChannelPermissionsStateError", {} );
    } );
} );
