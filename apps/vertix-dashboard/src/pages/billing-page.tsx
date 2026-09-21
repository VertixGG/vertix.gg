import { useCallback, useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { useCommandState } from "@zenflux/react-commander/hooks";

import { AlertTriangle, Check, CreditCard, Loader2, XCircle } from "lucide-react";

import {
    BILLING_FREE_MAX_MASTER_CHANNELS,
    BILLING_TIER_DEFINITIONS,
    formatMasterChannelAllowance
} from "@vertix.gg/definitions/src/billing-definitions";

import { fetchSubscription } from "@vertix.gg/dashboard/src/features/billing/api";

import { getPurchasableTiers, isCheckoutAvailable, openPlanCheckout } from "@vertix.gg/dashboard/src/lib/paddle";

import type { ISubscription } from "@vertix.gg/dashboard/src/features/billing/api";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";

/**
 * Function formatDate() :: A date as somebody reads it, from the iso string the api sends.
 */
function formatDate( iso: string ): string {
    return new Date( iso ).toLocaleDateString( undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    } );
}

/**
 * The panel above the plans, for a server that already pays.
 *
 * Separate from the plan cards because it answers a different question. The cards say what can be
 * bought; this says what *is* bought, and it is the only thing on the page that can send somebody
 * to change a card or stop paying.
 */
function CurrentPlan( props: { subscription: ISubscription } ) {
    const { subscription } = props;

    const isCancelling = null !== subscription.scheduledToCancelAt;

    return (
        <div className="mx-6 mt-4 p-5 rounded-lg border border-accent bg-surface">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="text-sm text-text-muted mb-1">Current plan</div>

                    <h2 className="text-xl font-semibold text-text-primary mb-1">
                        { subscription.planName ?? "Unrecognised plan" }
                        { subscription.allowance && (
                            <span className="text-sm font-normal text-text-muted">
                                { " " }&middot; { subscription.allowance } generators
                            </span>
                        ) }
                    </h2>

                    { isCancelling && subscription.scheduledToCancelAt ? (
                        <p className="text-sm text-warning mb-0">
                            Cancelled &mdash; runs until { formatDate( subscription.scheduledToCancelAt ) },
                            then this server goes back
                            to { formatMasterChannelAllowance( BILLING_FREE_MAX_MASTER_CHANNELS ) } generators.
                        </p>
                    ) : subscription.currentPeriodEnd ? (
                        <p className="text-sm text-text-muted mb-0">
                            Renews on { formatDate( subscription.currentPeriodEnd ) }.
                        </p>
                    ) : (
                        <p className="text-sm text-text-muted mb-0">Status: { subscription.status }.</p>
                    ) }

                    { ! subscription.isEntitling && (
                        <p className="text-sm text-error mb-0 mt-1">
                            This plan is not active, so the free allowance applies.
                        </p>
                    ) }
                </div>

                { /* Paddle's own pages. Nothing here can cancel a subscription itself - the link is
                     the whole of it, which is why the api hands it only to the server's owner. */ }
                <div className="flex gap-2 flex-wrap">
                    { subscription.updatePaymentMethodUrl && (
                        <a href={ subscription.updatePaymentMethodUrl }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                border border-border text-text-primary hover:bg-surface-hover transition-colors">
                            <CreditCard className="w-4 h-4" />
                            Update payment method
                        </a>
                    ) }

                    { subscription.cancelUrl && ! isCancelling && (
                        <a href={ subscription.cancelUrl }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                border border-error/40 text-error hover:bg-error/10 transition-colors">
                            <XCircle className="w-4 h-4" />
                            Cancel plan
                        </a>
                    ) }
                </div>
            </div>
        </div>
    );
}

/**
 * Where a plan is bought, for the server that is open.
 *
 * The site sends people here with the plan they pressed in the address - `?plan=pro` - because the
 * site knows which plan somebody wanted and this knows which server they have. Neither knows both,
 * which is the whole reason the checkout starts here rather than there.
 */
