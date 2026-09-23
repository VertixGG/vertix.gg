import { readBillingTiers } from "@vertix.gg/definitions/src/billing-definitions";

import type { IBillingTier } from "@vertix.gg/definitions/src/billing-definitions";

/**
 * What this deployment can sell, if anything.
 *
 * The same table the bot resolves an allowance from, read through the same function - so a tier the
 * bot will not honour cannot be offered here. Vite hands the values in at build time; a tier whose
 * price id is not among them is dropped, exactly as it is on the bot.
 */
export function getPurchasableTiers(): IBillingTier[] {
    return readBillingTiers( {
        PADDLE_PRICE_PLUS: import.meta.env.PADDLE_PRICE_PLUS,
        PADDLE_PRICE_PRO: import.meta.env.PADDLE_PRICE_PRO,
        PADDLE_PRICE_ULTIMATE: import.meta.env.PADDLE_PRICE_ULTIMATE
    } );
}

/** The token paddle's own script authenticates with - public by design, unlike the api key. */
function getClientToken(): string {
    return ( import.meta.env.PADDLE_CLIENT_TOKEN as string | undefined )?.trim() ?? "";
}

/**
 * Function isCheckoutAvailable() :: Whether anything can actually be bought here.
 *
 * Both halves are needed and neither is assumed: a price with no token cannot be opened, and a
 * token with no prices has nothing to open. Said once so every caller agrees about it.
 *
 * Paddle's script is not loaded here and no overlay is opened here. Paddle approves the domains a
 * checkout may be launched from and refused this subdomain, so the overlay opens on the marketing
 * site instead - see `startCheckout` and the site's `/checkout`. The token is still read, because
 * a deployment without one cannot sell from either place and this screen should say so rather than
 * offer a button that leads nowhere.
 */
export function isCheckoutAvailable(): boolean {
    return getClientToken().length > 0 && getPurchasableTiers().length > 0;
}
