import { useCallback, useEffect, useRef, useState } from "react";

import { isCheckoutAvailable, openCheckout } from "@vertix.gg/website/src/vertix/lib/paddle";

const API_BASE_URL = ( import.meta.env.API_PUBLIC_URL as string | undefined ) ?? "";
const DASHBOARD_URL = ( import.meta.env.VITE_DASHBOARD_URL as string | undefined ) ?? "";

/** Long enough for paddle's webhook to have reached the api and written the row. */
const RETURN_AFTER_PAYMENT_MS = 2500;

interface ICheckoutIntent {
    guildId: string;
    priceId: string;
    slug: string;
}

type TState =
    | { kind: "opening" }
    | { kind: "paid" }
    | { kind: "closed" }
    | { kind: "failed"; reason: string };

function billingPageUrl(): string {
    return `${ DASHBOARD_URL }/billing`;
}

/**
 * Where a plan is actually paid for.
 *
 * Paddle approves the domains a checkout may be launched from, and it approved this site rather
 * than the dashboard's subdomain - so the overlay opens here even though the plan was chosen
 * there. Nothing is decided on this page: it arrives holding a token the api signed, exchanges it
 * for the server and price that token stands for, opens the overlay and sends the person back.
 *
 * The guild is never read from the address bar. A token that has expired or been edited buys
 * nothing, and the only thing to do about any of those is choose the plan again, which is what the
 * one failure state offers.
 */
export default function Checkout() {
    const [ state, setState ] = useState<TState>( { kind: "opening" } );

    // Paddle's overlay is opened once. A re-render re-opening it over itself is worse than not
    // rendering, and strict mode runs this twice in development.
    const hasOpened = useRef( false );

    const begin = useCallback( async() => {
        const token = new URLSearchParams( window.location.search ).get( "token" );

        if ( ! token ) {
            setState( { kind: "failed", reason: "This link is missing its checkout token." } );
            return;
        }

        if ( ! isCheckoutAvailable() ) {
            setState( { kind: "failed", reason: "Checkout is not configured on this site yet." } );
            return;
        }

        let intent: ICheckoutIntent;

        try {
            const response = await fetch(
                `${ API_BASE_URL }/checkout-intent?token=${ encodeURIComponent( token ) }`
            );

            if ( ! response.ok ) {
                setState( {
                    kind: "failed",
                    reason: "This checkout link has expired. Please choose the plan again."
                } );

                return;
            }

            intent = await response.json() as ICheckoutIntent;
        } catch {
            setState( { kind: "failed", reason: "Could not reach the server. Please try again." } );
            return;
        }

        try {
            await openCheckout( {
                priceId: intent.priceId,
                guildId: intent.guildId,
                onCompleted: () => {
                    setState( { kind: "paid" } );

                    // The plan is written by a webhook that arrives a moment after paddle says the
                    // payment is done, so the dashboard is given that moment before it is asked
                    // what the server is on.
                    window.setTimeout( () => window.location.assign( billingPageUrl() ), RETURN_AFTER_PAYMENT_MS );
                },
                onClosed: () => setState( ( current ) =>
                    "paid" === current.kind ? current : { kind: "closed" }
                )
            } );
        } catch {
            setState( { kind: "failed", reason: "Could not open the checkout. Please try again." } );
        }
    }, [] );

    useEffect( () => {
        if ( hasOpened.current ) {
            return;
        }

        hasOpened.current = true;

        void begin();
    }, [ begin ] );

    return (
        <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
            <h1 className="text-2xl font-semibold">
                { "paid" === state.kind && "Thank you" }
                { "closed" === state.kind && "Checkout closed" }
                { ( "opening" === state.kind || "failed" === state.kind ) && "Opening checkout" }
            </h1>

            { "opening" === state.kind && (
                <p className="text-muted-foreground">
                    Paddle is our reseller and handles the payment. The window should appear in a moment.
                </p>
            ) }

            { "paid" === state.kind && (
                <p className="text-muted-foreground">
                    Your plan is being applied. Taking you back to the dashboard.
                </p>
            ) }

            { "closed" === state.kind && (
                <>
                    <p className="text-muted-foreground">
                        Nothing was charged. You can pick a plan again whenever you like.
                    </p>

                    <a
                        className="text-primary underline underline-offset-4"
                        href={ billingPageUrl() }
                    >
                        Back to plans
                    </a>
                </>
            ) }

            { "failed" === state.kind && (
                <>
                    <p className="text-muted-foreground">{ state.reason }</p>

                    <a
                        className="text-primary underline underline-offset-4"
                        href={ billingPageUrl() }
                    >
                        Back to plans
                    </a>
                </>
            ) }
        </main>
    );
}
