/**
 * What a server may buy, and what each purchase allows.
 *
 * Sold through paddle, which is a merchant of record - it sells to the customer, collects the sales
 * tax and pays us. That is what makes selling from here possible at all: discord's own subscriptions
 * are sold from the US, the EU and the UK only.
 *
 * An allowance is bought a tier at a time rather than a generator at a time, which was discord's
 * constraint rather than paddle's - it is kept because the ladder a per-generator price would need
 * is a worse thing to put in front of somebody than three plans.
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
 * Deliberately short. A ladder priced a generator at a time would need a SKU per step and a store
 * page listing all of them; these are three steps, and the top one has no ceiling so there is
 * nothing above it to sell.
 *
 * The numbers are **totals, not extras** - a tier says how many generators a server may have
 * altogether, free ones included. Two on top of the free two is four, which is what `Plus` is.
 *
 * The price is quoted from here and charged by paddle, which are two different places. Nothing reads
 * paddle's own number back - a price is set in its dashboard and the webhook carries only the id -
 * so a tier repriced there has to be repriced here too, or the site quotes one figure while the
 * checkout charges another.
 */
export const BILLING_TIER_DEFINITIONS = [
    { name: "Plus", slug: "plus", environmentKey: "PADDLE_PRICE_PLUS", maxMasterChannels: 4, monthlyPriceUsd: 2 },
    { name: "Pro", slug: "pro", environmentKey: "PADDLE_PRICE_PRO", maxMasterChannels: 9, monthlyPriceUsd: 4 },
    {
        name: "Ultimate",
        slug: "ultimate",
        environmentKey: "PADDLE_PRICE_ULTIMATE",
        maxMasterChannels: BILLING_UNLIMITED_MASTER_CHANNELS,
        monthlyPriceUsd: 10
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

/**
 * Function resolveMaxMasterChannels() :: How many generators a guild may have.
 *
 * The **higher** of what it was granted and what it pays for, never the newer of the two. A grant is
 * something given to a server for a reason - a partner, an apology, a test - and paying should not
 * be able to take it away; equally, a server that outgrows its grant should not have to have it
 * raised again by hand.
 *
 * A subscription on a price this deployment does not know is worth nothing here. That is not a
 * failure: it is what a price added after this build, or belonging to the other paddle account,
 * correctly amounts to.
 */
export function resolveMaxMasterChannels( options: {
    granted: number;
    paidPriceIds: readonly string[];
    tiers: readonly IBillingTier[];
} ): number {
    const { granted, paidPriceIds, tiers } = options;

    const entitled = tiers
        .filter( ( tier ) => paidPriceIds.includes( tier.priceId ) )
        .map( ( tier ) => tier.maxMasterChannels );

    return Math.max( granted, ...entitled );
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
            monthlyPriceUsd: tier.monthlyPriceUsd
        } ) )
        .filter( ( tier ) => tier.priceId.length > 0 );
}
