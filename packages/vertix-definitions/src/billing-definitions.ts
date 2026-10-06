/**
 * What a server may buy, and what each purchase allows.
 *
 * Sold through paddle, which is a merchant of record - it sells to the customer, collects the sales
 * tax and pays us. That is what makes selling from here possible at all: discord's own subscriptions
 * are sold from the US, the EU and the UK only.
 *
 * An allowance is bought as a plan rather than a generator at a time, which was discord's constraint
 * rather than paddle's - it is kept because the ladder a per-generator price would need is a worse
 * thing to put in front of somebody than one plan with no ceiling.
 *
 * The ids themselves are not here. A price id belongs to one paddle account and the sandbox is a
 * different account from the live one, so the id is environment and the shape is code.
 */
export interface IBillingTier {
    /** What the tier is called, for the screens and the log. */
    name: string;

    /**
     * What names it in a url - `…/billing?plan=pro`.
     *
     * Its own field rather than the name lowercased, so renaming a plan on the site does not quietly
     * break every link to it that is already out there.
     */
    slug: string;

    /** The paddle price id - `pri_…` - a subscription on this tier is billed against. */
    priceId: string;

    /** How many generators a guild holding it may have. */
    maxMasterChannels: number;

    /** What it costs a month, in whole dollars, for the pages that say so. */
    monthlyPriceUsd: number;

    /**
     * Whether a server holding it may give the bot its own profile there - name, avatar, banner and
     * bio, in that server only. See `guild-branding-definitions.ts`.
     *
     * On the tier rather than implied by paying at all, so a tier that did not include it would be
     * one field rather than a special case somewhere else.
     */
    includesBranding: boolean;

    /**
     * How many days a server may hold this tier for nothing, once - counted from a room its members
     * make. Zero for a tier with no trial.
     *
     * On the tier for the same reason `includesBranding` is: a trial is something a tier offers, so
     * a tier that offered none is one field rather than a special case somewhere else.
     */
    trialDays: number;
}

/**
 * How many generators a server has without paying anything.
 *
 * Here rather than only in the guild config, because the site quotes it and the config defaults to
 * it - written in both places the two would drift, and the one that is wrong would be the one
 * people read before deciding whether to pay.
 */
export const BILLING_FREE_MAX_MASTER_CHANNELS = 2;

/**
 * An allowance with no ceiling.
 *
 * Infinity rather than a big number, so `Math.max` and `<` mean what they say and no arithmetic has
 * to know it is special. It does **not** survive JSON - `JSON.stringify` turns it into `null` - so
 * anything sending an allowance over the wire converts it deliberately rather than discovering that.
 */
export const BILLING_UNLIMITED_MASTER_CHANNELS = Number.POSITIVE_INFINITY;

/**
 * Function isUnlimitedAllowance() :: Whether this allowance has no ceiling.
 */
export function isUnlimitedAllowance( maxMasterChannels: number ): boolean {
    return ! Number.isFinite( maxMasterChannels );
}

/**
 * Function formatMasterChannelAllowance() :: An allowance as a screen should print it.
 *
 * Every screen that prints one goes through here, because the one that does not is the one that
 * shows somebody the word `Infinity`.
 */
export function formatMasterChannelAllowance( maxMasterChannels: number ): string {
    return isUnlimitedAllowance( maxMasterChannels ) ? "Unlimited" : String( maxMasterChannels );
}

/**
 * The tiers, in the order they are offered.
 *
 * One. There were three - Plus, Pro and Ultimate, at four, nine and unlimited generators - and a
 * ladder like that asks somebody to guess how many generators they will need before they have run
 * any. Pro asks nothing: it has no ceiling, so there is nothing above it to sell and nothing to
 * outgrow. It is billed monthly, and that is the only interval there is.
 *
 * Still a list, so a second tier would be another entry rather than a new shape. Nothing picks a
 * tier out of it by position - a screen that means Pro says `"pro"`.
 *
 * The numbers are **totals, not extras** - a tier says how many generators a server may have
 * altogether, free ones included.
 *
 * Plus and Ultimate are retired rather than kept for anybody: live billing had not launched when
 * they went, so no real payer holds either. A subscription still naming one of their price ids is
 * a price this deployment does not know, and is worth what any such price is - see
 * `resolveMaxMasterChannels()`.
 *
 * The price is quoted from here and charged by paddle, which are two different places. Nothing reads
 * paddle's own number back - a price is set in its dashboard and the webhook carries only the id -
 * so a tier repriced there has to be repriced here too, or the site quotes one figure while the
 * checkout charges another.
 *
 * Two places quote it by hand because they cannot read this: the `/pricing` description in the
 * website's `site-meta.ts`, which the build's sitemap step imports as plain data, and the no-script
 * fallback in the dashboard's `index.html`. A reprice touches both.
 */
