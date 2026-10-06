import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

import type { TBillingTrialStartRefusal } from "@vertix.gg/definitions/src/billing-definitions";

/**
 * What a server is paying for, as the api tells it.
 *
 * `allowance` arrives already spelled - `Unlimited` rather than a number - because Pro's allowance
 * is `Infinity` and that does not survive json. Nothing here converts it back into a number.
 *
 * `planName` and `allowance` are null when the subscription names a price this deployment does not
 * know. That is not a fault: it is what a price belonging to the other paddle account, added after
 * this build, or retired from sale, correctly amounts to - and the screen still has a status to show.
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
 * A server's free trial of the paid plan, as the api tells it - running, or over.
 *
 * `allowance` arrives already spelled, for the same reason the subscription's does.
 */
export interface ITrial {
    planName: string;
    allowance: string;
    endsAt: string;
    isRunning: boolean;
}

/**
 * What a server pays for, and the trial it is on or has had.
 */
export interface IBilling {
    /** Null when it pays for nothing. */
    subscription: ISubscription | null;

    /** Null when it never had a trial - its owner starts one from the Subscription page. */
    trial: ITrial | null;
}

/**
 * Function fetchBilling() :: What this server pays for, and its free trial.
 *
 * Nulls for "nothing bought" and "no trial", and a thrown error for "could not find out", because a
 * screen that shows the free plan when it simply failed to ask is telling somebody who paid that
 * they did not.
 */
export async function fetchBilling( guildId: string ): Promise<IBilling> {
    const response = await fetch( `${ API_CONFIG.BASE_URL }/subscription/${ guildId }`, {
        credentials: "include"
    } );

    if ( ! response.ok ) {
        throw new Error( `Failed to fetch subscription: ${ response.status }` );
    }

    return await response.json() as IBilling;
}

/**
 * What pressing "Start free trial" came to - the trial it started, or why the api refused it.
 */
export type TStartTrialResult =
    | { trial: ITrial; refusal: null }
    | { trial: null; refusal: TBillingTrialStartRefusal };

/**
 * Function startTrial() :: Start this server's free trial, for its owner.
 *
 * A refusal is an answer rather than a failure - the server had its trial, pays already, or does
 * not have the bot - so it comes back as one, and only "could not ask" is thrown.
 */
export async function startTrial( guildId: string ): Promise<TStartTrialResult> {
    const response = await fetch( `${ API_CONFIG.BASE_URL }/subscription/${ guildId }/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify( {} )
    } );

    if ( 409 === response.status ) {
        const body = await response.json() as { error: TBillingTrialStartRefusal };

        return { trial: null, refusal: body.error };
    }

    if ( ! response.ok ) {
        throw new Error( `Failed to start the trial: ${ response.status }` );
    }

    const body = await response.json() as { trial: ITrial };

    return { trial: body.trial, refusal: null };
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
