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
