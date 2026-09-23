import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

/**
 * What a server is paying for, as the api tells it.
 *
 * `allowance` arrives already spelled - `9`, or `Unlimited` - because the top tier's allowance is
 * `Infinity` and that does not survive json. Nothing here converts it back into a number.
 *
 * `planName` and `allowance` are null when the subscription names a price this deployment does not
 * know. That is not a fault: it is what a price belonging to the other paddle account, or added
 * after this build, correctly amounts to - and the screen still has a status to show.
 */
export interface ISubscription {
    planName: string | null;
    planSlug: string | null;
    allowance: string | null;
    status: string;
    isEntitling: boolean;
    currentPeriodEnd: string | null;
    scheduledToCancelAt: string | null;
    updatePaymentMethodUrl: string | null;
    cancelUrl: string | null;
}

/**
 * Function fetchSubscription() :: What this server pays for, or null if it pays for nothing.
 *
 * Null for "nothing bought" and a thrown error for "could not find out", because a screen that
 * shows the free plan when it simply failed to ask is telling somebody who paid that they did not.
 */
export async function fetchSubscription( guildId: string ): Promise<ISubscription | null> {
    const response = await fetch( `${ API_CONFIG.BASE_URL }/subscription/${ guildId }`, {
        credentials: "include"
    } );

    if ( ! response.ok ) {
        throw new Error( `Failed to fetch subscription: ${ response.status }` );
    }

    const body = await response.json() as { subscription: ISubscription | null };

    return body.subscription;
}

/**
 * Function startCheckout() :: Where to send somebody to pay for this server.
 *
 * The checkout itself opens on the marketing site, because that is the domain paddle approved to
 * launch one from - this dashboard's subdomain was refused. The api signs a short-lived token
 * saying which server the signed-in owner picked, and the address it answers with carries that
 * token rather than the guild: the site is not trusted to name a server, and a typed url buys
 * nothing.
 */
export async function startCheckout( guildId: string, slug: string ): Promise<string> {
    const response = await fetch( `${ API_CONFIG.BASE_URL }/checkout-intent/${ guildId }`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify( { slug } )
    } );

    if ( ! response.ok ) {
        throw new Error( `Failed to start the checkout: ${ response.status }` );
    }

    const body = await response.json() as { checkoutUrl: string };

    return body.checkoutUrl;
}
