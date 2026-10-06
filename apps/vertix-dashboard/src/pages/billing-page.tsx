import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { useCommandState } from "@zenflux/react-commander/hooks";

import { AlertTriangle, Check, CreditCard, Loader2, XCircle } from "lucide-react";

import {
    BILLING_FREE_MAX_MASTER_CHANNELS,
    BILLING_TIER_DEFINITIONS,
    formatMasterChannelAllowance
} from "@vertix.gg/definitions/src/billing-definitions";

import { fetchBilling, startCheckout } from "@vertix.gg/dashboard/src/features/billing/api";

import {
    getPurchasableTiers,
    isCheckoutAvailable
} from "@vertix.gg/dashboard/src/lib/paddle";

import type { ISubscription, ITrial } from "@vertix.gg/dashboard/src/features/billing/api";
import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";

/**
 * The tier everybody starts on, drawn beside the one that costs money.
 *
 * Shown so that a server paying for nothing still has a card that is *theirs* rather than one offer
 * and no sense of where it currently stands.
 */
const FREE_TIER = {
    name: "Free",
    slug: null,
    monthlyPriceUsd: 0,
    maxMasterChannels: BILLING_FREE_MAX_MASTER_CHANNELS,
    includesBranding: false
};

/**
 * The tier that includes the bot's own profile, found by what it includes rather than by its name.
 */
const BRANDING_TIER = BILLING_TIER_DEFINITIONS.find( ( tier ) => tier.includesBranding );

function formatDate( iso: string ): string {
    return new Date( iso ).toLocaleDateString( undefined, { year: "numeric", month: "long", day: "numeric" } );
}

interface ITierFeature {
    label: string;
    /** Whether the line is one the plans differ on - drawn brighter, since it is what is being bought. */
    isOwn: boolean;
}

/**
 * What a tier gets you, in the order somebody reads it.
 *
 * The lines a plan is bought for come first and stand out: the generator count, and the bot's own
 * profile where the tier includes it - along with panels the bot draws without its own links, which it
 * does wherever the tier includes branding. Everything after them is on every plan, and saying so on
 * each card is what stops somebody hunting for the catch.
 */
function tierFeatures( tier: { maxMasterChannels: number; includesBranding: boolean } ): ITierFeature[] {
    return [
        { label: `${ formatMasterChannelAllowance( tier.maxMasterChannels ) } generators`, isOwn: true },
        ... tier.includesBranding
            ? [
                { label: "Your own bot name, avatar, banner and bio in this server", isOwn: true },
                { label: "No \"Add VoiceChannels\" or \"Vote VoiceChannels\" links on your panels", isOwn: true }
            ]
            : [],
        { label: "Join-to-create setups and auto-scaling pools", isOwn: false },
        { label: "Every voice-channel control", isOwn: false },
        { label: "Cancel any time", isOwn: false }
    ];
}

/**
 * The panel above the plans, for a server that already pays.
 *
 * Separate from the plan cards because it answers a different question. The cards say what can be
 * bought; this says what *is* bought, and it is the only thing here that can send somebody to
 * change a card or stop paying.
 */
