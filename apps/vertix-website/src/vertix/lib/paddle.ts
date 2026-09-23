const PADDLE_SCRIPT_URL = "https://cdn.paddle.com/paddle/v2/paddle.js";

interface IPaddle {
    Environment: { set: ( environment: string ) => void };
    Initialize: ( options: {
        token: string;
        eventCallback?: ( event: { name: string } ) => void;
    } ) => void;
    Checkout: {
        open: ( options: {
            items: { priceId: string; quantity: number }[];
            customData?: Record<string, string>;
        } ) => void;
    };
}

declare global {
    interface Window {
        Paddle?: IPaddle;
    }
}

/** The token paddle's own script authenticates with - public by design, unlike the api key. */
function getClientToken(): string {
    return ( import.meta.env.PADDLE_CLIENT_TOKEN as string | undefined )?.trim() ?? "";
}

/** Sandbox until something says otherwise, so a misconfigured deployment cannot take real money. */
function getEnvironment(): string {
    return ( import.meta.env.PADDLE_ENVIRONMENT as string | undefined )?.trim() || "sandbox";
}

export function isCheckoutAvailable(): boolean {
    return getClientToken().length > 0;
}

let loading: Promise<IPaddle> | null = null;

/**
 * Function loadPaddle() :: Paddle's script, loaded once.
 *
 * Kept as the promise rather than a flag, so two presses in quick succession wait on the same load
 * instead of racing to add two script tags.
 */
function loadPaddle( onEvent: ( name: string ) => void ): Promise<IPaddle> {
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

            window.Paddle.Initialize( {
                token: getClientToken(),
                eventCallback: ( event ) => onEvent( event.name )
            } );

            resolve( window.Paddle );
        };

        script.onerror = () => reject( new Error( "Could not load paddle" ) );

        document.head.appendChild( script );
    } );

    return loading;
}

/**
 * Function openCheckout() :: Opens paddle's overlay for one price, on one server.
 *
 * The guild rides along in `custom_data`, which paddle copies onto the subscription and sends back
 * on every webhook - that is the whole of how a payment finds the server it was for. It is taken
 * from a signed intent rather than from the address bar, so what is claimed here is what the api
 * said was true of whoever was signed in.
 */
export async function openCheckout( options: {
    priceId: string;
    guildId: string;
    onCompleted: () => void;
    onClosed: () => void;
} ): Promise<void> {
    /*
     * `checkout.closed` matters here in a way it did not when the overlay opened over a page
     * somebody was already using. This page is nothing but the overlay - close it without paying
     * and what is left says "opening checkout" forever, with no way back.
     */
    const paddle = await loadPaddle( ( name ) => {
        if ( "checkout.completed" === name ) {
            options.onCompleted();
        }

        if ( "checkout.closed" === name ) {
            options.onClosed();
        }
    } );

    paddle.Checkout.open( {
        items: [ { priceId: options.priceId, quantity: 1 } ],
        customData: { guildId: options.guildId }
    } );
}
