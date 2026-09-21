import {
    readBillingTiers,
    resolveMaxMasterChannels
} from "@vertix.gg/definitions/src/billing-definitions";

import type { IBillingTier } from "@vertix.gg/definitions/src/billing-definitions";

const FREE = 2;

const TIERS: IBillingTier[] = [
    { name: "Plus", skuId: "sku-plus", maxMasterChannels: 5 },
    { name: "Pro", skuId: "sku-pro", maxMasterChannels: 15 }
];

describe( "VertixDefinitions/Billing", () => {
    describe( "resolveMaxMasterChannels()", () => {
        it( "should leave a server that pays for nothing on what it was granted", () => {
            // Act.
            const allowed = resolveMaxMasterChannels( { granted: FREE, entitledSkuIds: [], tiers: TIERS } );

            // Assert.
            expect( allowed ).toBe( FREE );
        } );

        it( "should raise a server to the tier it pays for", () => {
            // Act.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                entitledSkuIds: [ "sku-plus" ],
                tiers: TIERS
            } );

            // Assert.
            expect( allowed ).toBe( 5 );
        } );

        it( "should take the best tier when a guild somehow holds two", () => {
            // Act - discord upgrades by ending one subscription and starting another, and the two
            // can overlap for as long as the first one's period has left to run.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                entitledSkuIds: [ "sku-plus", "sku-pro" ],
                tiers: TIERS
            } );

            // Assert.
            expect( allowed ).toBe( 15 );
        } );

        it( "should never take away what was granted by hand", () => {
            // Act - a server given forty generators for a reason, now paying for Plus.
            const allowed = resolveMaxMasterChannels( {
                granted: 40,
                entitledSkuIds: [ "sku-plus" ],
                tiers: TIERS
            } );

            // Assert.
            expect( allowed ).toBe( 40 );
        } );

        it( "should ignore an entitlement for a sku this build does not know", () => {
            // Act - a SKU published after this deployment, or belonging to another application.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                entitledSkuIds: [ "sku-from-the-future" ],
                tiers: TIERS
            } );

            // Assert.
            expect( allowed ).toBe( FREE );
        } );

        it( "should answer with the grant when nothing is configured to sell", () => {
            // Act.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                entitledSkuIds: [ "sku-plus" ],
                tiers: []
            } );

            // Assert.
            expect( allowed ).toBe( FREE );
        } );
    } );

    describe( "readBillingTiers()", () => {
        it( "should read the ids the environment supplies", () => {
            // Act.
            const tiers = readBillingTiers( { DISCORD_SKU_PLUS: "1234", DISCORD_SKU_PRO: "5678" } );

            // Assert.
            expect( tiers.map( ( tier ) => [ tier.name, tier.skuId ] ) )
                .toEqual( [ [ "Plus", "1234" ], [ "Pro", "5678" ] ] );
        } );

        it( "should drop a tier this deployment has no id for", () => {
            // Act.
            const tiers = readBillingTiers( { DISCORD_SKU_PLUS: "1234" } );

            // Assert - carried with an empty id it would match an entitlement naming no sku at all.
            expect( tiers.map( ( tier ) => tier.name ) ).toEqual( [ "Plus" ] );
        } );

        it( "should drop a tier whose id is whitespace", () => {
            // Act - an env file with the key present and nothing after it.
            const tiers = readBillingTiers( { DISCORD_SKU_PLUS: "   ", DISCORD_SKU_PRO: "5678" } );

            // Assert.
            expect( tiers.map( ( tier ) => tier.name ) ).toEqual( [ "Pro" ] );
        } );

        it( "should sell nothing when the environment says nothing", () => {
            // Assert.
            expect( readBillingTiers( {} ) ).toEqual( [] );
        } );
    } );
} );
