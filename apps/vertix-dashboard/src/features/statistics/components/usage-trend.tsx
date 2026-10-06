import { useCommandState } from "@zenflux/react-commander/hooks";

import { CalendarRange, DoorOpen, Gauge, Server } from "lucide-react";

import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { StatCard } from "@vertix.gg/dashboard/src/features/home/components/stat-card";
import { DayBars } from "@vertix.gg/dashboard/src/features/home/components/day-bars";
import { describeWeekChange, formatCount, formatDay } from "@vertix.gg/dashboard/src/features/home/lib/format";

import type { IDashboardDayCount } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import type { UsageDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

/**
 * Function findBusiestDay() :: The day with the most in it - the latest of those that tie - or null when
 * every day was quiet.
 */
function findBusiestDay( days: IDashboardDayCount[] ): IDashboardDayCount | null {
    return days.reduce<IDashboardDayCount | null>(
        ( busiest, day ) => day.count > 0 && day.count >= ( busiest?.count ?? 0 ) ? day : busiest,
        null
    );
}

/**
 * How much the bot is used across every server - this week against the last, and a bar a day for the
 * rooms made and the servers making them.
 */
export function UsageTrend() {
    const [ state ] = useCommandState<UsageDisplayState, UsageDisplayState>(
        "Statistics/UsageStats",
        ( state: UsageDisplayState ): UsageDisplayState => ( { usageStats: state.usageStats } )
    );

    const usage = state.usageStats;

    if ( ! usage ) {
        return null;
    }

    const roomsInWindow = usage.roomsPerDay.reduce( ( sum, day ) => sum + day.count, 0 ),
        busiestDay = findBusiestDay( usage.roomsPerDay ),
        perServer = usage.activeThisWeek ? ( usage.roomsThisWeek / usage.activeThisWeek ).toFixed( 1 ) : "0",
        firstDay = usage.roomsPerDay[ 0 ]?.day,
        countingBeganInWindow = !! usage.countedSince && !! firstDay && usage.countedSince > firstDay;

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatCard
                    title="Rooms This Week"
                    value={ formatCount( usage.roomsThisWeek ) }
                    icon={ DoorOpen }
                    description={ describeWeekChange( usage.roomsThisWeek, usage.roomsLastWeek ) }
                />
                <StatCard
                    title="Active Servers"
                    value={ formatCount( usage.activeThisWeek ) }
                    icon={ Server }
                    description={ describeWeekChange( usage.activeThisWeek, usage.activeLastWeek ) }
                />
                <StatCard
                    title="Rooms per Server"
                    value={ perServer }
                    icon={ Gauge }
                    description="This week, over the servers making any"
                />
                <StatCard
                    title={ `Rooms in ${ DASHBOARD_STATS_WINDOWS.USAGE_DAYS } Days` }
                    value={ formatCount( roomsInWindow ) }
                    icon={ CalendarRange }
                    description={ busiestDay
                        ? `${ formatCount( busiestDay.count ) } on ${ formatDay( busiestDay.day ) }, the busiest day`
                        : "No rooms yet" }
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-surface border border-border rounded-lg p-4">
                    <DayBars days={ usage.roomsPerDay } unit="room" countedSince={ usage.countedSince } />
                    <p className="text-xs text-text-muted mt-3 mb-0">Rooms made each day (UTC), across every server.</p>
                </div>

                <div className="bg-surface border border-border rounded-lg p-4">
                    <DayBars days={ usage.activeServersPerDay } unit="server" countedSince={ usage.countedSince } />
                    <p className="text-xs text-text-muted mt-3 mb-0">Servers whose members made a room, each day (UTC).</p>
                </div>
            </div>

            { countingBeganInWindow && usage.countedSince && (
                <p className="text-xs text-text-muted mt-3 mb-0">
                    Counting began { formatDay( usage.countedSince ) } - the dashed days before it were not counted.
                </p>
            ) }
        </>
    );
}

export default UsageTrend;
