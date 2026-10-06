import { STATISTICS_PLANS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import type { TStatisticsPlan } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

const PLAN_LABELS: Record<TStatisticsPlan, string> = {
    [ STATISTICS_PLANS.PAID ]: "Paid",
    [ STATISTICS_PLANS.TRIAL ]: "Trial",
    [ STATISTICS_PLANS.LAPSED ]: "Lapsed",
    [ STATISTICS_PLANS.TRIAL_ENDED ]: "Trial ended",
    [ STATISTICS_PLANS.FREE ]: "Free"
};

/** Paying in the success colour, a running trial in the accent, a lapsed one as a warning, the rest muted. */
const PLAN_TONES: Record<TStatisticsPlan, string> = {
    [ STATISTICS_PLANS.PAID ]: "text-success border-success/40",
    [ STATISTICS_PLANS.TRIAL ]: "text-text-accent border-border-accent",
    [ STATISTICS_PLANS.LAPSED ]: "text-warning border-warning/40",
    [ STATISTICS_PLANS.TRIAL_ENDED ]: "text-text-muted border-border",
    [ STATISTICS_PLANS.FREE ]: "text-text-muted border-border-muted"
};

/**
 * What a server holds, as a small label.
 */
export function PlanBadge( { plan }: { plan: TStatisticsPlan } ) {
    return (
        <span className={ `inline-block px-2 py-0.5 rounded border text-xs whitespace-nowrap ${ PLAN_TONES[ plan ] }` }>
            { PLAN_LABELS[ plan ] }
        </span>
    );
}

export default PlanBadge;
