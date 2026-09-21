import process from "process";

/**
 * Where paddle's own api lives. Two of them, and the wrong one answers about nothing.
 */
const PADDLE_API_BASE = {
    sandbox: "https://sandbox-api.paddle.com",
    production: "https://api.paddle.com"
} as const;

export interface IManagementUrls {
    updatePaymentMethodUrl: string | null;
    cancelUrl: string | null;
}

const NO_MANAGEMENT_URLS: IManagementUrls = { updatePaymentMethodUrl: null, cancelUrl: null };

/**
 * Function fetchManagementUrls() :: Paddle's hosted pages for one subscription.
 *
 * Asked of paddle every time rather than kept in the row, because paddle says so: the links carry
 * temporary authentication tokens and are not to be stored. A stored one is a link that stops
 * working at a moment nobody chose, on the screen somebody is using to stop paying.
 *
 * They are also **not in the webhook payload** - that was worth finding out the hard way. A
 * subscription event carries `custom_data`, `current_billing_period` and `scheduled_change` and no
 * management urls at all, so there is nothing to read off an event even if storing were allowed.
 *
 * Needs an api key holding `subscription.read` and customer portal session (write) - the second is
 * what makes the links authenticated rather than a bare portal address. With no key configured this
 * answers nulls, and the screen simply does not offer the buttons.
 */
export async function fetchManagementUrls( subscriptionId: string ): Promise<IManagementUrls> {
    const apiKey = process.env.PADDLE_API_KEY?.trim() ?? "";

    if ( ! apiKey.length ) {
        return NO_MANAGEMENT_URLS;
    }

    // Sandbox unless something says otherwise, matching the dashboard - so a half-configured
    // deployment asks the environment that cannot charge anybody.
    const base = "production" === process.env.PADDLE_ENVIRONMENT?.trim()
        ? PADDLE_API_BASE.production
        : PADDLE_API_BASE.sandbox;

    const response = await fetch( `${ base }/subscriptions/${ subscriptionId }`, {
        headers: { Authorization: `Bearer ${ apiKey }` }
    } );

    if ( ! response.ok ) {
        throw new Error( `Paddle answered ${ response.status } for subscription '${ subscriptionId }'` );
    }

    const body = await response.json() as {
        data?: { management_urls?: { update_payment_method?: string; cancel?: string } | null };
    };

    return {
        updatePaymentMethodUrl: body.data?.management_urls?.update_payment_method ?? null,
        cancelUrl: body.data?.management_urls?.cancel ?? null
    };
}
