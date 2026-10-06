import {
    BILLING_FREE_MAX_MASTER_CHANNELS,
    BILLING_TIER_DEFINITIONS,
    BILLING_TRIAL_WARNING_DAYS,
    formatMasterChannelAllowance,
    isUnlimitedAllowance,
    resolveTrialTier
} from "@vertix.gg/definitions/src/billing-definitions";

import { planCheckoutUrl, trialStartUrl } from "@vertix.gg/website/src/vertix/shared/discord-app";

/**
 * What a server pays for, and what it gets without paying.
 *
 * The numbers are the bot's own - `billing-definitions.ts` is what it resolves an allowance from,
 * and this page reads the same table. A plan quoted here that the bot does not honour is the one
 * mistake this page cannot be allowed to make.
 *
 * There is no checkout on this page and there will not be one. A plan is bought for one server, and
 * this page has no idea which server anybody has - the dashboard does, being signed in with discord
 * with a guild open, so the buttons go there and the checkout starts where the answer already is.
 */

interface IPlan {
    name: string;
    price: string;
    /** Already worded - `Unlimited` says it on its own, where a number needs the noun after it. */
    allowance: string;
    /** The line under the allowance, which is what somebody comparing plans is actually reading. */
    note: string;
    /** What else the plan buys besides generators, a line each. */
    extras: string[];
    /** How the plan can be had for nothing first, or null where it cannot. */
    trial: string | null;
    /** Where the trial is started - the dashboard, which knows the server - or null with no trial. */
    trialHref: string | null;
    /** Where its button goes - the dashboard's billing page, already on this plan. */
    href: string;
    /** The one plan a page like this should point at, and only one. */
    isFeatured: boolean;
    isFree: boolean;
}

/**
 * Function describeAllowance() :: What a tier adds to the free ones, in words.
 *
 * A tier's number is a total, and a total is the honest thing to enforce against - but "how many
 * more than I have now" is the question being asked, so the total is the heading and this goes
 * under it. Pro has no ceiling, so it takes the first branch; the second is for a finite tier.
 */
function describeAllowance( maxMasterChannels: number ): string {
    if ( isUnlimitedAllowance( maxMasterChannels ) ) {
        return "no ceiling at all";
    }

    return `${ maxMasterChannels - BILLING_FREE_MAX_MASTER_CHANNELS } more than free`;
}

/**
 * What a plan buys besides generators, worded for a plan card.
 *
 * Called branding here because that is what the dashboard page it is set on is called. The panels'
 * line goes with it: the bot leaves it off wherever the plan includes branding, and nowhere else.
 */
const BRANDING_EXTRA = "branding - the bot's own name, avatar, banner and bio in your server";

const PANEL_LINE_EXTRA = "no \"Add VoiceChannels\" or \"Vote VoiceChannels\" links on your panels";

/**
 * Function describeTrial() :: A tier's free trial, as the line its card carries - null for a tier with none.
 *
 * "Try it", not "first 14 days": the trial is its own button, started whenever the owner likes, and
 * a card that said "first" would read as days given with a purchase.
 */
function describeTrial( tier: { trialDays: number } ): string | null {
    return tier.trialDays > 0 ? `try it free for ${ tier.trialDays } days - no card` : null;
}

/**
 * Function describeTrialOffer() :: The free trial, as the sentence the intro closes on.
 */
function describeTrialOffer( tier: { name: string; trialDays: number } ): string {
    return `Every server can try ${ tier.name } free for ${ tier.trialDays } days, once - no card, and `
        + "nothing to cancel.";
}

/**
 * Function describeUpgrade() :: What a paid tier adds to free, as the sentence the intro ends on.
 */
function describeUpgrade( tier: { name: string; maxMasterChannels: number; includesBranding: boolean } ): string {
    const generators = isUnlimitedAllowance( tier.maxMasterChannels )
        ? "as many generators as a server wants"
        : `${ tier.maxMasterChannels } generators`;

    if ( ! tier.includesBranding ) {
        return `${ tier.name } adds ${ generators }.`;
    }

    return `${ tier.name } adds three things: ${ generators }, branding - the bot's own name, avatar, `
        + "banner and bio in your server - and panels without our \"Add VoiceChannels\" and \"Vote "
        + "VoiceChannels\" links.";
}

/**
 * The plan this page points at - Pro, the one there is to buy.
 *
 * Named by its slug rather than picked out of the tier table by position, so a tier added to the
 * table later cannot move the emphasis onto whichever entry happens to land in that slot.
 *
 * Pointed at by its rim and its button, with no badge. The badge said "Most servers", which was the
 * middle of three paid plans once; beside the free card it claims most servers pay, and most never
 * leave free.
 */
