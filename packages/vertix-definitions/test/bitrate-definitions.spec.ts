import {
    BITRATE_STEPS,
    bitrateToKilobits,
    clampBitrate,
    getBitrateSteps
} from "@vertix.gg/definitions/src/bitrate-definitions";

// The maximum each kind of guild reports, as discord.js works it out from the boost tier -
// `Guild#maximumBitrate`. Named rather than written into each assertion, so a test says which guild
// it is about instead of which number.
const NO_TIER = 96_000,
    TIER_1 = 128_000,
    TIER_2 = 256_000,
    TIER_3 = 384_000,
    VIP_REGIONS = 384_000;

describe( "VertixDefinitions/Bitrate", () => {
    describe( "getBitrateSteps()", () => {
        it( "should offer every step to a guild with no maximum to measure against", () => {
            // Act - the ui exporter runs headless, with no guild behind the menu.
            const steps = getBitrateSteps();

            // Assert.
            expect( steps ).toEqual( [ ...BITRATE_STEPS ] );
        } );

        it( "should stop at 96 kbps on a server that is not boosted", () => {
            // Act.
            const steps = getBitrateSteps( NO_TIER );

            // Assert.
            expect( steps ).toEqual( [ 8_000, 16_000, 32_000, 64_000, 96_000 ] );
        } );

        it( "should reach 128 kbps on the first boost tier", () => {
            // Act.
            const steps = getBitrateSteps( TIER_1 );

            // Assert.
            expect( steps ).toEqual( [ 8_000, 16_000, 32_000, 64_000, 96_000, 128_000 ] );
        } );

        it( "should reach 256 kbps on the second boost tier", () => {
            // Act.
            const steps = getBitrateSteps( TIER_2 );

            // Assert.
            expect( steps ).toEqual( [ 8_000, 16_000, 32_000, 64_000, 96_000, 128_000, 256_000 ] );
        } );

        it( "should reach 384 kbps on the third boost tier", () => {
            // Act.
            const steps = getBitrateSteps( TIER_3 );

            // Assert.
            expect( steps ).toEqual( [ ...BITRATE_STEPS ] );
        } );

        it( "should reach 384 kbps on a guild carrying the vip regions feature", () => {
            // Act - the feature answers 384 whatever the tier underneath it.
            const steps = getBitrateSteps( VIP_REGIONS );

            // Assert.
            expect( steps ).toEqual( [ ...BITRATE_STEPS ] );
        } );

        it( "should offer every step rather than none when the maximum arrives as zero", () => {
            // Act - a guild that has not been read yet is not a guild that allows nothing.
            const steps = getBitrateSteps( 0 );

            // Assert.
            expect( steps ).toEqual( [ ...BITRATE_STEPS ] );
        } );
    } );

    describe( "clampBitrate()", () => {
        it( "should leave a bitrate the guild allows alone", () => {
            // Act.
            const bitrate = clampBitrate( 64_000, NO_TIER );

            // Assert.
            expect( bitrate ).toBe( 64_000 );
        } );

        it( "should bring a bitrate above the guild's ceiling down to it", () => {
            // Act - the server was boosted when the screen was drawn and is not now.
            const bitrate = clampBitrate( 256_000, NO_TIER );

            // Assert.
            expect( bitrate ).toBe( NO_TIER );
        } );

        it( "should hold a bitrate below discord's floor up to it", () => {
            // Act.
            const bitrate = clampBitrate( 1_000, NO_TIER );

            // Assert.
            expect( bitrate ).toBe( 8_000 );
        } );
    } );

    describe( "bitrateToKilobits()", () => {
        it( "should say what discord's own interface says", () => {
            // Assert.
            expect( bitrateToKilobits( 64_000 ) ).toBe( 64 );
            expect( bitrateToKilobits( 384_000 ) ).toBe( 384 );
        } );

        it( "should round a bitrate that was not set from the menu", () => {
            // Assert - a channel can carry any number the api took, not only a step.
            expect( bitrateToKilobits( 90_500 ) ).toBe( 91 );
        } );
    } );
} );
