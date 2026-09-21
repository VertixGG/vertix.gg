import {
    BILLING_FREE_MAX_MASTER_CHANNELS,
    BILLING_TIER_DEFINITIONS,
    formatMasterChannelAllowance,
    isUnlimitedAllowance
} from "@vertix.gg/definitions/src/billing-definitions";

/**
 * What a server pays for, and what it gets without paying.
 *
 * The numbers are the bot's own - `billing-definitions.ts` is what it resolves an allowance from,
 * and this page reads the same table. A plan quoted here that the bot does not honour is the one
 * mistake this page cannot be allowed to make.
 *
 * There is no checkout on this page and there will not be one. Subscriptions are discord's own: a
 * server buys them inside discord, discord takes the payment, and the bot is told by an entitlement.
 * So what this page can honestly do is say what the plans are and send people to the right place.
 */

interface IPlan {
    name: string;
    price: string;
    priceNote: string;
    generators: string;
    extra: string;
    isFree: boolean;
}

/**
 * Function describeExtra() :: What a tier adds to the free two, in words.
 *
 * A tier's number is a total, and a total is the honest thing to enforce against - but "nine
 * generators" answers a different question from "seven more than I have now", and the second is the
 * one somebody comparing plans is actually asking.
 */
function describeExtra( maxMasterChannels: number ): string {
    if ( isUnlimitedAllowance( maxMasterChannels ) ) {
        return "as many as you like";
    }

    return `${ maxMasterChannels - BILLING_FREE_MAX_MASTER_CHANNELS } more than free`;
}

const PLANS: IPlan[] = [
    {
        name: "Free",
        price: "$0",
        priceNote: "no card, no trial, no expiry",
        generators: String( BILLING_FREE_MAX_MASTER_CHANNELS ),
        extra: "where every server starts",
        isFree: true
    },
    ...BILLING_TIER_DEFINITIONS.map( ( tier ) => ( {
        name: tier.name,
        price: `$${ tier.monthlyPriceUsd }`,
        priceNote: "per month, per server",
        generators: formatMasterChannelAllowance( tier.maxMasterChannels ),
        extra: describeExtra( tier.maxMasterChannels ),
        isFree: false
    } ) )
];

/**
 * What every plan carries, which is the point worth making.
 *
 * Nothing in the bot is behind a plan - not a button, not a command, not a language. A plan buys
 * generators and nothing else, so this list is the same for all three and is printed once rather
 * than ticked three times down a comparison table that would say the same in every column.
 */
const IN_EVERY_PLAN = [
    "Every control a channel owner has - rename, limit, privacy, access, region, bitrate, and the rest",
    "Auto-scaling pools, which count as generators like any other setup",
    "The dashboard, including the interface editor and per-language wording",
    "Seven languages",
    "Twenty channels open at once, on every generator",
    "No command that asks anybody to vote for us"
];

export default function Pricing() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-h4">Plans</h1>

            <p className="text-vc-ice-dim mt-4 mb-10">
                A plan buys one thing: how many generators a server may run at once. Every feature is
                in every plan, including the free one.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                { PLANS.map( ( plan ) => (
                    <div key={ plan.name }
                        className="p-4 rounded border h-full"
                        style={ {
                            borderColor: plan.isFree ? "var(--color-vc-mint)" : "var(--color-vc-hairline-bright)",
                            background: "var(--color-vc-space)"
                        } }>
                        <h2 className={ `text-h6 mb-3 ${ plan.isFree ? "text-vc-mint" : "text-vc-ice" }` }>
                            { plan.name }
                        </h2>

                        <div className="text-h6 text-vc-ice">{ plan.price }</div>
                        <div className="text-fine text-vc-ice-dim mb-3">{ plan.priceNote }</div>

                        <div className="text-vc-ice">{ plan.generators } generators</div>
                        <div className="text-fine text-vc-ice-dim mb-1">{ plan.extra }</div>
                        <div className="text-fine text-vc-ice-dim">
                            join-to-create setups and auto-scaling pools together
                        </div>
                    </div>
                ) ) }
            </div>

            <h2 className="text-h5 mb-3">In every plan</h2>

            <ul className="text-vc-ice-dim mb-10">
                { IN_EVERY_PLAN.map( ( item ) => (
                    <li key={ item }>{ item }</li>
                ) ) }
            </ul>

            <h2 className="text-h5 mb-3">Buying one</h2>

            <p className="text-vc-ice-dim mb-4">
                Plans are sold by Discord, not by us. A server admin buys one from the bot&apos;s page
                inside Discord - the same place apps are installed from - and Discord handles the
                payment and the renewal. There is nothing to enter on this site, and we never see a
                card.
            </p>

            <p className="text-vc-ice-dim mb-10">
                A plan covers one server. It takes effect straight away: the generators it allows
                start making channels again within the minute, and nothing has to be set up twice.
            </p>

            <h2 className="text-h5 mb-3">Going over, and coming back</h2>

            <p className="text-vc-ice-dim mb-4">
                Nothing is deleted, ever. A server with more generators than its plan allows keeps
                every one of them, along with their settings, their wording and the channels already
                open. The generators it set up first go on working; the extras stop making new
                channels and say so to anybody who joins them.
            </p>

            <p className="text-vc-ice-dim mb-10">
                Pay, and they start again. Cancel, and they stop at the end of the period you already
                paid for - not the moment you cancel.
            </p>

            <h2 className="text-h5 mb-3">Above the top plan</h2>

            <p className="text-vc-ice-dim">
                There is no plan above the top one - it has no ceiling. If a server was granted an
                allowance by us for some other reason, a plan it buys afterwards never takes that
                away: it keeps whichever of the two is larger.
            </p>
        </div>
    );
}
