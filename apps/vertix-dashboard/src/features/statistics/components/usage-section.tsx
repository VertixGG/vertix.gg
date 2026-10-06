import { useCommandState } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";

import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { UsageStatsQuery } from "@vertix.gg/dashboard/src/features/statistics/query/usage-stats-query";
import { BusiestHours } from "@vertix.gg/dashboard/src/features/statistics/components/busiest-hours";
import { TopServers } from "@vertix.gg/dashboard/src/features/statistics/components/top-servers";
import { UsageTrend } from "@vertix.gg/dashboard/src/features/statistics/components/usage-trend";
import {
    StatisticsFailure,
    StatisticsSection,
    StatisticsSkeleton
} from "@vertix.gg/dashboard/src/features/statistics/components/statistics-section";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { IUsageStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import type { UsageDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

interface UsageDisplayProps {}

const USAGE_INITIAL_STATE: UsageDisplayState = {
    usageStats: null
};

const UsageDisplayComponent: DCommandFunctionComponent<UsageDisplayProps, UsageDisplayState> = () => {
    const [ state ] = useCommandState<UsageDisplayState, UsageDisplayState>(
        "Statistics/UsageStats",
        ( state: UsageDisplayState ): UsageDisplayState => ( { usageStats: state.usageStats } )
    );

    if ( ! state.usageStats ) {
        return (
            <StatisticsSection title="Usage">
                <StatisticsFailure text="Failed to load the usage figures" />
            </StatisticsSection>
        );
    }

    return (
        <>
            <StatisticsSection title="Usage" hint={ `Rooms across every server, the last ${ DASHBOARD_STATS_WINDOWS.USAGE_DAYS } days` }>
                <UsageTrend />
            </StatisticsSection>

            <StatisticsSection title="Busiest hours" hint={ `The last ${ DASHBOARD_STATS_WINDOWS.HOURS_DAYS } days, in your time zone` }>
                <BusiestHours />
            </StatisticsSection>

            <StatisticsSection title="Top servers" hint={ `By rooms made, the last ${ DASHBOARD_STATS_WINDOWS.TOP_SERVERS_DAYS } days` }>
                <TopServers />
            </StatisticsSection>
        </>
    );
};

const UsageDisplay = withCommands<UsageDisplayProps, UsageDisplayState>(
    "Statistics/UsageStats",
    UsageDisplayComponent,
    USAGE_INITIAL_STATE,
    []
);

/**
 * How much the bot is used across every server - three parts of the page off one read.
 */
export function UsageSection() {
    return (
        <QueryComponent<IUsageStats, UsageDisplayProps, IUsageStats, UsageDisplayState>
            fallback={ <StatisticsSkeleton /> }
            module={ UsageStatsQuery }
            component={ UsageDisplay }
            props={ {} }
        />
    );
}

export default UsageSection;
