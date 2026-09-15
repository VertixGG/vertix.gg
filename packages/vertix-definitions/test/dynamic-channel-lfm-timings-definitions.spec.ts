import { jest } from "@jest/globals";

import {
    dynamicChannelLfmCooldownRemaining
} from "@vertix.gg/definitions/src/dynamic-channel-lfm-timings-definitions";

const MINUTE = 60 * 1000,
    HOUR = 60 * MINUTE;

// A rest that began at a fixed point and was written to run an hour, read ten minutes in. Fixed
// rather than taken from the clock, so the arithmetic in the assertions is the arithmetic the
// function does and nothing else.
const STARTED_AT = 1_000_000_000_000,
    NOW = STARTED_AT + 10 * MINUTE;

const STORED = {
    startedAt: STARTED_AT,
    until: STARTED_AT + HOUR
};

describe( "VertixDefinitions/DynamicChannelLfmCooldown", () => {
    it( "should report what is left of the rest the row was written for", () => {
        // Act.
        const remaining = dynamicChannelLfmCooldownRemaining( STORED, HOUR, NOW );

        // Assert.
        expect( remaining ).toBe( 50 * MINUTE );
    } );

    it( "should shorten a running rest when the cooldown is lowered", () => {
        // Act - the generator now rests fifteen minutes, and ten of them are already spent.
        const remaining = dynamicChannelLfmCooldownRemaining( STORED, 15 * MINUTE, NOW );

        // Assert.
        expect( remaining ).toBe( 5 * MINUTE );
    } );

    it( "should end a running rest when the cooldown is turned off", () => {
        // Act.
        const remaining = dynamicChannelLfmCooldownRemaining( STORED, 0, NOW );

        // Assert - "no cooldown" means none now, not none from the next post onwards.
        expect( remaining ).toBe( 0 );
    } );

    it( "should not extend a running rest when the cooldown is raised", () => {
        // Act.
        const remaining = dynamicChannelLfmCooldownRemaining( STORED, 2 * HOUR, NOW );

        // Assert - the deadline already granted stands; the longer rest starts with the next post.
        expect( remaining ).toBe( 50 * MINUTE );
    } );

    it( "should answer zero once the rest is over rather than counting past it", () => {
        // Act.
        const remaining = dynamicChannelLfmCooldownRemaining( STORED, HOUR, STARTED_AT + 2 * HOUR );

        // Assert.
        expect( remaining ).toBe( 0 );
    } );

    it( "should honour a row written before the start was recorded", () => {
        // Arrange - no `startedAt`, so there is nothing to resolve the lowered setting against.
        const legacy = { until: STARTED_AT + HOUR };

        // Act.
        const remaining = dynamicChannelLfmCooldownRemaining( legacy, 15 * MINUTE, NOW );

        // Assert - taken as written, and replaced by the next post.
        expect( remaining ).toBe( 50 * MINUTE );
    } );

    it( "should read the moment off the clock when it is not given one", () => {
        // Arrange.
        jest.useFakeTimers();
        jest.setSystemTime( NOW );

        // Act.
        const remaining = dynamicChannelLfmCooldownRemaining( STORED, HOUR );

        // Assert.
        expect( remaining ).toBe( 50 * MINUTE );

        jest.useRealTimers();
    } );
} );
