import {
    BILLING_UNLIMITED_MASTER_CHANNELS,
    formatMasterChannelAllowance,
    isSubscriptionEntitling,
    isTrialRunning,
    isUnlimitedAllowance,
    shouldApplySubscriptionEvent,
    readBillingTiers,
    resolveCanBrand,
    resolveMaxMasterChannels,
    resolveTrialEndsAt,
    resolveTrialTier
} from "@vertix.gg/definitions/src/billing-definitions";

import type { IBillingTier } from "@vertix.gg/definitions/src/billing-definitions";

const FREE = 2;

// Doubles rather than the real table: what is being checked is the arithmetic, and it takes finite
// steps to check it at all - the table on sale is one tier with no ceiling, which would pass every
// `Math.max` below without exercising any of them. What that table itself sells is covered further
// down, under "the plan on sale". Only "Large" offers a trial, so a trial can be told apart from
// the tiers either side of it.
const TIERS: IBillingTier[] = [
    { name: "Small", slug: "small", priceId: "pri_small", maxMasterChannels: 5, monthlyPriceUsd: 2, includesBranding: false, trialDays: 0 },
    { name: "Large", slug: "large", priceId: "pri_large", maxMasterChannels: 15, monthlyPriceUsd: 4, includesBranding: true, trialDays: 7 },
    { name: "Unlimited", slug: "unlimited", priceId: "pri_unlimited", maxMasterChannels: BILLING_UNLIMITED_MASTER_CHANNELS, monthlyPriceUsd: 10, includesBranding: true, trialDays: 0 }
];

// A fixed moment, so "still running" and "ran out" are arithmetic rather than a race.
const NOW = new Date( "2026-09-21T12:00:00.000Z" );

