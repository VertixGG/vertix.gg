import { useCommandState } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";

import { CheckCircle2, Download, DoorOpen, HeartPulse, Wrench } from "lucide-react";

import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { GrowthStatsQuery } from "@vertix.gg/dashboard/src/features/statistics/query/growth-stats-query";
import { StatCard } from "@vertix.gg/dashboard/src/features/home/components/stat-card";
import { DayBars } from "@vertix.gg/dashboard/src/features/home/components/day-bars";
import {
    StatisticsFailure,
    StatisticsSection,
    StatisticsSkeleton
} from "@vertix.gg/dashboard/src/features/statistics/components/statistics-section";
import { formatCount, formatDay, formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";
import { formatPartOf } from "@vertix.gg/dashboard/src/features/statistics/lib/format";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { IGrowthStats, IGrowthSummary } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import type { GrowthDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

interface GrowthDisplayProps {}

const GROWTH_INITIAL_STATE: GrowthDisplayState = {
    growthStats: null
};

const GROWTH_HINT = `Installs from the last ${ DASHBOARD_STATS_WINDOWS.GROWTH_DAYS } days`;

function SourceRow( { summary, judgedDay }: { summary: IGrowthSummary; judgedDay: number } ) {
    return (
        <tr className="border-t border-border-muted">
            <td className="px-4 py-2 text-text-primary">{ summary.source }</td>
            <td className="px-4 py-2 text-text-primary tabular-nums">{ formatCount( summary.installs ) }</td>
            <td className="px-4 py-2 text-text-secondary tabular-nums">{ formatPartOf( summary.setUpAtOnce, summary.installs ) }</td>
            <td className="px-4 py-2 text-text-secondary tabular-nums">{ formatPartOf( summary.firstRoomEarly, summary.installs ) }</td>
            <td className="px-4 py-2 text-text-secondary tabular-nums">{ formatPartOf( summary.activeRecently, summary.installs ) }</td>
            <td className="px-4 py-2 text-text-secondary tabular-nums">{ formatPartOf( summary.stillInstalled, summary.installs ) }</td>
            <td className="px-4 py-2 text-text-secondary tabular-nums" title={ `${ summary.judged } old enough to reach day ${ judgedDay }` }>
                { formatPartOf( summary.aliveAtJudgedDay, summary.judged ) }
            </td>
        </tr>
    );
}

const GrowthDisplayComponent: DCommandFunctionComponent<GrowthDisplayProps, GrowthDisplayState> = () => {
    const [ state ] = useCommandState<GrowthDisplayState, GrowthDisplayState>(
        "Statistics/GrowthStats",
        ( state: GrowthDisplayState ): GrowthDisplayState => ( { growthStats: state.growthStats } )
    );

    const growth = state.growthStats;

    if ( ! growth ) {
        return (
            <StatisticsSection title="Growth" hint={ GROWTH_HINT }>
                <StatisticsFailure text="Failed to load the growth figures" />
            </StatisticsSection>
        );
    }

    const { total, judgedDay } = growth;

    return (
        <StatisticsSection title="Growth" hint={ GROWTH_HINT }>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <StatCard
                    title="Installs"
                    value={ formatCount( total.installs ) }
                    icon={ Download }
                    description={ `Since ${ formatDay( growth.since ) }` }
                />
                <StatCard
                    title="Set Up in a Day"
                    value={ `${ formatShare( total.setUpAtOnce, total.installs ) }%` }
                    icon={ Wrench }
                    description={ `${ formatCount( total.setUpAtOnce ) } made a generator within 24 hours` }
                />
                <StatCard
                    title="Used in a Week"
                    value={ `${ formatShare( total.firstRoomEarly, total.installs ) }%` }
                    icon={ DoorOpen }
                    description={ `${ formatCount( total.firstRoomEarly ) } had a first room within 7 days` }
                />
                <StatCard
                    title="Still Installed"
                    value={ `${ formatShare( total.stillInstalled, total.installs ) }%` }
                    icon={ CheckCircle2 }
                    description={ `${ formatCount( total.activeRecently ) } made rooms this week` }
                />
                <StatCard
                    title={ `Alive at Day ${ judgedDay }` }
                    value={ total.judged ? `${ formatShare( total.aliveAtJudgedDay, total.judged ) }%` : "-" }
                    icon={ HeartPulse }
                    description={ total.judged
                        ? `${ formatCount( total.aliveAtJudgedDay ) } of ${ formatCount( total.judged ) } old enough`
                        : `None ${ judgedDay } days old yet` }
                />
            </div>

            <div className="bg-surface border border-border rounded-lg p-4 mb-4">
                <DayBars days={ growth.installsPerDay } unit="install" />
                <p className="text-xs text-text-muted mt-3 mb-0">Installs each day (UTC), by the day the bot was added.</p>
            </div>

            <div className="bg-surface border border-border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs text-text-muted">
                            <th className="px-4 py-2 font-medium">Source</th>
                            <th className="px-4 py-2 font-medium">Installs</th>
                            <th className="px-4 py-2 font-medium">Set up in a day</th>
                            <th className="px-4 py-2 font-medium">Used in a week</th>
                            <th className="px-4 py-2 font-medium">Active this week</th>
                            <th className="px-4 py-2 font-medium">Still installed</th>
                            <th className="px-4 py-2 font-medium">Alive at day { judgedDay }</th>
                        </tr>
                    </thead>
                    <tbody>
                        { growth.bySource.map( ( summary ) => (
                            <SourceRow key={ summary.source } summary={ summary } judgedDay={ judgedDay } />
                        ) ) }
                        <tr className="border-t border-border font-medium">
                            <td className="px-4 py-2 text-text-primary">All</td>
                            <td className="px-4 py-2 text-text-primary tabular-nums">{ formatCount( total.installs ) }</td>
                            <td className="px-4 py-2 text-text-primary tabular-nums">{ formatPartOf( total.setUpAtOnce, total.installs ) }</td>
                            <td className="px-4 py-2 text-text-primary tabular-nums">{ formatPartOf( total.firstRoomEarly, total.installs ) }</td>
                            <td className="px-4 py-2 text-text-primary tabular-nums">{ formatPartOf( total.activeRecently, total.installs ) }</td>
                            <td className="px-4 py-2 text-text-primary tabular-nums">{ formatPartOf( total.stillInstalled, total.installs ) }</td>
                            <td className="px-4 py-2 text-text-primary tabular-nums">{ formatPartOf( total.aliveAtJudgedDay, total.judged ) }</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </StatisticsSection>
    );
};

const GrowthDisplay = withCommands<GrowthDisplayProps, GrowthDisplayState>(
    "Statistics/GrowthStats",
    GrowthDisplayComponent,
    GROWTH_INITIAL_STATE,
    []
);

/**
 * What becomes of every install, by the link it came through - the owner's figures, the same ones
 * `scripts/report-activation.ts` prints.
 */
export function GrowthSection() {
    return (
        <QueryComponent<IGrowthStats, GrowthDisplayProps, IGrowthStats, GrowthDisplayState>
            fallback={ <StatisticsSkeleton /> }
            module={ GrowthStatsQuery }
            component={ GrowthDisplay }
            props={ {} }
        />
    );
}

export default GrowthSection;