export const BILLING_TIER_DEFINITIONS = [
    {
        name: "Pro",
        slug: "pro",
        environmentKey: "PADDLE_PRICE_PRO",
        maxMasterChannels: BILLING_UNLIMITED_MASTER_CHANNELS,
        monthlyPriceUsd: 4,
        includesBranding: true,
        trialDays: 14
    }
] as const;

/**
 * Paddle's words for a subscription somebody is paying for right now.
 *
 * `trialing` is one of them because a trial is a subscription that has not been charged yet, not one
 * that is owed nothing - refusing it would withdraw the plan for exactly the period it exists to
 * demonstrate.
 */
const BILLING_ENTITLING_STATUSES: readonly string[] = [ "active", "trialing" ];

/**
 * Function isSubscriptionEntitling() :: Whether this subscription still buys anything.
 *
 * The period already paid for decides it before the status does: somebody who cancels has bought the
 * rest of the month and keeps it, and nothing has to tell us when that month ends - the row simply
 * stops being true on its own. That is what makes a webhook we never received survivable.
 *
 * The status is what answers for a row carrying no period, and it errs generous on purpose. A
 * renewal whose event went missing leaves `active` standing against a date now in the past, and the
 * strict reading of that would take a plan away from somebody who is paying for it.
 */
export function isSubscriptionEntitling(
    subscription: { status: string; currentPeriodEnd: Date | null },
    now: Date = new Date()
): boolean {
    const withinPaidPeriod = null !== subscription.currentPeriodEnd
        && subscription.currentPeriodEnd.getTime() > now.getTime();

    return withinPaidPeriod || BILLING_ENTITLING_STATUSES.includes( subscription.status );
}

/**
 * Function shouldApplySubscriptionEvent() :: Whether this event is worth writing down.
 *
 * Webhooks are not a queue. Paddle retries what it thinks failed, and a retry of an older event can
 * land after a newer one has already been written - which, with a row that is replaced wholesale,
 * would bring a cancelled subscription back to life.
 *
 * Decided on paddle's `occurred_at` rather than on arrival, because arrival order is the thing that
 * cannot be trusted. Only an event that is *definitely* older is refused: equal timestamps are the
 * same event delivered twice, and writing it again changes nothing.
 *
 * An event carrying no timestamp is applied. That is not an endorsement - it is that refusing a
 * write on missing ordering information would lose a real subscription to a shape nobody predicted.
 */
export function shouldApplySubscriptionEvent( options: {
    storedOccurredAt: Date | null;
    incomingOccurredAt: Date | null;
} ): boolean {
    const { storedOccurredAt, incomingOccurredAt } = options;

    if ( null === storedOccurredAt || null === incomingOccurredAt ) {
        return true;
    }

    return incomingOccurredAt.getTime() >= storedOccurredAt.getTime();
}

/** A day, in the milliseconds a `Date` counts in. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Function resolveTrialTier() :: The tier a free trial gives, or null where none is offered.
 *
 * The first tier offering one, in the order they are offered - there is one tier, so it is Pro.
 * Asked of the tiers this deployment can sell rather than of the table, so a deployment that cannot
 * sell Pro gives nobody a trial of it either.
 */
export function resolveTrialTier( tiers: readonly IBillingTier[] ): IBillingTier | null {
    return tiers.find( ( tier ) => tier.trialDays > 0 ) ?? null;
}

/**
 * Function resolveTrialEndsAt() :: When a free trial starting at this moment would run out.
 *
 * Null where no tier offers one, so the caller writes nothing rather than a trial of nothing.
 */
