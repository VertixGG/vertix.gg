/**
 * What a server may buy, and what each purchase allows.
 *
 * Discord sells these as guild subscriptions: one SKU, one entitlement, no quantity - a guild holds
 * at most one entitlement per SKU and nothing stacks. So an allowance cannot be bought a generator
 * at a time; it is bought a tier at a time, and this is the ladder of tiers.
 *
 * The ids themselves are not here. A SKU id belongs to one discord application, and the bot runs
 * against a different application in development than in production, so the id is environment and
 * the shape is code.
 */
export interface IBillingTier {
    /** What the tier is called, for the screens and the log. */
    name: string;

    /** The discord SKU id whose entitlement grants it, as the environment supplies it. */
    skuId: string;

    /** How many generators a guild holding it may have. */
    maxMasterChannels: number;
}

/**
 * The tiers, in the order they are offered.
 *
 * Deliberately short. A ladder priced a generator at a time would need a SKU per step and a store
 * page listing all of them; these are the two steps most servers land on, and a server that needs
 * more than the top one is a conversation rather than a checkout - the manual grant answers it.
 */
export const BILLING_TIER_DEFINITIONS = [
    { name: "Plus", environmentKey: "DISCORD_SKU_PLUS", maxMasterChannels: 5 },
    { name: "Pro", environmentKey: "DISCORD_SKU_PRO", maxMasterChannels: 15 }
] as const;

/**
 * Function resolveMaxMasterChannels() :: How many generators a guild may have.
 *
 * The **higher** of what it was granted and what it pays for, never the newer of the two. A grant is
 * something given to a server for a reason - a partner, an apology, a test - and paying should not
 * be able to take it away; equally, a server that outgrows its grant should not have to have it
 * raised again by hand.
 *
 * An entitlement naming a SKU this deployment does not know is worth nothing here. That is not a
 * failure: it is what a SKU published after this build, or belonging to another application,
 * correctly amounts to.
 */
export function resolveMaxMasterChannels( options: {
    granted: number;
    entitledSkuIds: readonly string[];
    tiers: readonly IBillingTier[];
} ): number {
    const { granted, entitledSkuIds, tiers } = options;

    const entitled = tiers
        .filter( ( tier ) => entitledSkuIds.includes( tier.skuId ) )
        .map( ( tier ) => tier.maxMasterChannels );

    return Math.max( granted, ...entitled );
}

/**
 * Function readBillingTiers() :: The tiers this deployment can actually sell.
 *
 * A tier whose id is not in the environment is dropped rather than carried with an empty id: an
 * empty id would match an entitlement that names no SKU, and hand out the tier to everybody.
 */
export function readBillingTiers( environment: Record<string, string | undefined> ): IBillingTier[] {
    return BILLING_TIER_DEFINITIONS
        .map( ( tier ) => ( {
            name: tier.name,
            skuId: environment[ tier.environmentKey ]?.trim() ?? "",
            maxMasterChannels: tier.maxMasterChannels
        } ) )
        .filter( ( tier ) => tier.skuId.length > 0 );
}
