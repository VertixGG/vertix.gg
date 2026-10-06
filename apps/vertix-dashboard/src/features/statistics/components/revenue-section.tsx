import { useCommandState } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";

import { CircleDollarSign, Hourglass, TrendingUp, Wallet } from "lucide-react";

import { STATISTICS_PLANS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { RevenueStatsQuery } from "@vertix.gg/dashboard/src/features/statistics/query/revenue-stats-query";
import { StatCard } from "@vertix.gg/dashboard/src/features/home/components/stat-card";
import { PlanBadge } from "@vertix.gg/dashboard/src/features/statistics/components/plan-badge";
import {
    StatisticsFailure,
    StatisticsSection,
    StatisticsSkeleton
} from "@vertix.gg/dashboard/src/features/statistics/components/statistics-section";
import { formatCount, formatDate, formatRelative, formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";
import { formatUntil } from "@vertix.gg/dashboard/src/features/statistics/lib/format";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { IRevenueServer, IRevenueStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import type { RevenueDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

interface RevenueDisplayProps {}

const REVENUE_INITIAL_STATE: RevenueDisplayState = {
    revenueStats: null
};

const REVENUE_HINT = "Subscriptions and free trials, every server";

/**
 * Function describeEnd() :: When what a server holds ends, the way the plans list says it - renewing,
 * ending, or already over, with how far off that is.
 */
function describeEnd( server: IRevenueServer ): string {
    const on = formatDate( server.endsAt );

    if ( ! server.endsAt || ! on ) {
        return "-";
    }

    if ( STATISTICS_PLANS.PAID === server.plan || STATISTICS_PLANS.TRIAL === server.plan ) {
        const until = formatUntil( server.endsAt ),
            verb = STATISTICS_PLANS.PAID === server.plan && ! server.isCancelling ? "Renews" : "Ends";

        return until ? `${ verb } ${ on } · ${ until }` : `${ verb } ${ on }`;
    }

    return `Ended ${ on } · ${ formatRelative( server.endsAt ) }`;
}

const RevenueDisplayComponent: DCommandFunctionComponent<RevenueDisplayProps, RevenueDisplayState> = () => {
    const [ state ] = useCommandState<RevenueDisplayState, RevenueDisplayState>(
        "Statistics/RevenueStats",
        ( state: RevenueDisplayState ): RevenueDisplayState => ( { revenueStats: state.revenueStats } )
    );

    const revenue = state.revenueStats;

    if ( ! revenue ) {
        return (
            <StatisticsSection title="Plans and trials" hint={ REVENUE_HINT }>
                <StatisticsFailure text="Failed to load the plans and trials" />
            </StatisticsSection>
        );
    }

    return (
        <StatisticsSection title="Plans and trials" hint={ REVENUE_HINT }>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatCard
                    title="Paying Servers"
                    value={ formatCount( revenue.paying ) }
                    icon={ Wallet }
                    description={ revenue.cancelling ? `${ formatCount( revenue.cancelling ) } set to cancel` : "None set to cancel" }
                />
                <StatCard
                    title="Monthly Revenue"
                    value={ `$${ formatCount( revenue.monthlyRevenueUsd ) }` }
                    icon={ CircleDollarSign }
                    description="From the ones that renew, at list price"
                />
                <StatCard
                    title="Trials Running"
                    value={ formatCount( revenue.trialsRunning ) }
                    icon={ Hourglass }
                    description={ `${ formatCount( revenue.trials ) } given in all` }
                />
                <StatCard
                    title="Trial to Paid"
                    value={ revenue.trials ? `${ formatShare( revenue.trialsConverted, revenue.trials ) }%` : "-" }
                    icon={ TrendingUp }
                    description={ `${ formatCount( revenue.trialsConverted ) } of ${ formatCount( revenue.trials ) } bought since` }
                />
            </div>

            { revenue.servers.length ? (
                <div className="bg-surface border border-border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-text-muted">
                                <th className="px-4 py-2 font-medium">Server</th>
                                <th className="px-4 py-2 font-medium">Plan</th>
                                <th className="px-4 py-2 font-medium">Paddle status</th>
                                <th className="px-4 py-2 font-medium">Ends</th>
                                <th className="px-4 py-2 font-medium">Rooms this week</th>
                            </tr>
                        </thead>
                        <tbody>
                            { revenue.servers.map( ( server ) => (
                                <tr key={ server.guildId } className="border-t border-border-muted">
                                    <td className="px-4 py-2 text-text-primary max-w-56 truncate" title={ `${ server.name } (${ server.guildId })` }>
                                        { server.name }
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <PlanBadge plan={ server.plan } />
                                        { server.planName && <span className="text-xs text-text-muted ml-2">{ server.planName }</span> }
                                    </td>
                                    <td className="px-4 py-2 text-text-secondary">{ server.status ?? "-" }</td>
                                    <td className="px-4 py-2 text-text-secondary whitespace-nowrap">{ describeEnd( server ) }</td>
                                    <td className="px-4 py-2 text-text-secondary tabular-nums">{ formatCount( server.roomsThisWeek ) }</td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-lg p-4 text-sm text-text-muted">
                    No server has had a trial or a subscription yet.
                </div>
            ) }
        </StatisticsSection>
    );
};

const RevenueDisplay = withCommands<RevenueDisplayProps, RevenueDisplayState>(
    "Statistics/RevenueStats",
    RevenueDisplayComponent,
    REVENUE_INITIAL_STATE,
    []
);

/**
 * What the servers pay for, and how their free trials went.
 */
export function RevenueSection() {
    return (
        <QueryComponent<IRevenueStats, RevenueDisplayProps, IRevenueStats, RevenueDisplayState>
            fallback={ <StatisticsSkeleton /> }
            module={ RevenueStatsQuery }
            component={ RevenueDisplay }
            props={ {} }
        />
    );
}

export default RevenueSection;
