import { jest } from "@jest/globals";

import { DynamicChannelLfmManager } from "@vertix.gg/bot/src/managers/dynamic-channel-lfm-manager";

import {
    DYNAMIC_CHANNEL_LFM_COUNTDOWN_TICK_MS,
    DYNAMIC_CHANNEL_LFM_TIMING
} from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

import type { IDynamicChannelLfmPost } from "@vertix.gg/bot/src/managers/dynamic-channel-lfm-manager";

const CHANNEL_ID = "channel-id",
    OTHER_CHANNEL_ID = "other-channel-id";

function makePost( messageId: string ): IDynamicChannelLfmPost {
    return {
        lfmChannelId: "lfm-channel-id",
        messageId,
        note: null,
        pingContent: "",
        expiresAt: Date.now() + DYNAMIC_CHANNEL_LFM_TIMING.POST_EXPIRY_MS
    };
}

let POST: IDynamicChannelLfmPost;
let OTHER_POST: IDynamicChannelLfmPost;

describe( "VertixBot/Managers/DynamicChannelLfm", () => {
    let lfmManager: DynamicChannelLfmManager;

    beforeEach( () => {
        jest.useFakeTimers();

        POST = makePost( "message-id" );
        OTHER_POST = makePost( "other-message-id" );

        lfmManager = new DynamicChannelLfmManager();
    } );

    afterEach( () => {
        jest.useRealTimers();
    } );

    describe( "request()", () => {
        it( "should accept a first request", () => {
            expect( lfmManager.request( CHANNEL_ID ) ).toBe( "accepted" );
        } );

        it( "should not accept a second request while the first is still reserving", () => {
            lfmManager.request( CHANNEL_ID );

            expect( lfmManager.request( CHANNEL_ID ) ).toBe( "already-posted" );
        } );

        it( "should not accept a request while a post is standing", () => {
            lfmManager.request( CHANNEL_ID );
            lfmManager.register( CHANNEL_ID, POST );

            expect( lfmManager.request( CHANNEL_ID ) ).toBe( "already-posted" );
        } );

        it( "should keep each channel apart", () => {
            lfmManager.request( CHANNEL_ID );

            expect( lfmManager.request( OTHER_CHANNEL_ID ) ).toBe( "accepted" );
        } );

        it( "should accept again once a failed request is aborted", () => {
            lfmManager.request( CHANNEL_ID );
            lfmManager.abort( CHANNEL_ID );

            expect( lfmManager.request( CHANNEL_ID ) ).toBe( "accepted" );
        } );

        // The rest a released post earns is the service's to enforce, because it is written to
        // the database and outlives this manager. All the manager owes is the freed slot.
        it( "should free the slot when a post is released", () => {
            lfmManager.request( CHANNEL_ID );
            lfmManager.register( CHANNEL_ID, POST );
            lfmManager.release( CHANNEL_ID );

            expect( lfmManager.request( CHANNEL_ID ) ).toBe( "accepted" );
        } );
    } );

    describe( "register()", () => {
        it( "should hand the expired post back to the caller", () => {
            const onExpire = jest.fn();

            lfmManager.request( CHANNEL_ID );
            lfmManager.register( CHANNEL_ID, POST, onExpire );

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_TIMING.POST_EXPIRY_MS );

            expect( onExpire ).toHaveBeenCalledWith( POST );
            expect( lfmManager.getPost( CHANNEL_ID ) ).toBeUndefined();
        } );

        it( "should free the slot when a post expires", () => {
            lfmManager.request( CHANNEL_ID );
            lfmManager.register( CHANNEL_ID, POST );

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_TIMING.POST_EXPIRY_MS );

            expect( lfmManager.request( CHANNEL_ID ) ).toBe( "accepted" );
        } );

        it( "should not expire a post that was released first", () => {
            const onExpire = jest.fn();

            lfmManager.request( CHANNEL_ID );
            lfmManager.register( CHANNEL_ID, POST, onExpire );
            lfmManager.release( CHANNEL_ID );

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_TIMING.POST_EXPIRY_MS );

            expect( onExpire ).not.toHaveBeenCalled();
        } );

        it( "should redraw on every tick while the post stands", () => {
            const onTick = jest.fn();

            lfmManager.register( CHANNEL_ID, POST, undefined, onTick );

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_COUNTDOWN_TICK_MS * 3 );

            expect( onTick ).toHaveBeenCalledTimes( 3 );
        } );

        it( "should stop redrawing once the post is released", () => {
            const onTick = jest.fn();

            lfmManager.register( CHANNEL_ID, POST, undefined, onTick );
            lfmManager.release( CHANNEL_ID );

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_COUNTDOWN_TICK_MS * 3 );

            expect( onTick ).not.toHaveBeenCalled();
        } );

        it( "should stop redrawing when the channel is gone", () => {
            const onTick = jest.fn();

            lfmManager.register( CHANNEL_ID, POST, undefined, onTick );
            lfmManager.clearChannel( CHANNEL_ID );

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_COUNTDOWN_TICK_MS * 3 );

            expect( onTick ).not.toHaveBeenCalled();
        } );

        // An expiring post releases itself, so the interval has to go with it - a redraw left
        // running against a deleted message is a timer nothing will ever stop.
        it( "should stop redrawing once the post expires", () => {
            const onTick = jest.fn();

            lfmManager.register( CHANNEL_ID, POST, undefined, onTick );

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_TIMING.POST_EXPIRY_MS );

            const ticksAtExpiry = onTick.mock.calls.length;

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_COUNTDOWN_TICK_MS * 3 );

            expect( onTick ).toHaveBeenCalledTimes( ticksAtExpiry );
        } );

        it( "should drop the previous timer when a channel posts again", () => {
            const onExpire = jest.fn();

            lfmManager.register( CHANNEL_ID, POST, onExpire );
            lfmManager.register( CHANNEL_ID, OTHER_POST, onExpire );

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_TIMING.POST_EXPIRY_MS );

            expect( onExpire ).toHaveBeenCalledTimes( 1 );
            expect( onExpire ).toHaveBeenCalledWith( OTHER_POST );
        } );
    } );

    describe( "release()", () => {
        it( "should do nothing for a channel that never posted", () => {
            expect( lfmManager.release( CHANNEL_ID ) ).toBeUndefined();
            expect( lfmManager.request( CHANNEL_ID ) ).toBe( "accepted" );
        } );

        it( "should hand back the post it dropped", () => {
            lfmManager.register( CHANNEL_ID, POST );

            expect( lfmManager.release( CHANNEL_ID ) ).toBe( POST );
        } );
    } );

    describe( "clearChannel()", () => {
        it( "should drop what it was holding for a channel that is gone", () => {
            lfmManager.request( CHANNEL_ID );
            lfmManager.register( CHANNEL_ID, POST );

            lfmManager.clearChannel( CHANNEL_ID );

            expect( lfmManager.getPost( CHANNEL_ID ) ).toBeUndefined();
            expect( lfmManager.request( CHANNEL_ID ) ).toBe( "accepted" );
        } );

        it( "should stop a standing post from expiring", () => {
            const onExpire = jest.fn();

            lfmManager.register( CHANNEL_ID, POST, onExpire );

            lfmManager.clearChannel( CHANNEL_ID );

            jest.advanceTimersByTime( DYNAMIC_CHANNEL_LFM_TIMING.POST_EXPIRY_MS );

            expect( onExpire ).not.toHaveBeenCalled();
        } );

        it( "should leave other channels alone", () => {
            lfmManager.register( CHANNEL_ID, POST );
            lfmManager.register( OTHER_CHANNEL_ID, OTHER_POST );

            lfmManager.clearChannel( CHANNEL_ID );

            expect( lfmManager.getPost( OTHER_CHANNEL_ID ) ).toBe( OTHER_POST );
        } );
    } );
} );
