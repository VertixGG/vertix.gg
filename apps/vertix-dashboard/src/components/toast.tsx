import { useEffect } from "react";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";

/**
 * How long a toast stands before it goes on its own.
 *
 * Long enough for a sentence somebody was not expecting to read - a refusal arrives while they are
 * looking at whatever they pressed, not at the corner it lands in.
 */
const TOAST_DURATION_MS = 8000;

export type ToastVariant = "error" | "success";

export interface ToastProps {
    message: string;
    variant?: ToastVariant;
    onDismiss: () => void;
    /** Milliseconds before it dismisses itself. Zero keeps it up until somebody closes it. */
    duration?: number;
}

const TOAST_VARIANTS = {
    error: {
        icon: AlertTriangle,
        className: "bg-error/10 border-error/40 text-error"
    },
    success: {
        icon: CheckCircle2,
        className: "bg-success/10 border-success/40 text-success"
    }
} as const;

/**
 * Function Toast() :: A sentence that arrives over the page rather than inside it.
 *
 * Sits over the corner instead of in the layout, because what it has to say usually belongs to
 * something the reader is still looking at - a form that refused, a save that did not take. Pushed
 * into the page it would move the thing it is about, and behind a modal it would not be read at all.
 *
 * It dismisses itself, and the timer is keyed on the message: the same words arriving again are a
 * second failure and get their own full time rather than the remainder of the first one's.
 */
export function Toast( { message, variant = "error", onDismiss, duration = TOAST_DURATION_MS }: ToastProps ) {
    useEffect( () => {
        if ( ! duration ) {
            return;
        }

        const timer = setTimeout( onDismiss, duration );

        return () => clearTimeout( timer );
    }, [ message, duration, onDismiss ] );

    const { icon: Icon, className } = TOAST_VARIANTS[ variant ];

    return (
        <div
            role="status"
            aria-live="polite"
            className={ `fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-3 rounded-lg border
                px-4 py-3 shadow-lg backdrop-blur-sm ${ className }` }
        >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1 text-sm">{ message }</span>
            <button
                onClick={ onDismiss }
                title="Dismiss"
                className="transition-colors hover:text-text-primary"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export default Toast;
