import { useCommandState } from "@zenflux/react-commander/hooks";

import { formatCount, formatDay, formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";
import { resolveTint } from "@vertix.gg/dashboard/src/features/statistics/lib/tint";

import type { IRetentionCell, IRetentionCohort } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import type { ActivationDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

/**
 * Function countShownWeeks() :: How many weeks to draw - up to the last one any cohort was measured in,
 * so the columns nobody has reached yet are not a wall of dashes. Week 0 always.
 */
function countShownWeeks( cohorts: IRetentionCohort[] ): number {
    const lastMeasured = cohorts.reduce(
        ( last, cohort ) => cohort.weeks.reduce( ( lastInCohort, cell, week ) => cell ? Math.max( lastInCohort, week ) : lastInCohort, last ),
        0
    );

    return lastMeasured + 1;
}

function RetentionCell( { cell, week }: { cell: IRetentionCell | null; week: number } ) {
    if ( ! cell ) {
        return <td className="px-2 py-2 text-center text-text-muted">-</td>;
    }

    return (
        <td
            className={ `px-2 py-2 text-center tabular-nums text-text-primary ${ resolveTint( cell.active, cell.measured ) }` }
            title={ `${ cell.active } of ${ cell.measured } made rooms in week ${ week }` }
        >
            { formatShare( cell.active, cell.measured ) }%
        </td>
    );
}

/**
 * Each week's installs, and the share of them still making rooms in each week after - the shape of how
 * long an install keeps going.
 */
export function RetentionTable() {
    const [ state ] = useCommandState<ActivationDisplayState, ActivationDisplayState>(
        "Statistics/ActivationStats",
        ( state: ActivationDisplayState ): ActivationDisplayState => ( { activationStats: state.activationStats } )
    );

    const cohorts = state.activationStats?.cohorts;

    if ( ! cohorts ) {
        return null;
    }

    if ( ! cohorts.length ) {
        return <div className="bg-surface border border-border rounded-lg p-4 text-sm text-text-muted">No installs in the window yet.</div>;
    }

    const weeks = Array.from( { length: countShownWeeks( cohorts ) }, ( _, week ) => week );

    return (
        <div className="bg-surface border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs text-text-muted">
                        <th className="px-4 py-2 font-medium">Week of</th>
                        <th className="px-4 py-2 font-medium">Installs</th>
                        { weeks.map( ( week ) => (
                            <th key={ week } className="px-2 py-2 font-medium text-center">Week { week }</th>
                        ) ) }
                    </tr>
                </thead>
                <tbody>
                    { cohorts.map( ( cohort ) => (
                        <tr key={ cohort.week } className="border-t border-border-muted">
                            <td className="px-4 py-2 text-text-primary whitespace-nowrap">{ formatDay( cohort.week ) }</td>
                            <td className="px-4 py-2 text-text-primary tabular-nums">{ formatCount( cohort.installs ) }</td>
                            { weeks.map( ( week ) => (
                                <RetentionCell key={ week } cell={ cohort.weeks[ week ] } week={ week } />
                            ) ) }
                        </tr>
                    ) ) }
                </tbody>
            </table>

            <p className="text-xs text-text-muted px-4 py-3 mb-0 border-t border-border-muted">
                Each week is counted from the install&apos;s own day - week 0 is its first seven. A dash is a week not over
                yet, or one from before counting began.
            </p>
        </div>
    );
}

export default RetentionTable;