const FEATURED_TIER_SLUG = "pro";

const FEATURED_TIER = BILLING_TIER_DEFINITIONS.find( ( tier ) => FEATURED_TIER_SLUG === tier.slug );

/** The plan every server may try for nothing, asked the way the bot asks it when it starts one. */
const TRIAL_TIER = resolveTrialTier( BILLING_TIER_DEFINITIONS );

const PLANS: IPlan[] = [
    {
        name: "Free",
        price: "$0",
        allowance: `${ BILLING_FREE_MAX_MASTER_CHANNELS } generators`,
        note: "the starting point",
        extras: [],
        trial: null,
        trialHref: null,
        href: "/invite-vertix?src=site-pricing",
        isFeatured: false,
        isFree: true
    },
    ...BILLING_TIER_DEFINITIONS.map( ( tier ) => ( {
        name: tier.name,
        price: `$${ tier.monthlyPriceUsd }`,
        allowance: isUnlimitedAllowance( tier.maxMasterChannels )
            ? formatMasterChannelAllowance( tier.maxMasterChannels )
            : `${ formatMasterChannelAllowance( tier.maxMasterChannels ) } generators`,
        note: describeAllowance( tier.maxMasterChannels ),
        extras: tier.includesBranding ? [ BRANDING_EXTRA, PANEL_LINE_EXTRA ] : [],
        trial: describeTrial( tier ),
        trialHref: tier.trialDays > 0 ? trialStartUrl() : null,
        href: planCheckoutUrl( tier.slug ),
        isFeatured: FEATURED_TIER_SLUG === tier.slug,
        isFree: false
    } ) )
];

/**
 * What every plan carries, free included, which is the point worth making.
 *
 * No control a channel's owner or a server's admin uses is behind a plan - not a button, not a
 * command, not a language. A plan buys generators, the bot's own profile in the server and panels
 * without our links, and nothing on this list - so it is printed once rather than ticked down both
 * columns, which would say the same thing in each of them.
 */
const IN_EVERY_PLAN = [
    "Every control a channel owner has - rename, limit, privacy, access, region, bitrate and the rest",
    "Auto-scaling pools, which count as generators like any other setup",
    "The dashboard, the interface editor and per-language wording",
    "Seven languages",
    "Twenty channels open at once, on every generator",
    "Nothing locked behind a vote"
];

/**
 * What the free trial is, for the questions - only where a plan offers one.
 *
 * Says what the end takes away, in the words "And if I cancel?" uses for a plan ending, because a
 * trial ends the same way: nothing is deleted, the extras pause and the bot's own profile comes off.
 */
const TRIAL_QUESTIONS = TRIAL_TIER
    ? [ {
        question: "Is there a free trial?",
        answer: `Yes - every server can try ${ TRIAL_TIER.name } free for ${ TRIAL_TIER.trialDays } days, `
            + "once. Its owner starts it from the dashboard's Subscription page, on the server it is "
            + "for, and it asks for no card and never charges. "
            + `The bot tells the owner ${ BILLING_TRIAL_WARNING_DAYS } days before it ends; `
            + "when it ends, the bot goes back to its normal profile in your server and the generators "
            + `past the free ${ BILLING_FREE_MAX_MASTER_CHANNELS } pause - unless the server subscribed by then.`
    } ]
    : [];

const QUESTIONS = [
    ...TRIAL_QUESTIONS,
    {
        question: "Where do I buy one?",
        answer: "From the dashboard, on the server you want to buy it for - a plan covers one "
            + "server, so it has to know which. Payment is handled by Paddle, who take the card "
            + "and the tax; we never see either."
    },
    {
        question: "What happens if I go over my plan?",
        answer: "Nothing is deleted, ever. A server keeps every generator it has, along with their "
            + "settings, their wording and the channels already open. The generators it set up "
            + "first go on working; the extras stop making new channels and say so to anybody who "
            + "joins them."
    },
    {
        question: "And if I cancel?",
        answer: "The plan runs to the end of the period you already paid for, not to the moment you "
            + "cancel. After that the allowance drops back and the extra generators pause - still "
            + "there, still configured, waiting. The bot goes back to its normal profile in your "
            + "server, and the one you gave it is kept for when you come back."
    },
    {
        question: "Does a plan cover all my servers?",
        answer: "One server. The generators belong to the server the plan was bought for, so a "
            + "second server needs its own."
    },
    {
        question: "Does branding change the bot in other servers?",
        answer: "No. It changes how the bot looks in your server only. Every other server keeps the "
            + "normal VoiceChannels bot, and so does its profile everywhere else."
    },
    {
        question: "We were given an allowance already.",
        answer: "It stays. A server keeps whichever is larger - what we granted it or what it pays "
            + "for - so buying a plan can never take something away."
    }
];