const laterThan = ( date: Date, days: number ) =>
    new Date( date.getTime() + days * 24 * 60 * 60 * 1000 );

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
                paidPriceIds: [ "pri_small" ],
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
                paidPriceIds: [ "pri_small", "pri_large" ],
                tiers: TIERS
            } );

            // Assert.
            expect( allowed ).toBe( 15 );
        } );

        it( "should never take away what was granted by hand", () => {
            // Act - a server given forty generators for a reason, now paying for the small tier.
            const allowed = resolveMaxMasterChannels( {
                granted: 40,
                paidPriceIds: [ "pri_small" ],
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
                paidPriceIds: [ "pri_small" ],
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
        it( "should read Pro's id from the environment", () => {
            // Act.
            const tiers = readBillingTiers( { PADDLE_PRICE_PRO: "5678" } );

            // Assert.
            expect( tiers.map( ( tier ) => [ tier.slug, tier.priceId ] ) ).toEqual( [ [ "pro", "5678" ] ] );
        } );

        it( "should sell nothing but Pro, whatever else the environment still carries", () => {
            // Act - an env file written before Plus and Ultimate were retired still has their keys.
            const tiers = readBillingTiers( {
                PADDLE_PRICE_PLUS: "1234",
                PADDLE_PRICE_PRO: "5678",
                PADDLE_PRICE_ULTIMATE: "9012"
            } );

            // Assert.
            expect( tiers.map( ( tier ) => tier.slug ) ).toEqual( [ "pro" ] );
        } );

        it( "should drop a tier whose id is whitespace", () => {
            // Act - an env file with the key present and nothing after it.
            const tiers = readBillingTiers( { PADDLE_PRICE_PRO: "   " } );

            // Assert.
            expect( tiers ).toEqual( [] );
        } );

        it( "should carry the price, which is what the site quotes", () => {
            // Act.
            const tiers = readBillingTiers( { PADDLE_PRICE_PRO: "5678" } );

            // Assert.
            expect( tiers[ 0 ].monthlyPriceUsd ).toBeGreaterThan( 0 );
        } );

        it( "should sell nothing when the environment has no id for Pro", () => {
            // Assert - carried with an empty id it would match a subscription naming no price at all.
            expect( readBillingTiers( {} ) ).toEqual( [] );
        } );
    } );

    describe( "the plan on sale", () => {
        // The real table, read the way the bot reads it - these are the answers a paying server gets.
        const ENVIRONMENT = { PADDLE_PRICE_PRO: "pri_pro" };

        it( "should give a server paying for Pro no ceiling at all", () => {
            // Act.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                paidPriceIds: [ "pri_pro" ],
                tiers: readBillingTiers( ENVIRONMENT )
            } );

            // Assert.
            expect( isUnlimitedAllowance( allowed ) ).toBe( true );
        } );

        it( "should leave a server on a retired price with what it was granted", () => {
            // Act - a row naming Plus's price, in a deployment whose env still sets the retired
            // keys. Retired is not a tier; it is a price this build does not sell.
            const allowed = resolveMaxMasterChannels( {
                granted: FREE,
                paidPriceIds: [ "pri_retired_plus" ],
                tiers: readBillingTiers( {
                    ... ENVIRONMENT,
                    PADDLE_PRICE_PLUS: "pri_retired_plus",
                    PADDLE_PRICE_ULTIMATE: "pri_retired_ultimate"
                } )
            } );

            // Assert.
            expect( allowed ).toBe( FREE );
        } );

        it( "should let a server paying for Pro give the bot its own profile", () => {
            // Act & Assert.
            expect( resolveCanBrand( { paidPriceIds: [ "pri_pro" ], tiers: readBillingTiers( ENVIRONMENT ) } ) )
                .toBe( true );
        } );

        it( "should not let a server paying for nothing, or on a retired price, brand the bot", () => {
            // Arrange.
            const tiers = readBillingTiers( { ... ENVIRONMENT, PADDLE_PRICE_PLUS: "pri_retired_plus" } );

            // Act & Assert.
            expect( resolveCanBrand( { paidPriceIds: [], tiers } ) ).toBe( false );
            expect( resolveCanBrand( { paidPriceIds: [ "pri_retired_plus" ], tiers } ) ).toBe( false );
        } );

        it( "should give a server on its trial everything Pro gives, for fourteen days and no longer", () => {
            // Arrange.
            const tiers = readBillingTiers( ENVIRONMENT );

            const trialEndsAt = resolveTrialEndsAt( { startedAt: NOW, tiers } );

            const holdingsAt = ( now: Date ) => ( { paidPriceIds: [], tiers, trialEndsAt, now } );

            // Act.
            const lastDay = holdingsAt( laterThan( NOW, 13 ) ),
                dayAfter = holdingsAt( laterThan( NOW, 14 ) );

            // Assert.
            expect( trialEndsAt ).toEqual( laterThan( NOW, 14 ) );

            expect( isUnlimitedAllowance( resolveMaxMasterChannels( { granted: FREE, ... lastDay } ) ) ).toBe( true );
            expect( resolveCanBrand( lastDay ) ).toBe( true );

            expect( resolveMaxMasterChannels( { granted: FREE, ... dayAfter } ) ).toBe( FREE );
            expect( resolveCanBrand( dayAfter ) ).toBe( false );
        } );
    } );

    describe( "resolveCanBrand()", () => {
        it( "should answer by the tier paid for, not by what paying raised the allowance to", () => {
            // Act & Assert - "Small" raises generators and does not include a profile.
            expect( resolveCanBrand( { paidPriceIds: [ "pri_small" ], tiers: TIERS } ) ).toBe( false );
            expect( resolveCanBrand( { paidPriceIds: [ "pri_large" ], tiers: TIERS } ) ).toBe( true );
        } );

        it( "should not be answered by a price this deployment does not sell", () => {
            // Act & Assert.
            expect( resolveCanBrand( { paidPriceIds: [ "pri_unknown" ], tiers: TIERS } ) ).toBe( false );
        } );
    } );

    describe( "a free trial", () => {
        it( "should hold the tier that offers it while it runs, as paying for it would", () => {
            // Arrange.
            const holdings = { paidPriceIds: [], tiers: TIERS, trialEndsAt: laterThan( NOW, 3 ), now: NOW };

            // Act & Assert.
            expect( resolveMaxMasterChannels( { granted: FREE, ... holdings } ) ).toBe( 15 );
            expect( resolveCanBrand( holdings ) ).toBe( true );
        } );

        it( "should hold nothing once its date has passed", () => {
            // Arrange - nothing came to end it; the date did.
            const holdings = { paidPriceIds: [], tiers: TIERS, trialEndsAt: laterThan( NOW, -1 ), now: NOW };

            // Act & Assert.
            expect( resolveMaxMasterChannels( { granted: FREE, ... holdings } ) ).toBe( FREE );
            expect( resolveCanBrand( holdings ) ).toBe( false );
        } );

        it( "should hold nothing where no tier on sale offers one", () => {
            // Arrange - "Small" and "Unlimited" offer no trial, so a running date gives nothing.
            const tiers = TIERS.filter( ( tier ) => 0 === tier.trialDays );

            const holdings = { paidPriceIds: [], tiers, trialEndsAt: laterThan( NOW, 3 ), now: NOW };

            // Act & Assert.
            expect( resolveMaxMasterChannels( { granted: FREE, ... holdings } ) ).toBe( FREE );
            expect( resolveCanBrand( holdings ) ).toBe( false );
        } );

        it( "should never lower what is paid for or what was granted", () => {
            // Act - a trial is a floor under the server, not a ceiling over it.
            const paying = resolveMaxMasterChannels( {
                granted: FREE,
                paidPriceIds: [ "pri_unlimited" ],
                tiers: TIERS,
                trialEndsAt: laterThan( NOW, 3 ),
                now: NOW
            } );

            const granted = resolveMaxMasterChannels( {
                granted: 40,
                paidPriceIds: [],
                tiers: TIERS,
                trialEndsAt: laterThan( NOW, 3 ),
                now: NOW
            } );

            // Assert.
            expect( isUnlimitedAllowance( paying ) ).toBe( true );
            expect( granted ).toBe( 40 );
        } );

        it( "should hold nothing for a server that never had one", () => {
            // Act & Assert.
            expect( resolveCanBrand( { paidPriceIds: [], tiers: TIERS, trialEndsAt: null, now: NOW } ) ).toBe( false );
        } );
    } );

    describe( "resolveTrialTier()", () => {
        it( "should find the tier that offers a trial", () => {
            // Act & Assert.
            expect( resolveTrialTier( TIERS )?.slug ).toBe( "large" );
        } );

        it( "should find none where no tier offers one", () => {
            // Act & Assert.
            expect( resolveTrialTier( TIERS.filter( ( tier ) => 0 === tier.trialDays ) ) ).toBeNull();
            expect( resolveTrialTier( [] ) ).toBeNull();
        } );
    } );

    describe( "resolveTrialEndsAt()", () => {
        it( "should run a trial for as many days as its tier offers", () => {
            // Act.
            const endsAt = resolveTrialEndsAt( { startedAt: NOW, tiers: TIERS } );

            // Assert.
            expect( endsAt ).toEqual( laterThan( NOW, 7 ) );
        } );

        it( "should give no date where nothing offers a trial", () => {
            // Act - null rather than a date, so the caller writes nothing instead of a trial of nothing.
            const endsAt = resolveTrialEndsAt( { startedAt: NOW, tiers: [] } );

            // Assert.
            expect( endsAt ).toBeNull();
        } );
    } );

    describe( "isTrialRunning()", () => {
        it( "should run until its date and not a moment past it", () => {
            // Act & Assert.
            expect( isTrialRunning( laterThan( NOW, 1 ), NOW ) ).toBe( true );
            expect( isTrialRunning( NOW, NOW ) ).toBe( false );
            expect( isTrialRunning( laterThan( NOW, -1 ), NOW ) ).toBe( false );
        } );

        it( "should not run for a server that never had one", () => {
            // Act & Assert.
            expect( isTrialRunning( null, NOW ) ).toBe( false );
        } );
    } );

    describe( "isSubscriptionEntitling()", () => {
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

    describe( "shouldApplySubscriptionEvent()", () => {
        const EARLIER = new Date( "2026-09-21T12:00:00.000Z" );
        const LATER = new Date( "2026-09-21T12:05:00.000Z" );

        it( "should apply an event newer than what is stored", () => {
            // Act.
            const apply = shouldApplySubscriptionEvent( {
                storedOccurredAt: EARLIER,
                incomingOccurredAt: LATER
            } );

            // Assert.
            expect( apply ).toBe( true );
        } );

        it( "should drop an event older than what is stored", () => {
            // Act - a retry of something paddle thought failed, arriving after the truth.
            const apply = shouldApplySubscriptionEvent( {
                storedOccurredAt: LATER,
                incomingOccurredAt: EARLIER
            } );

            // Assert.
            expect( apply ).toBe( false );
        } );

        it( "should apply the same event delivered twice", () => {
            // Act - equal timestamps are one event arriving again, and the write is idempotent.
            const apply = shouldApplySubscriptionEvent( {
                storedOccurredAt: EARLIER,
                incomingOccurredAt: EARLIER
            } );

            // Assert.
            expect( apply ).toBe( true );
        } );

        it( "should apply anything when there is no row to compare against", () => {
            // Act.
            const apply = shouldApplySubscriptionEvent( {
                storedOccurredAt: null,
                incomingOccurredAt: EARLIER
            } );

            // Assert.
            expect( apply ).toBe( true );
        } );

        it( "should apply an event that carries no timestamp rather than lose it", () => {
            // Act - refusing on missing ordering information would drop a real subscription for a
            // payload shape nobody predicted, which is the worse of the two failures.
            const apply = shouldApplySubscriptionEvent( {
                storedOccurredAt: LATER,
                incomingOccurredAt: null
            } );

            // Assert.
            expect( apply ).toBe( true );
        } );

        it( "should not let a delayed event bring a cancelled subscription back", () => {
            // Act - the whole reason this exists. The row says cancelled because the newer event
            // landed first; the late `active` one must not overwrite it.
            const apply = shouldApplySubscriptionEvent( {
                storedOccurredAt: LATER,
                incomingOccurredAt: EARLIER
            } );

            // Assert.
            expect( apply ).toBe( false );
        } );
    } );
} );