export function resolveTrialEndsAt( options: {
    startedAt: Date;
    tiers: readonly IBillingTier[];
} ): Date | null {
    const tier = resolveTrialTier( options.tiers );

    return tier ? new Date( options.startedAt.getTime() + tier.trialDays * DAY_MS ) : null;
}

/**
 * Function isTrialRunning() :: Whether a server's free trial is still going.
 *
 * Its end date is the whole of it. Nothing has to come and stop a trial, for the same reason nothing
 * has to come and stop a cancelled subscription: the date passes, and the answer changes on its own.
 */
export function isTrialRunning( trialEndsAt: Date | null, now: Date = new Date() ): boolean {
    return null !== trialEndsAt && trialEndsAt.getTime() > now.getTime();
}

/**
 * What a guild holds a tier by - the prices it pays for, and its free trial.
 */
interface IBillingHoldings {
    paidPriceIds: readonly string[];
    tiers: readonly IBillingTier[];

    /** When its free trial runs out, or null for a server that never had one. */
    trialEndsAt?: Date | null;

    /** The moment the question is asked at - now, unless a test says otherwise. */
    now?: Date;
}

/**
 * Function resolveHeldTiers() :: The tiers a guild holds right now.
 *
 * The ones it pays for, and the one its free trial gives while that runs - a trial holds its tier
 * exactly as paying for it would, since showing what paying gets is what a trial is for.
 *
 * A price this deployment does not know holds nothing. That is not a failure: it is what a price
 * added after this build, belonging to the other paddle account, or retired from sale, correctly
 * amounts to.
 */
function resolveHeldTiers( options: IBillingHoldings ): IBillingTier[] {
    const { paidPriceIds, tiers, trialEndsAt = null, now = new Date() } = options;

    const trialTier = isTrialRunning( trialEndsAt, now ) ? resolveTrialTier( tiers ) : null;

    return tiers.filter( ( tier ) => paidPriceIds.includes( tier.priceId ) || tier === trialTier );
}

/**
 * Function resolveMaxMasterChannels() :: How many generators a guild may have.
 *
 * The **higher** of what it was granted and what it holds, never the newer of the two. A grant is
 * something given to a server for a reason - a partner, an apology, a test - and paying should not
 * be able to take it away; equally, a server that outgrows its grant should not have to have it
 * raised again by hand.
 */
export function resolveMaxMasterChannels( options: IBillingHoldings & { granted: number } ): number {
    const entitled = resolveHeldTiers( options ).map( ( tier ) => tier.maxMasterChannels );

    return Math.max( options.granted, ...entitled );
}

/**
 * Function resolveCanBrand() :: Whether a guild may give the bot its own profile.
 *
 * By holding a tier that includes it - paying for one, or on the free trial of one. A grant raises
 * the number of generators a server may have and nothing else - it is something given for a reason,
 * and the reason was never "and change what the bot looks like". So this reads the prices being paid
 * for and the trial, never the grant, which is also why it is not a question
 * `resolveMaxMasterChannels()` can answer: a granted server and a paying one can have the same
 * number.
 */
export function resolveCanBrand( options: IBillingHoldings ): boolean {
    return resolveHeldTiers( options ).some( ( tier ) => tier.includesBranding );
}

/**
 * Function readBillingTiers() :: The tiers this deployment can actually sell.
 *
 * A tier whose id is not in the environment is dropped rather than carried with an empty id: an
 * empty id would match a subscription that names no price, and hand out the tier to everybody.
 */
export function readBillingTiers( environment: Record<string, string | undefined> ): IBillingTier[] {
    return BILLING_TIER_DEFINITIONS
        .map( ( tier ) => ( {
            name: tier.name,
            slug: tier.slug,
            priceId: environment[ tier.environmentKey ]?.trim() ?? "",
            maxMasterChannels: tier.maxMasterChannels,
            monthlyPriceUsd: tier.monthlyPriceUsd,
            includesBranding: tier.includesBranding,
            trialDays: tier.trialDays
        } ) )
        .filter( ( tier ) => tier.priceId.length > 0 );
}