export function BillingPage() {
    const [ searchParams ] = useSearchParams();

    const [ authState ] = useCommandState<AuthState, { selectedGuild: AuthState[ "selectedGuild" ] }>(
        "Dashboard/Auth",
        ( state ) => ( { selectedGuild: state.selectedGuild } )
    );

    const [ opening, setOpening ] = useState<string | null>( null );
    const [ error, setError ] = useState<string | null>( null );
    const [ subscription, setSubscription ] = useState<ISubscription | null>( null );
    const [ loadFailed, setLoadFailed ] = useState( false );

    const guild = authState.selectedGuild;

    const guildId = guild?.id ?? null;

    const requestedSlug = searchParams.get( "plan" );

    const load = useCallback( async() => {
        if ( ! guildId ) {
            return;
        }

        try {
            setSubscription( await fetchSubscription( guildId ) );
            setLoadFailed( false );
        } catch {
            // Told apart from "pays for nothing" on purpose: showing the free plan to somebody who
            // is paying, because the request failed, is the one mistake worth a message here.
            setLoadFailed( true );
        }
    }, [ guildId ] );

    useEffect( () => {
        void load();
    }, [ load ] );

    // What can be sold, against what is worth showing. A tier with no price id configured cannot be
    // bought, but it is still one of the plans - so the table is drawn from the definitions and only
    // the button knows the difference.
    const purchasable = new Map( getPurchasableTiers().map( ( tier ) => [ tier.slug, tier.priceId ] ) );

    const canBuy = isCheckoutAvailable();

    if ( ! guild ) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted">
                No server selected
            </div>
        );
    }

    const buy = async( slug: string ) => {
        const priceId = purchasable.get( slug );

        if ( ! priceId ) {
            return;
        }

        setError( null );
        setOpening( slug );

        try {
            await openPlanCheckout( { priceId, guildId: guild.id } );
        } catch {
            setError( "Could not open the checkout. Please try again in a moment." );
        } finally {
            setOpening( null );
        }
    };

    const currentSlug = subscription?.isEntitling ? subscription.planSlug : null;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Plans</h1>
                <p className="text-sm text-text-muted mb-0">
                    A plan sets how many generators <strong>{ guild.name }</strong> may run at once.
                    Every feature is in every plan.
                </p>
            </div>

            { error && (
                <div className="mx-6 mt-4 flex items-center gap-2 px-3 py-2 bg-error/10 border border-error/40
                    rounded-lg text-sm text-error">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{ error }</span>
                </div>
            ) }

            { loadFailed && (
                <div className="mx-6 mt-4 flex items-center gap-2 px-3 py-2 bg-warning/10 border border-warning/40
                    rounded-lg text-sm text-text-muted">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Could not check what this server is on. Anything it pays for is unaffected.</span>
                </div>
            ) }

            { subscription && <CurrentPlan subscription={ subscription } /> }

            { ! canBuy && (
                <div className="mx-6 mt-4 px-3 py-2 bg-warning/10 border border-warning/40 rounded-lg
                    text-sm text-text-muted">
                    Plans are not on sale yet. Your server keeps
                    its { BILLING_FREE_MAX_MASTER_CHANNELS } free generators in the meantime.
                </div>
            ) }

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
                    { BILLING_TIER_DEFINITIONS.map( ( tier ) => {
                        const isRequested = requestedSlug === tier.slug;
                        const isCurrent = currentSlug === tier.slug;
                        const isBuyable = canBuy && purchasable.has( tier.slug ) && ! isCurrent;

                        return (
                            <div key={ tier.slug }
                                className={ `flex flex-col p-5 rounded-lg border bg-surface ${
                                    isCurrent || isRequested ? "border-accent" : "border-border"
                                }` }>

                                <h2 className="text-lg font-semibold text-text-primary mb-1">{ tier.name }</h2>

                                <div className="text-2xl font-bold text-text-primary mb-4">
                                    ${ tier.monthlyPriceUsd }
                                    <span className="text-sm font-normal text-text-muted"> / month</span>
                                </div>

                                <div className="text-text-primary">
                                    { formatMasterChannelAllowance( tier.maxMasterChannels ) } generators
                                </div>
                                <div className="text-sm text-text-muted mb-5">
                                    join-to-create setups and auto-scaling pools together
                                </div>

                                <button
                                    type="button"
                                    disabled={ ! isBuyable || null !== opening }
                                    onClick={ () => buy( tier.slug ) }
                                    className="mt-auto w-full px-4 py-2 rounded-lg text-sm font-medium
                                        bg-accent text-white disabled:opacity-40 disabled:cursor-not-allowed
                                        hover:opacity-90 transition-opacity">
                                    { opening === tier.slug
                                        ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                        : isCurrent ? "Current plan" : `Choose ${ tier.name }` }
                                </button>
                            </div>
                        );
                    } ) }
                </div>

                <p className="text-sm text-text-muted mt-6 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    Nothing is ever deleted. Going over a plan pauses the newest generators; the ones
                    set up first keep working, and paying starts the rest again.
                </p>
            </div>
        </div>
    );
}

export default BillingPage;