function PlanCard( { plan }: { plan: IPlan } ) {
    return (
        <div className={ `vc-panel relative flex h-full flex-col p-6 ${ plan.isFeatured ? "vc-panel-rim" : "" }` }
            style={ plan.isFeatured ? { borderColor: "var(--color-vc-cyan)" } : undefined }>

            <h2 className="text-h5 mb-1" style={ { color: plan.isFree ? "var(--color-vc-mint)" : "var(--color-vc-starlight)" } }>
                { plan.name }
            </h2>

            <div className={ `flex items-baseline gap-2 ${ plan.trial ? "mb-1" : "mb-6" }` }>
                <span className="text-h2 text-vc-starlight">{ plan.price }</span>
                { ! plan.isFree && <span className="text-fine text-vc-ice-dim">/ month</span> }
            </div>

            { plan.trial && (
                <div className="text-fine mb-6" style={ { color: "var(--color-vc-mint)" } }>
                    { plan.trial }
                </div>
            ) }

            <div className="text-h5 text-vc-ice">{ plan.allowance }</div>
            <div className="text-fine text-vc-ice-dim mb-1">{ plan.note }</div>

            <div className="mb-6">
                <div className="text-fine text-vc-ice-dim">
                    join-to-create setups and auto-scaling pools together
                </div>

                { plan.extras.map( ( extra ) => (
                    <div key={ extra } className="text-fine text-vc-ice mt-1">+ { extra }</div>
                ) ) }
            </div>

            <a className={ `vc-btn vc-btn-effect mt-auto w-full ${ plan.isFeatured ? "vc-btn-primary" : "" }` }
                href={ plan.href }
                target={ plan.isFree ? undefined : "_blank" }
                rel={ plan.isFree ? undefined : "noreferrer" }>
                { plan.isFree ? "Invite the bot" : `Get ${ plan.name }` }
            </a>

            { plan.trialHref && (
                <a className="vc-btn vc-btn-effect mt-2 w-full"
                    href={ plan.trialHref }
                    target="_blank"
                    rel="noreferrer">
                    Start free trial
                </a>
            ) }
        </div>
    );
}

export default function Pricing() {
    return (
        <div className="vc-container vc-page-panel px-6 py-10">
            <div className="text-center mb-10">
                <h1 className="text-h3 mb-3">Plans</h1>

                <p className="text-vc-ice-dim mx-auto max-w-2xl">
                    Every voice-channel control is free, on every plan - nothing a channel owner
                    presses sits behind a paywall. { FEATURED_TIER ? describeUpgrade( FEATURED_TIER ) : null }
                    { " " }
                    { TRIAL_TIER ? describeTrialOffer( TRIAL_TIER ) : null }
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto mb-6">
                { PLANS.map( ( plan ) => <PlanCard key={ plan.name } plan={ plan }/> ) }
            </div>

            <p className="text-fine text-vc-ice-dim text-center mb-14">
                Prices are in US dollars, and the payment is taken by Paddle, our reseller. A plan
                covers one server.
            </p>

            <div className="vc-panel p-6 mb-14">
                <h2 className="text-h5 mb-4">In every plan, including free</h2>

                <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 list-none pl-0">
                    { IN_EVERY_PLAN.map( ( item ) => (
                        <li key={ item } className="flex gap-3 text-vc-ice-dim">
                            <span aria-hidden="true" style={ { color: "var(--color-vc-mint)" } }>✓</span>
                            <span>{ item }</span>
                        </li>
                    ) ) }
                </ul>
            </div>

            <h2 className="text-h5 mb-4">Questions</h2>

            <div className="grid gap-4 sm:grid-cols-2">
                { QUESTIONS.map( ( item ) => (
                    <div key={ item.question } className="vc-panel p-5">
                        <h3 className="text-h6 text-vc-starlight mb-2">{ item.question }</h3>
                        <p className="text-fine text-vc-ice-dim mb-0">{ item.answer }</p>
                    </div>
                ) ) }
            </div>
        </div>
    );
}
