import {
    BILLING_FREE_MAX_MASTER_CHANNELS,
    BILLING_TIER_DEFINITIONS,
    formatMasterChannelAllowance,
    isUnlimitedAllowance
} from "@vertix.gg/definitions/src/billing-definitions";

import { DISCORD_STORE_URL } from "@vertix.gg/website/src/vertix/shared/discord-app";

/**
 * What a server pays for, and what it gets without paying.
 *
 * The numbers are the bot's own - `billing-definitions.ts` is what it resolves an allowance from,
 * and this page reads the same table. A plan quoted here that the bot does not honour is the one
 * mistake this page cannot be allowed to make.
 *
 * There is no checkout on this page and there will not be one. Subscriptions are discord's own: a
 * server buys them inside discord, discord takes the payment, and the bot is told by an entitlement.
 * So the buttons leave for discord rather than pretending to sell anything here.
 */

interface IPlan {
    name: string;
    price: string;
    /** Already worded - `Unlimited` says it on its own, where a number needs the noun after it. */
    allowance: string;
    /** The line under the allowance, which is what somebody comparing plans is actually reading. */
    note: string;
    /** The one plan a page like this should point at, and only one. */
    isFeatured: boolean;
    isFree: boolean;
}

/**
 * Function describeAllowance() :: What a tier adds to the free ones, in words.
 *
 * A tier's number is a total, and a total is the honest thing to enforce against - but "seven more
 * than I have now" is the question being asked, so the total is the heading and this goes under it.
 */
function describeAllowance( maxMasterChannels: number ): string {
    if ( isUnlimitedAllowance( maxMasterChannels ) ) {
        return "no ceiling at all";
    }

    return `${ maxMasterChannels - BILLING_FREE_MAX_MASTER_CHANNELS } more than free`;
}

/**
 * The middle plan is the featured one.
 *
 * Not the dearest. A page that points at its most expensive plan is selling; one that points at the
 * plan most servers actually want is helping, and the second is the one people come back to.
 */
const FEATURED_TIER_NAME = BILLING_TIER_DEFINITIONS[ 1 ].name;

const PLANS: IPlan[] = [
    {
        name: "Free",
        price: "$0",
        allowance: `${ BILLING_FREE_MAX_MASTER_CHANNELS } generators`,
        note: "the starting point",
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
        isFeatured: FEATURED_TIER_NAME === tier.name,
        isFree: false
    } ) )
];

/**
 * What every plan carries, which is the point worth making.
 *
 * Nothing in the bot is behind a plan - not a button, not a command, not a language. A plan buys
 * generators and nothing else, so this is printed once rather than ticked down four columns that
 * would say the same thing in every one of them.
 */
const IN_EVERY_PLAN = [
    "Every control a channel owner has - rename, limit, privacy, access, region, bitrate and the rest",
    "Auto-scaling pools, which count as generators like any other setup",
    "The dashboard, the interface editor and per-language wording",
    "Seven languages",
    "Twenty channels open at once, on every generator",
    "No command that asks anybody to vote for us"
];

const QUESTIONS = [
    {
        question: "Where do I buy one?",
        answer: "Inside Discord. Plans are Discord's own subscriptions - it takes the payment and "
            + "handles the renewal, and we never see a card. The buttons above open the store page "
            + "for the bot."
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
            + "there, still configured, waiting."
    },
    {
        question: "Does a plan cover all my servers?",
        answer: "One server. Discord sells these per server, so a second server needs its own."
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

            { plan.isFeatured && (
                <div className="absolute -top-3 left-6 rounded-full px-3 py-0.5 text-fine"
                    style={ { background: "var(--color-vc-cyan)", color: "var(--color-vc-void)" } }>
                    Most servers
                </div>
            ) }

            <h2 className="text-h5 mb-1" style={ { color: plan.isFree ? "var(--color-vc-mint)" : "var(--color-vc-starlight)" } }>
                { plan.name }
            </h2>

            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-h2 text-vc-starlight">{ plan.price }</span>
                { ! plan.isFree && <span className="text-fine text-vc-ice-dim">/ month</span> }
            </div>

            <div className="text-h5 text-vc-ice">{ plan.allowance }</div>
            <div className="text-fine text-vc-ice-dim mb-1">{ plan.note }</div>

            <div className="text-fine text-vc-ice-dim mb-6">
                join-to-create setups and auto-scaling pools together
            </div>

            <a className={ `vc-btn vc-btn-effect mt-auto w-full ${ plan.isFeatured ? "vc-btn-primary" : "" }` }
                href={ plan.isFree ? "/invite-vertix" : DISCORD_STORE_URL }
                target={ plan.isFree ? undefined : "_blank" }
                rel={ plan.isFree ? undefined : "noreferrer" }>
                { plan.isFree ? "Invite the bot" : `Get ${ plan.name }` }
            </a>
        </div>
    );
}

export default function Pricing() {
    return (
        <div className="vc-container vc-page-panel px-6 py-10">
            <div className="text-center mb-10">
                <h1 className="text-h3 mb-3">Plans</h1>

                <p className="text-vc-ice-dim mx-auto max-w-2xl">
                    A plan buys one thing: how many generators a server may run at once. Every
                    feature is in every plan, including the free one - nothing here is a paywall
                    around a button.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                { PLANS.map( ( plan ) => <PlanCard key={ plan.name } plan={ plan }/> ) }
            </div>

            <p className="text-fine text-vc-ice-dim text-center mb-14">
                Prices are in US dollars and charged by Discord. A plan covers one server.
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
