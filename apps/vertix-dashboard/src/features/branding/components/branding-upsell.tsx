import { Link } from "react-router-dom";

import { Sparkles } from "lucide-react";

import { BILLING_TIER_DEFINITIONS, resolveTrialTier } from "@vertix.gg/definitions/src/billing-definitions";

/**
 * The tier that includes branding, found by what it includes rather than by its name - so the card
 * follows the tier table whichever tier that turns out to be.
 */
const BRANDING_TIER = BILLING_TIER_DEFINITIONS.find( ( tier ) => tier.includesBranding );

/**
 * The plan a server may try for nothing - named here only when it is the one that brands, so the
 * card never offers a trial of a plan that would not give branding anyway.
 */
const TRIAL_TIER = resolveTrialTier( BILLING_TIER_DEFINITIONS );

const BRANDING_TRIAL_TIER = BRANDING_TIER && TRIAL_TIER === BRANDING_TIER ? TRIAL_TIER : null;

export interface BrandingUpsellProps {
    /** Whether a profile is saved from before, which comes back on its own once the server pays. */
    hasSavedProfile: boolean;
}

/**
 * What a server that does not pay for branding sees above the form.
 *
 * The form stays on the page, read-only, so what is being offered can be seen before it is bought.
 * The button goes to the subscription page already on the plan, which opens its checkout.
 */
export function BrandingUpsell( { hasSavedProfile }: BrandingUpsellProps ) {
    return (
        <div className="rounded-lg border border-border-accent bg-surface-elevated p-5">
            <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />

                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-text-primary mb-1">
                        { BRANDING_TIER
                            ? `Branding is part of ${ BRANDING_TIER.name } - $${ BRANDING_TIER.monthlyPriceUsd }/month`
                            : "Branding is not part of this server's plan" }
                    </h2>

                    <p className="text-sm text-text-muted mb-0">
                        Give the bot its own name, avatar, banner and bio in this server.
                        { /* "Once", because this card cannot tell a server still to have its trial from
                             one whose trial is over - the line has to be true for both. */ }
                        { BRANDING_TRIAL_TIER
                            ? ` Every server can try ${ BRANDING_TRIAL_TIER.name } free for ${ BRANDING_TRIAL_TIER.trialDays } days, once - start it from the Subscription page.`
                            : "" }
                        { hasSavedProfile
                            ? " The profile saved here is kept, and goes back on by itself once the server subscribes."
                            : "" }
                    </p>

                    { BRANDING_TIER ? (
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Link
                                to={ `/billing?plan=${ encodeURIComponent( BRANDING_TIER.slug ) }` }
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border
                                    border-accent bg-accent-muted hover:bg-accent-hover transition-colors"
                            >
                                { /* The colour sits on the span: the shared reset paints every link with the
                                     colour around it, and it outranks a utility on the link itself. */ }
                                <span className="text-sm font-medium text-text-primary">
                                    Get { BRANDING_TIER.name }
                                </span>
                            </Link>

                            { /* To the page rather than its checkout - no plan in the address - since the
                                 trial is started there, by its own button, and buys nothing. */ }
                            { BRANDING_TRIAL_TIER ? (
                                <Link
                                    to="/billing"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border
                                        border-border hover:bg-surface-hover transition-colors"
                                >
                                    <span className="text-sm font-medium text-text-primary">
                                        Try it free
                                    </span>
                                </Link>
                            ) : null }
                        </div>
                    ) : null }
                </div>
            </div>
        </div>
    );
}

export default BrandingUpsell;
