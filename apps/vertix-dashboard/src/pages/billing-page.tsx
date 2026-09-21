import { useState } from "react";

import { useSearchParams } from "react-router-dom";

import { useCommandState } from "@zenflux/react-commander/hooks";

import { AlertTriangle, Check, Loader2 } from "lucide-react";

import {
    BILLING_FREE_MAX_MASTER_CHANNELS,
    BILLING_TIER_DEFINITIONS,
    formatMasterChannelAllowance
} from "@vertix.gg/definitions/src/billing-definitions";

import { getPurchasableTiers, isCheckoutAvailable, openPlanCheckout } from "@vertix.gg/dashboard/src/lib/paddle";

import type { AuthState } from "@vertix.gg/dashboard/src/features/auth/commands/auth-commands";

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

    const guild = authState.selectedGuild;

    const requestedSlug = searchParams.get( "plan" );

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
                        const isBuyable = canBuy && purchasable.has( tier.slug );

                        return (
                            <div key={ tier.slug }
                                className={ `flex flex-col p-5 rounded-lg border bg-surface ${
                                    isRequested ? "border-accent" : "border-border"
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
                                        : `Choose ${ tier.name }` }
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
