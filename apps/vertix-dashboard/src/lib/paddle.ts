import { readBillingTiers } from "@vertix.gg/definitions/src/billing-definitions";

import type { IBillingTier } from "@vertix.gg/definitions/src/billing-definitions";

/**
 * Paddle's own script, loaded from their cdn.
 *
 * Their checkout is an overlay they draw themselves, which is the point of a merchant of record -
 * the card never touches this page and nothing here has to be PCI anything.
 */
const PADDLE_SCRIPT_URL = "https://cdn.paddle.com/paddle/v2/paddle.js";

interface IPaddleCheckoutItem {
    priceId: string;
    quantity: number;
}

interface IPaddle {
    Environment: { set: ( environment: string ) => void };
    Initialize: ( options: { token: string } ) => void;
    Checkout: {
        open: ( options: {
            items: IPaddleCheckoutItem[];
            customData?: Record<string, string>;
        } ) => void;
    };
}

declare global {
    interface Window {
        Paddle?: IPaddle;
    }
}

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

/** Sandbox until something says otherwise, so a misconfigured deployment cannot take real money. */
function getEnvironment(): string {
    return ( import.meta.env.PADDLE_ENVIRONMENT as string | undefined )?.trim() || "sandbox";
}

/**
 * Function isCheckoutAvailable() :: Whether anything can actually be bought here.
 *
 * Both halves are needed and neither is assumed: a price with no token cannot be opened, and a token
 * with no prices has nothing to open. Said once so every caller agrees about it.
 */
export function isCheckoutAvailable(): boolean {
    return getClientToken().length > 0 && getPurchasableTiers().length > 0;
}

let loading: Promise<IPaddle> | null = null;

/**
 * Function loadPaddle() :: Paddle's script, loaded once.
 *
 * Kept as the promise rather than a flag, so two buttons pressed quickly wait on the same load
 * instead of racing to add two script tags.
 */
function loadPaddle(): Promise<IPaddle> {
    if ( loading ) {
        return loading;
    }

    loading = new Promise<IPaddle>( ( resolve, reject ) => {
        if ( window.Paddle ) {
            resolve( window.Paddle );
            return;
        }

        const script = document.createElement( "script" );

        script.src = PADDLE_SCRIPT_URL;
        script.async = true;

        script.onload = () => {
            if ( ! window.Paddle ) {
                reject( new Error( "Paddle loaded without defining itself" ) );
                return;
            }

            window.Paddle.Environment.set( getEnvironment() );
            window.Paddle.Initialize( { token: getClientToken() } );

            resolve( window.Paddle );
        };

        script.onerror = () => reject( new Error( "Could not load paddle" ) );

        document.head.appendChild( script );
    } );

    return loading;
}

/**
 * Function openPlanCheckout() :: Opens paddle's overlay for one plan, on one server.
 *
 * The guild rides along in `custom_data`, which paddle copies onto the subscription and sends back
 * on every webhook - that is the whole of how a payment finds the server it was for, so it is not
 * optional and there is no second way to supply it afterwards.
 */
export async function openPlanCheckout( options: { priceId: string; guildId: string } ): Promise<void> {
    const paddle = await loadPaddle();

    paddle.Checkout.open( {
        items: [ { priceId: options.priceId, quantity: 1 } ],
        customData: { guildId: options.guildId }
    } );
}
