import { jest } from "@jest/globals";

import { DynamicChannelKnockManager } from "@vertix.gg/bot/src/managers/dynamic-channel-knock-manager";

const CHANNEL_ID = "channel-id",
    OTHER_CHANNEL_ID = "other-channel-id",
    USER_ID = "user-id",
    OTHER_USER_ID = "other-user-id";

const KNOCK_REQUEST_TIMEOUT_MS = 5 * 60 * 1000,
    KNOCK_COOLDOWN_MS = 5 * 60 * 1000;

describe( "VertixBot/Managers/DynamicChannelKnock", () => {
    let knockManager: DynamicChannelKnockManager;

    beforeEach( () => {
        jest.useFakeTimers();

        knockManager = new DynamicChannelKnockManager();
    } );

    afterEach( () => {
        jest.useRealTimers();
    } );

    describe( "request()", () => {
        it( "should accept a first knock", () => {
            expect( knockManager.request( CHANNEL_ID, USER_ID ) ).toBe( "accepted" );
            expect( knockManager.isPending( CHANNEL_ID, USER_ID ) ).toBe( true );
        } );

        it( "should not accept a second knock while the first is waiting", () => {
            knockManager.request( CHANNEL_ID, USER_ID );

            expect( knockManager.request( CHANNEL_ID, USER_ID ) ).toBe( "pending" );
        } );

        it( "should keep each channel and user apart", () => {
            knockManager.request( CHANNEL_ID, USER_ID );

            expect( knockManager.request( OTHER_CHANNEL_ID, USER_ID ) ).toBe( "accepted" );
            expect( knockManager.request( CHANNEL_ID, OTHER_USER_ID ) ).toBe( "accepted" );
        } );

        it( "should hold an answered knock on cooldown", () => {
            knockManager.request( CHANNEL_ID, USER_ID );
            knockManager.resolve( CHANNEL_ID, USER_ID );

            expect( knockManager.isPending( CHANNEL_ID, USER_ID ) ).toBe( false );
            expect( knockManager.request( CHANNEL_ID, USER_ID ) ).toBe( "cooling-down" );
        } );

        it( "should accept again once the cooldown has passed", () => {
            knockManager.request( CHANNEL_ID, USER_ID );
            knockManager.resolve( CHANNEL_ID, USER_ID );

            jest.advanceTimersByTime( KNOCK_COOLDOWN_MS + 1 );

            expect( knockManager.request( CHANNEL_ID, USER_ID ) ).toBe( "accepted" );
        } );

        it( "should expire a knock nobody answered, then hold it on cooldown", () => {
            knockManager.request( CHANNEL_ID, USER_ID );

            jest.advanceTimersByTime( KNOCK_REQUEST_TIMEOUT_MS );

            expect( knockManager.isPending( CHANNEL_ID, USER_ID ) ).toBe( false );
            expect( knockManager.request( CHANNEL_ID, USER_ID ) ).toBe( "cooling-down" );
        } );
    } );

    describe( "resolve()", () => {
        it( "should do nothing for a knock that was never made", () => {
            knockManager.resolve( CHANNEL_ID, USER_ID );

            expect( knockManager.request( CHANNEL_ID, USER_ID ) ).toBe( "accepted" );
        } );
    } );

    describe( "clearChannel()", () => {
        it( "should drop the requests and cooldowns of a channel that is gone", () => {
            knockManager.request( CHANNEL_ID, USER_ID );

            knockManager.request( CHANNEL_ID, OTHER_USER_ID );
            knockManager.resolve( CHANNEL_ID, OTHER_USER_ID );

            knockManager.clearChannel( CHANNEL_ID );

            expect( knockManager.isPending( CHANNEL_ID, USER_ID ) ).toBe( false );
            expect( knockManager.request( CHANNEL_ID, USER_ID ) ).toBe( "accepted" );
            expect( knockManager.request( CHANNEL_ID, OTHER_USER_ID ) ).toBe( "accepted" );
        } );

        it( "should leave other channels alone", () => {
            knockManager.request( CHANNEL_ID, USER_ID );
            knockManager.request( OTHER_CHANNEL_ID, USER_ID );

            knockManager.clearChannel( CHANNEL_ID );

            expect( knockManager.isPending( OTHER_CHANNEL_ID, USER_ID ) ).toBe( true );
        } );
    } );
} );
