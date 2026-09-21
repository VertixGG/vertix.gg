import {
    BILLING_UNLIMITED_MASTER_CHANNELS,
    formatMasterChannelAllowance,
    isSubscriptionEntitling,
    isUnlimitedAllowance,
    readBillingTiers,
    resolveMaxMasterChannels
} from "@vertix.gg/definitions/src/billing-definitions";

import type { IBillingTier } from "@vertix.gg/definitions/src/billing-definitions";

const FREE = 2;

// Doubles rather than the real ladder: what is being checked is the arithmetic, and a test that
// restated today's prices would fail the next time they were changed for no reason worth knowing.
const TIERS: IBillingTier[] = [
    { name: "Plus", slug: "plus", priceId: "pri_plus", maxMasterChannels: 5, monthlyPriceUsd: 2 },
    { name: "Pro", slug: "pro", priceId: "pri_pro", maxMasterChannels: 15, monthlyPriceUsd: 4 },
    { name: "Ultimate", slug: "ultimate", priceId: "pri_unlimited", maxMasterChannels: BILLING_UNLIMITED_MASTER_CHANNELS, monthlyPriceUsd: 10 }
];

describe( "VertixDefinitions/Billing", () => {
    describe( "resolveMaxMasterChannels()", () => {
        it( "should leave a server that pays for nothing on what it was granted", () => {
            // Act.
            const allowed = resolveMaxMasterChannels( { granted: FREE, paidPriceIds: [], tiers: TIERS } );

            // Assert.
            expect( allowed ).toBe( FREE );
        } );

        it( "should raise a server to the tier it pays for", () => {
            // Act.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                paidPriceIds: [ "pri_plus" ],
                tiers: TIERS
            } );

            // Assert.
            expect( allowed ).toBe( 5 );
        } );

        it( "should take the best tier when a guild somehow has two subscriptions", () => {
            // Act - an upgrade can leave the old subscription running until its period is up, so
            // the two overlap for as long as the customer already paid for.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                paidPriceIds: [ "pri_plus", "pri_pro" ],
                tiers: TIERS
            } );

            // Assert.
            expect( allowed ).toBe( 15 );
        } );

        it( "should never take away what was granted by hand", () => {
            // Act - a server given forty generators for a reason, now paying for Plus.
            const allowed = resolveMaxMasterChannels( {
                granted: 40,
                paidPriceIds: [ "pri_plus" ],
                tiers: TIERS
            } );

            // Assert.
            expect( allowed ).toBe( 40 );
        } );

        it( "should ignore a subscription on a price this build does not know", () => {
            // Act - a price added after this deployment, or belonging to the other paddle account.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                paidPriceIds: [ "pri_from_the_future" ],
                tiers: TIERS
            } );

            // Assert.
            expect( allowed ).toBe( FREE );
        } );

        it( "should answer with the grant when nothing is configured to sell", () => {
            // Act.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                paidPriceIds: [ "pri_plus" ],
                tiers: []
            } );

            // Assert.
            expect( allowed ).toBe( FREE );
        } );
    } );

    describe( "an allowance with no ceiling", () => {
        it( "should beat every finite tier and every grant", () => {
            // Act.
            const allowed = resolveMaxMasterChannels( {
                granted: 40,
                paidPriceIds: [ "pri_unlimited" ],
                tiers: TIERS
            } );

            // Assert.
            expect( isUnlimitedAllowance( allowed ) ).toBe( true );
        } );

        it( "should be printed as a word rather than as Infinity", () => {
            // Assert - the one mistake a screen printing an allowance can make.
            expect( formatMasterChannelAllowance( BILLING_UNLIMITED_MASTER_CHANNELS ) ).toBe( "Unlimited" );
            expect( formatMasterChannelAllowance( 9 ) ).toBe( "9" );
        } );

        it( "should not mistake a finite allowance for one", () => {
            // Assert.
            expect( isUnlimitedAllowance( 9 ) ).toBe( false );
            expect( isUnlimitedAllowance( 0 ) ).toBe( false );
        } );
    } );

    describe( "readBillingTiers()", () => {
        it( "should read the ids the environment supplies", () => {
            // Act.
            const tiers = readBillingTiers( {
                PADDLE_PRICE_PLUS: "1234",
                PADDLE_PRICE_PRO: "5678",
                PADDLE_PRICE_ULTIMATE: "9012"
            } );

            // Assert.
            expect( tiers.map( ( tier ) => [ tier.name, tier.priceId ] ) )
                .toEqual( [ [ "Plus", "1234" ], [ "Pro", "5678" ], [ "Ultimate", "9012" ] ] );
        } );

        it( "should drop a tier this deployment has no id for", () => {
            // Act.
            const tiers = readBillingTiers( { PADDLE_PRICE_PLUS: "1234" } );

            // Assert - carried with an empty id it would match a subscription naming no price at all.
            expect( tiers.map( ( tier ) => tier.name ) ).toEqual( [ "Plus" ] );
        } );

        it( "should drop a tier whose id is whitespace", () => {
            // Act - an env file with the key present and nothing after it.
            const tiers = readBillingTiers( { PADDLE_PRICE_PLUS: "   ", PADDLE_PRICE_PRO: "5678" } );

            // Assert.
            expect( tiers.map( ( tier ) => tier.name ) ).toEqual( [ "Pro" ] );
        } );

        it( "should carry the price, which is what the site quotes", () => {
            // Act.
            const tiers = readBillingTiers( { PADDLE_PRICE_PLUS: "1234" } );

            // Assert.
            expect( tiers[ 0 ].monthlyPriceUsd ).toBeGreaterThan( 0 );
        } );

        it( "should sell nothing when the environment says nothing", () => {
            // Assert.
            expect( readBillingTiers( {} ) ).toEqual( [] );
        } );
    } );

    describe( "isSubscriptionEntitling()", () => {
        // A fixed moment, so "still running" and "ran out" are arithmetic rather than a race.
        const NOW = new Date( "2026-09-21T12:00:00.000Z" );

        const laterThan = ( date: Date, days: number ) =>
            new Date( date.getTime() + days * 24 * 60 * 60 * 1000 );

        it( "should entitle a subscription being paid for", () => {
            // Act.
            const entitling = isSubscriptionEntitling(
                { status: "active", currentPeriodEnd: laterThan( NOW, 10 ) },
                NOW
            );

            // Assert.
            expect( entitling ).toBe( true );
        } );

        it( "should entitle a trial, which is a subscription nobody has been charged for yet", () => {
            // Act.
            const entitling = isSubscriptionEntitling(
                { status: "trialing", currentPeriodEnd: laterThan( NOW, 10 ) },
                NOW
            );

            // Assert.
            expect( entitling ).toBe( true );
        } );

        it( "should entitle a cancelled subscription until the month it paid for is up", () => {
            // Act - the whole reason the period decides this rather than the status. Somebody who
            // cancels on the second of the month has bought the rest of it.
            const entitling = isSubscriptionEntitling(
                { status: "canceled", currentPeriodEnd: laterThan( NOW, 10 ) },
                NOW
            );

            // Assert.
            expect( entitling ).toBe( true );
        } );

        it( "should stop entitling a cancelled subscription once that month is up", () => {
            // Act - and nothing had to come and tell us. The row expired on its own.
            const entitling = isSubscriptionEntitling(
                { status: "canceled", currentPeriodEnd: laterThan( NOW, -1 ) },
                NOW
            );

            // Assert.
            expect( entitling ).toBe( false );
        } );

        it( "should keep entitling an active subscription whose renewal event went missing", () => {
            // Act - the period is stale because nothing arrived to move it. Refusing here would
            // take the plan from somebody who is paying, which is the worse of the two mistakes.
            const entitling = isSubscriptionEntitling(
                { status: "active", currentPeriodEnd: laterThan( NOW, -1 ) },
                NOW
            );

            // Assert.
            expect( entitling ).toBe( true );
        } );

        it( "should stop entitling one that went past due and stayed there", () => {
            // Act.
            const entitling = isSubscriptionEntitling(
                { status: "past_due", currentPeriodEnd: laterThan( NOW, -1 ) },
                NOW
            );

            // Assert.
            expect( entitling ).toBe( false );
        } );

        it( "should fall back to the status when the row carries no period", () => {
            // Act.
            const active = isSubscriptionEntitling( { status: "active", currentPeriodEnd: null }, NOW );
            const paused = isSubscriptionEntitling( { status: "paused", currentPeriodEnd: null }, NOW );

            // Assert.
            expect( active ).toBe( true );
            expect( paused ).toBe( false );
        } );

        it( "should entitle a paused subscription for the period it already paid for", () => {
            // Act - pausing is not a refund, so the time bought is still bought.
            const entitling = isSubscriptionEntitling(
                { status: "paused", currentPeriodEnd: laterThan( NOW, 10 ) },
                NOW
            );

            // Assert.
            expect( entitling ).toBe( true );
        } );
    } );
} );
