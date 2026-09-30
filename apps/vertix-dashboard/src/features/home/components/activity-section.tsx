import { useCommandState } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";

import { CalendarRange, DoorOpen, Flame, TrendingUp } from "lucide-react";

import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { GuildActivityQuery } from "@vertix.gg/dashboard/src/features/home/query/guild-activity-query";
import { StatCard } from "@vertix.gg/dashboard/src/features/home/components/stat-card";
import { DayBars } from "@vertix.gg/dashboard/src/features/home/components/day-bars";
import { formatCount, formatDay } from "@vertix.gg/dashboard/src/features/home/lib/format";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { IGuildActivityStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface ActivityDisplayProps {
    guildId: string;
}

interface ActivityDisplayState {
    guildActivity: IGuildActivityStats | null;
}

const ACTIVITY_INITIAL_STATE: ActivityDisplayState = {
    guildActivity: null
};

/**
 * Function describeWeek() :: This week against the one before it, in a line.
 */
function describeWeek( activity: IGuildActivityStats ) {
    const difference = activity.roomsThisWeek - activity.roomsLastWeek;

    if ( ! activity.roomsLastWeek ) {
        return activity.roomsThisWeek ? "None the week before" : "None the week before either";
    }

    if ( ! difference ) {
        return "The same as the week before";
    }

    return `${ difference > 0 ? "▲" : "▼" } ${ formatCount( Math.abs( difference ) ) } against the week before`;
}

const ActivityDisplayComponent: DCommandFunctionComponent<ActivityDisplayProps, ActivityDisplayState> = () => {
    const [ state ] = useCommandState<ActivityDisplayState, ActivityDisplayState>(
        "Home/GuildActivity",
        ( state: ActivityDisplayState ): ActivityDisplayState => ( { guildActivity: state.guildActivity } )
    );

    const activity = state.guildActivity;

    if ( ! activity ) {
        return <div className="text-text-muted text-center py-8">Failed to load this server&apos;s activity</div>;
    }

    const perActiveDay = activity.activeDays ? ( activity.roomsInWindow / activity.activeDays ).toFixed( 1 ) : "0",
        firstDay = activity.days[ 0 ]?.day,
        countingBeganInWindow = !! activity.countedSince && !! firstDay && activity.countedSince > firstDay;

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatCard
                    title="Rooms This Week"
                    value={ formatCount( activity.roomsThisWeek ) }
                    icon={ TrendingUp }
                    description={ describeWeek( activity ) }
                />
                <StatCard
                    title={ `Rooms in ${ DASHBOARD_STATS_WINDOWS.ACTIVITY_DAYS } Days` }
                    value={ formatCount( activity.roomsInWindow ) }
                    icon={ DoorOpen }
                    description={ `${ perActiveDay } on each day with any` }
                />
                <StatCard
                    title="Active Days"
                    value={ `${ activity.activeDays } / ${ DASHBOARD_STATS_WINDOWS.ACTIVITY_DAYS }` }
                    icon={ CalendarRange }
                    description="Days members made at least one room"
                />
                <StatCard
                    title="Busiest Day"
                    value={ activity.busiestDay ? formatCount( activity.busiestDay.count ) : "-" }
                    icon={ Flame }
                    description={ activity.busiestDay ? `Rooms on ${ formatDay( activity.busiestDay.day ) }` : "No rooms yet" }
                />
            </div>

            <div className="bg-surface border border-border rounded-lg p-4">
                <DayBars days={ activity.days } unit="room" countedSince={ activity.countedSince } />

                <p className="text-xs text-text-muted mt-3 mb-0">
                    Rooms members made from this server&apos;s generators, each day (UTC).
                    { countingBeganInWindow && activity.countedSince && (
                        ` Counting began ${ formatDay( activity.countedSince ) } - the dashed days before it were not counted.`
                    ) }
                </p>
            </div>
        </>
    );
};

const ActivityDisplay = withCommands<ActivityDisplayProps, ActivityDisplayState>(
    "Home/GuildActivity",
    ActivityDisplayComponent,
    ACTIVITY_INITIAL_STATE,
    []
);

function ActivitySkeleton() {
    return <div className="bg-surface border border-border rounded-lg h-56 animate-pulse" />;
}

/**
 * How much the server's members use the bot - rooms made, day by day, over the last month.
 */
export function ActivitySection( { guildId }: { guildId: string } ) {
    return (
        <QueryComponent<IGuildActivityStats, ActivityDisplayProps, IGuildActivityStats, ActivityDisplayState>
            fallback={ <ActivitySkeleton /> }
            module={ GuildActivityQuery }
            component={ ActivityDisplay }
            props={ { guildId } }
        />
    );
}

export default ActivitySection;
