import { useCommandState } from "@zenflux/react-commander/hooks";

import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { PlanBadge } from "@vertix.gg/dashboard/src/features/statistics/components/plan-badge";
import { formatCount, formatDay } from "@vertix.gg/dashboard/src/features/home/lib/format";

import type { UsageDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

/**
 * The servers that made the most rooms over the ranking window, and what each holds.
 */
export function TopServers() {
    const [ state ] = useCommandState<UsageDisplayState, UsageDisplayState>(
        "Statistics/UsageStats",
        ( state: UsageDisplayState ): UsageDisplayState => ( { usageStats: state.usageStats } )
    );

    const servers = state.usageStats?.topServers;

    if ( ! servers ) {
        return null;
    }

    if ( ! servers.length ) {
        return (
            <div className="bg-surface border border-border rounded-lg p-4 text-sm text-text-muted">
                No rooms made in the last { DASHBOARD_STATS_WINDOWS.TOP_SERVERS_DAYS } days.
            </div>
        );
    }

    return (
        <div className="bg-surface border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left text-xs text-text-muted">
                        <th className="px-4 py-2 font-medium">#</th>
                        <th className="px-4 py-2 font-medium">Server</th>
                        <th className="px-4 py-2 font-medium">Rooms</th>
                        <th className="px-4 py-2 font-medium">This week</th>
                        <th className="px-4 py-2 font-medium">Active days</th>
                        <th className="px-4 py-2 font-medium">Last room</th>
                        <th className="px-4 py-2 font-medium">Plan</th>
                    </tr>
                </thead>
                <tbody>
                    { servers.map( ( server, index ) => (
                        <tr key={ server.guildId } className="border-t border-border-muted">
                            <td className="px-4 py-2 text-text-muted tabular-nums">{ index + 1 }</td>
                            <td className="px-4 py-2 text-text-primary max-w-56 truncate" title={ `${ server.name } (${ server.guildId })` }>
                                { server.name }
                                { ! server.isInGuild && <span className="text-xs text-warning"> · removed</span> }
                            </td>
                            <td className="px-4 py-2 text-text-primary tabular-nums">{ formatCount( server.rooms ) }</td>
                            <td className="px-4 py-2 text-text-secondary tabular-nums">{ formatCount( server.roomsThisWeek ) }</td>
                            <td className="px-4 py-2 text-text-secondary tabular-nums">
                                { server.activeDays } / { DASHBOARD_STATS_WINDOWS.TOP_SERVERS_DAYS }
                            </td>
                            <td className="px-4 py-2 text-text-secondary whitespace-nowrap">{ formatDay( server.lastActiveDay ) }</td>
                            <td className="px-4 py-2"><PlanBadge plan={ server.plan } /></td>
                        </tr>
                    ) ) }
                </tbody>
            </table>
        </div>
    );
}

export default TopServers;