function CurrentPlan( props: { subscription: ISubscription } ) {
    const { subscription } = props;

    const isCancelling = null !== subscription.scheduledToCancelAt;

    return (
        <div className="mb-6 p-5 rounded-xl border border-border-accent bg-surface-elevated">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="text-xs uppercase tracking-wide text-text-muted mb-1">Current plan</div>

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
                            Cancelled &mdash; runs until { formatDate( subscription.scheduledToCancelAt ) }, then
                            back to { formatMasterChannelAllowance( BILLING_FREE_MAX_MASTER_CHANNELS ) } generators
                            and the bot's normal profile.
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

                { /* Paddle's own pages. Nothing here cancels anything itself - the link is the whole
                     of it, which is why the api hands it only to the server's owner. */ }
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
 * The panel above the plans, for a server on its free trial - or one whose trial is over.
 *
 * Shaped like `CurrentPlan`, because while it runs the trial *is* the current plan. What it adds is
 * the date it stops and what the server goes back to then, which is the whole of what there is to
 * decide before that date. Nothing here buys anything - the plan cards below do that.
 */
function TrialPlan( props: { trial: ITrial } ) {
    const { trial } = props;

    if ( ! trial.isRunning ) {
        return (
            <p className="mb-6 text-sm text-text-muted">
                The free { trial.planName } trial ended on { formatDate( trial.endsAt ) }.
            </p>
        );
    }

    return (
        <div className="mb-6 p-5 rounded-xl border border-border-accent bg-surface-elevated">
            <div className="text-xs uppercase tracking-wide text-text-muted mb-1">Current plan</div>

            <h2 className="text-xl font-semibold text-text-primary mb-1">
                { trial.planName } trial
                <span className="text-sm font-normal text-text-muted">
                    { " " }&middot; { trial.allowance } generators
                </span>
            </h2>

            <p className="text-sm text-text-muted mb-0">
                Free until { formatDate( trial.endsAt ) }. After that, back
                to { formatMasterChannelAllowance( BILLING_FREE_MAX_MASTER_CHANNELS ) } generators and the
                bot's normal profile, unless you choose { trial.planName } below.
            </p>
        </div>
    );
}

interface IPlanCardProps {
    name: string;
    monthlyPriceUsd: number;
    maxMasterChannels: number;
    includesBranding: boolean;
    isCurrent: boolean;
    action: React.ReactNode;
}

/**
 * One plan, as a card.
 *
 * The only badge is `Current`. Pro wore `Most popular` when it was the middle of three paid plans;
 * beside the free card that claims most servers pay, when most never leave free.
 */
function PlanCard( props: IPlanCardProps ) {
    const { name, monthlyPriceUsd, maxMasterChannels, includesBranding, isCurrent, action } = props;

    return (
        <div className={ `relative flex flex-col p-5 rounded-xl border transition-colors ${
            isCurrent
                ? "border-border-accent bg-surface-elevated"
                : "border-border bg-surface hover:border-border-accent"
        }` }>
            { isCurrent && (
                <span className="absolute -top-2.5 left-5 px-2 py-0.5 rounded-full bg-accent-muted
                    text-accent text-[11px] font-semibold tracking-wide">
                    Current
                </span>
            ) }

            <h3 className="text-base font-semibold text-text-primary mb-2">{ name }</h3>

            <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-text-primary">${ monthlyPriceUsd }</span>
                <span className="text-sm text-text-muted">/ month</span>
            </div>

            <ul className="flex flex-col gap-2 mb-6">
                { tierFeatures( { maxMasterChannels, includesBranding } ).map( ( feature ) => (
                    <li key={ feature.label } className="flex items-start gap-2 text-sm">
                        <Check className={ `w-4 h-4 shrink-0 mt-0.5 ${
                            feature.isOwn ? "text-accent" : "text-text-muted"
                        }` } />
                        <span className={ feature.isOwn ? "text-text-primary font-medium" : "text-text-muted" }>
                            { feature.label }
                        </span>
                    </li>
                ) ) }
            </ul>

            <div className="mt-auto">{ action }</div>
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
    const [ trial, setTrial ] = useState<ITrial | null>( null );
    const [ loadFailed, setLoadFailed ] = useState( false );
    const [ isLoaded, setIsLoaded ] = useState( false );

    const guild = authState.selectedGuild;
    const guildId = guild?.id ?? null;

    const requestedSlug = searchParams.get( "plan" );

    const canBuy = isCheckoutAvailable();

    // Memoised because it is read by an effect: rebuilt every render, the array is a new value each
    // time and the effect would run on every render to discover it has nothing to do.
    const purchasableSlugs = useMemo( () => getPurchasableTiers().map( ( tier ) => tier.slug ), [] );

    const load = useCallback( async() => {
        if ( ! guildId ) {
            return;
        }

        try {
            const billing = await fetchBilling( guildId );

            setSubscription( billing.subscription );
            setTrial( billing.trial );
            setLoadFailed( false );
        } catch {
            // Told apart from "pays for nothing" on purpose: showing the free plan to somebody who
            // is paying, because the request failed, is the one mistake worth a message here.
            setLoadFailed( true );
        } finally {
            setIsLoaded( true );
        }
    }, [ guildId ] );

    useEffect( () => {
        void load();
    }, [ load ] );

    const buy = useCallback( async( slug: string ) => {
        const tier = getPurchasableTiers().find( ( candidate ) => candidate.slug === slug );

        if ( ! tier || ! guildId ) {
            return;
        }

        setError( null );
        setOpening( slug );

        try {
            // Leaves this page rather than opening an overlay on it: paddle approved the marketing
            // site to launch a checkout from and refused this subdomain, so that is where the
            // overlay can legally open. The person comes back here once they have paid.
            window.location.assign( await startCheckout( guildId, tier.slug ) );
        } catch {
            setError( "Could not open the checkout. Please try again in a moment." );
            setOpening( null );
        }
    }, [ guildId ] );

    const currentSlug = subscription?.isEntitling ? subscription.planSlug : null;

    // Paying answers before the trial does: a server that bought the plan during its trial is on
    // the plan, and the trial has nothing left to say to it.
    const isPaying = true === subscription?.isEntitling;

    const isOnTrial = ! isPaying && true === trial?.isRunning;

    /**
     * Arriving from the site with a plan already chosen opens that checkout.
     *
     * Somebody who pressed `Get Pro` on the pricing page has already decided; making them press it
     * again here is a second decision nobody asked for. It waits for the subscription to load so
     * that a server already on that plan is not shown a checkout for what it has, and it runs once
     * - a ref rather than state, because re-opening the overlay on a re-render would be worse than
     * not opening it at all.
     */
    const hasAutoOpened = useRef( false );

    useEffect( () => {
        if ( hasAutoOpened.current || ! isLoaded || ! requestedSlug || ! canBuy || ! guildId ) {
            return;
        }

        hasAutoOpened.current = true;

        if ( requestedSlug === currentSlug || ! purchasableSlugs.includes( requestedSlug ) ) {
            return;
        }

        void buy( requestedSlug );
    }, [ isLoaded, requestedSlug, canBuy, guildId, currentSlug, purchasableSlugs, buy ] );

    if ( ! guild ) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted">
                No server selected
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
                <h1 className="text-2xl font-bold text-text-primary mb-1">Subscription</h1>
                <p className="text-sm text-text-muted mb-0">
                    A plan sets how many generators <strong>{ guild.name }</strong> may run at once
                    { BRANDING_TIER
                        ? `, and ${ BRANDING_TIER.name } also lets you give the bot its own name, avatar, banner and bio there`
                        : "" }. Every voice-channel control is free on every plan.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl">
                    { error && (
                        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-error/10 border border-error/40
                            rounded-lg text-sm text-error">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{ error }</span>
                        </div>
                    ) }

                    { loadFailed && (
                        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-warning/10 border
                            border-warning/40 rounded-lg text-sm text-text-muted">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Could not check what this server is on. Anything it pays for is unaffected.</span>
                        </div>
                    ) }

                    { subscription && <CurrentPlan subscription={ subscription } /> }

                    { trial && ! isPaying && <TrialPlan trial={ trial } /> }

                    { ! canBuy && (
                        <div className="mb-4 px-3 py-2 bg-warning/10 border border-warning/40 rounded-lg
                            text-sm text-text-muted">
                            Plans are not on sale yet. Your server keeps
                            its { BILLING_FREE_MAX_MASTER_CHANNELS } free generators in the meantime.
                        </div>
                    ) }

                    <div className="grid gap-4 sm:grid-cols-2 max-w-3xl">
                        <PlanCard
                            name={ FREE_TIER.name }
                            monthlyPriceUsd={ FREE_TIER.monthlyPriceUsd }
                            maxMasterChannels={ FREE_TIER.maxMasterChannels }
                            includesBranding={ FREE_TIER.includesBranding }
                            isCurrent={ null === currentSlug && ! isOnTrial }
                            action={
                                <div className="w-full px-4 py-2 rounded-lg text-sm font-medium text-center
                                    text-text-muted border border-border">
                                    { null === currentSlug && ! isOnTrial ? "Current plan" : "Included" }
                                </div>
                            }
                        />

                        { BILLING_TIER_DEFINITIONS.map( ( tier ) => {
                            const isCurrent = currentSlug === tier.slug;
                            const isBuyable = canBuy && purchasableSlugs.includes( tier.slug ) && ! isCurrent;

                            return (
                                <PlanCard
                                    key={ tier.slug }
                                    name={ tier.name }
                                    monthlyPriceUsd={ tier.monthlyPriceUsd }
                                    maxMasterChannels={ tier.maxMasterChannels }
                                    includesBranding={ tier.includesBranding }
                                    isCurrent={ isCurrent }
                                    action={
                                        <button
                                            type="button"
                                            disabled={ ! isBuyable || null !== opening }
                                            onClick={ () => buy( tier.slug ) }
                                            className="w-full px-4 py-2 rounded-lg text-sm font-medium
                                                bg-accent text-white disabled:opacity-40
                                                disabled:cursor-not-allowed hover:opacity-90
                                                transition-opacity">
                                            { opening === tier.slug
                                                ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                                : isCurrent ? "Current plan" : `Choose ${ tier.name }` }
                                        </button>
                                    }
                                />
                            );
                        } ) }
                    </div>

                    <p className="text-sm text-text-muted mt-6 flex items-start gap-2">
                        <Check className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                            Nothing is ever deleted. Going over a plan pauses the newest generators; the ones
                            set up first keep working, and paying starts the rest again. The bot's own profile
                            here comes off when a plan that includes it ends, stays saved, and goes back on
                            when you pay again.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default BillingPage;
