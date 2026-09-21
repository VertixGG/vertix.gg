import { jest } from "@jest/globals";

import {
    DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS,
    dynamicChannelLfmCooldownRemaining,
    dynamicChannelLfmTimingIsWithinBounds,
    dynamicChannelLfmTimingsResolve
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

const SECOND = 1000,
    DAY = 24 * HOUR;

describe( "VertixDefinitions/DynamicChannelLfmTimingIsWithinBounds", () => {
    it( "should accept both ends of a field's own range", () => {
        // Inclusive at both ends: the bounds are what a master channel may choose, and a range
        // nobody may sit on the edge of is a narrower range described wrongly.
        expect( dynamicChannelLfmTimingIsWithinBounds( "postExpiry", MINUTE ) ).toBe( true );
        expect( dynamicChannelLfmTimingIsWithinBounds( "postExpiry", DAY ) ).toBe( true );
        expect( dynamicChannelLfmTimingIsWithinBounds( "occupancyDebounce", 500 ) ).toBe( true );
        expect( dynamicChannelLfmTimingIsWithinBounds( "occupancyDebounce", MINUTE ) ).toBe( true );
    } );

    it( "should refuse a value outside the range at either end", () => {
        expect( dynamicChannelLfmTimingIsWithinBounds( "postExpiry", MINUTE - 1 ) ).toBe( false );
        expect( dynamicChannelLfmTimingIsWithinBounds( "postExpiry", DAY + 1 ) ).toBe( false );
    } );

    it( "should let the two cooldowns be nothing, and refuse an expiry of nothing", () => {
        /*
         * The difference the bounds exist to express. A small server where everyone already knows
         * each other has nothing to be protected from, so a cooldown may be turned off - but a post
         * that expires the moment it goes up is one nobody could ever answer.
         */
        expect( dynamicChannelLfmTimingIsWithinBounds( "postCooldown", 0 ) ).toBe( true );
        expect( dynamicChannelLfmTimingIsWithinBounds( "pingCooldown", 0 ) ).toBe( true );
        expect( dynamicChannelLfmTimingIsWithinBounds( "postExpiry", 0 ) ).toBe( false );
    } );

    it( "should judge each field against its own range rather than a shared one", () => {
        // An hour is an ordinary cooldown and an impossible debounce, and the debounce's whole
        // range is under a minute - so one set of bounds for all four would be wrong for three.
        expect( dynamicChannelLfmTimingIsWithinBounds( "postCooldown", HOUR ) ).toBe( true );
        expect( dynamicChannelLfmTimingIsWithinBounds( "occupancyDebounce", HOUR ) ).toBe( false );
    } );

    it( "should refuse anything that is not a finite number", () => {
        expect( dynamicChannelLfmTimingIsWithinBounds( "postCooldown", Number.NaN ) ).toBe( false );
        expect( dynamicChannelLfmTimingIsWithinBounds( "postCooldown", Number.POSITIVE_INFINITY ) ).toBe( false );
    } );
} );

describe( "VertixDefinitions/DynamicChannelLfmTimingsResolve", () => {
    it( "should answer with the fallbacks when a generator chose nothing", () => {
        expect( dynamicChannelLfmTimingsResolve() ).toEqual( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS );
        expect( dynamicChannelLfmTimingsResolve( {} ) ).toEqual( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS );
    } );

    it( "should take a choice that is in bounds", () => {
        const resolved = dynamicChannelLfmTimingsResolve( { postCooldown: 5 * MINUTE } );

        expect( resolved.postCooldown ).toBe( 5 * MINUTE );
    } );

    it( "should leave the fields nobody chose at their fallbacks", () => {
        // A generator that set one clock did not thereby set the other three, and a partial row is
        // the ordinary case rather than a broken one.
        const resolved = dynamicChannelLfmTimingsResolve( { postCooldown: 5 * MINUTE } );

        expect( resolved.pingCooldown ).toBe( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.pingCooldown );
        expect( resolved.postExpiry ).toBe( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postExpiry );
        expect( resolved.occupancyDebounce ).toBe( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.occupancyDebounce );
    } );

    it( "should drop a value out of bounds rather than clamp it to the nearest end", () => {
        /*
         * The whole reason resolving happens on the way out as well as on the way in. A row holding
         * an expiry of two days was written by something that was not the interface, so there is no
         * choice there to honour - clamping it to a day would invent one nobody made, and it is the
         * dropped value that lets a bound being tightened take effect on rows written before it.
         */
        const resolved = dynamicChannelLfmTimingsResolve( { postExpiry: 2 * DAY } );

        expect( resolved.postExpiry ).toBe( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postExpiry );
    } );

    it( "should keep the fields that are in bounds when another is not", () => {
        // One unusable value is not a reason to discard the three beside it.
        const resolved = dynamicChannelLfmTimingsResolve( {
            postCooldown: 5 * MINUTE,
            postExpiry: 2 * DAY
        } );

        expect( resolved.postCooldown ).toBe( 5 * MINUTE );
        expect( resolved.postExpiry ).toBe( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postExpiry );
    } );

    it( "should take a cooldown of zero as a choice rather than as nothing chosen", () => {
        // Zero is falsy and is also the one value that turns a cooldown off, so reading it as
        // "unset" would quietly refuse the only way to have no cooldown at all.
        const resolved = dynamicChannelLfmTimingsResolve( { postCooldown: 0, pingCooldown: 0 } );

        expect( resolved.postCooldown ).toBe( 0 );
        expect( resolved.pingCooldown ).toBe( 0 );
    } );

    it( "should ignore a field explicitly handed nothing", () => {
        const resolved = dynamicChannelLfmTimingsResolve( { postCooldown: undefined } );

        expect( resolved.postCooldown ).toBe( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postCooldown );
    } );

    it( "should answer a fresh object rather than the fallbacks themselves", () => {
        // Handing the shared constant back would let one caller's edit become everybody's default.
        const resolved = dynamicChannelLfmTimingsResolve();

        resolved.postCooldown = 1 * SECOND;

        expect( DYNAMIC_CHANNEL_LFM_TIMINGS_FALLBACKS.postCooldown ).toBe( 10 * MINUTE );
    } );
} );
