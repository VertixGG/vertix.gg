import { Fragment } from "react";

import { useCommandState } from "@zenflux/react-commander/hooks";

import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { formatDate } from "@vertix.gg/dashboard/src/features/home/lib/format";
import { formatCountOf } from "@vertix.gg/dashboard/src/features/statistics/lib/format";
import { resolveTint } from "@vertix.gg/dashboard/src/features/statistics/lib/tint";
import {
    HOURS_GRID_DAY_HOURS,
    HOURS_GRID_QUIET_STRETCH_HOURS,
    HOURS_GRID_WEEKDAY_LABELS,
    buildHoursGrid,
    findBusiestHour,
    findQuietestStretch
} from "@vertix.gg/dashboard/src/features/statistics/lib/hours-grid";

import type { IDashboardHourCount } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import type { IHoursGridSpot } from "@vertix.gg/dashboard/src/features/statistics/lib/hours-grid";
import type { UsageDisplayState } from "@vertix.gg/dashboard/src/features/statistics/types";

/** Every how many hours the axis is labelled. */
const HOUR_LABEL_EVERY = 3;

/** How wide the column of weekday names is, beside the hours. */
const WEEKDAY_COLUMN_WIDTH = "2.5rem";

const HOURS = Array.from( { length: HOURS_GRID_DAY_HOURS }, ( _, hour ) => hour );

function formatHour( hour: number ) {
    return `${ String( hour % HOURS_GRID_DAY_HOURS ).padStart( 2, "0" ) }:00`;
}

function describeSpot( spot: IHoursGridSpot ) {
    return `${ HOURS_GRID_WEEKDAY_LABELS[ spot.row ] } ${ formatHour( spot.hour ) }`;
}

interface HoursGridProps {
    /** Rooms per UTC hour - only the hours that had any. */
    hours: IDashboardHourCount[];
    /** The first hour anything was counted by the hour, or null while nothing has been. */
    hoursCountedSince: string | null;
    /** Whether to name the quietest stretch as well - where a restart is felt least, which only the owner deploys. */
    showQuietest: boolean;
}

/**
 * When in the week rooms are made - a row per weekday, a cell per hour, in the viewer's own time zone.
 *
 * Drawn the same for every server on the owner's statistics and for one server on its home page.
 */
export function HoursGrid( { hours, hoursCountedSince, showQuietest }: HoursGridProps ) {
    const grid = buildHoursGrid( hours ),
        max = Math.max( 0, ... grid.flat() ),
        busiest = findBusiestHour( grid ),
        quietest = findQuietestStretch( grid, HOURS_GRID_QUIET_STRETCH_HOURS ),
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <div className="bg-surface border border-border rounded-lg p-4 overflow-x-auto">
            <div
                className="grid gap-[2px] min-w-[36rem]"
                style={ { gridTemplateColumns: `${ WEEKDAY_COLUMN_WIDTH } repeat( ${ HOURS_GRID_DAY_HOURS }, minmax( 0, 1fr ) )` } }
            >
                <div />

                { HOURS.map( ( hour ) => (
                    <div key={ hour } className="text-[10px] text-text-muted text-center">
                        { 0 === hour % HOUR_LABEL_EVERY ? String( hour ).padStart( 2, "0" ) : "" }
                    </div>
                ) ) }

                { grid.map( ( row, rowIndex ) => (
                    <Fragment key={ HOURS_GRID_WEEKDAY_LABELS[ rowIndex ] }>
                        <div className="text-xs text-text-muted self-center">{ HOURS_GRID_WEEKDAY_LABELS[ rowIndex ] }</div>

                        { row.map( ( count, hour ) => (
                            <div
                                key={ hour }
                                className={ `h-5 rounded-sm ${ count ? resolveTint( count, max ) : "bg-surface-elevated" }` }
                                title={ `${ describeSpot( { row: rowIndex, hour, count } ) } - ${ formatCountOf( count, "room" ) }` }
                            />
                        ) ) }
                    </Fragment>
                ) ) }
            </div>

            { hoursCountedSince && max > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-3">
                    <span className="text-text-secondary">
                        Busiest: <span className="text-text-primary">{ describeSpot( busiest ) }</span>, { formatCountOf( busiest.count, "room" ) }
                    </span>
                    { showQuietest && (
                        <span className="text-text-secondary">
                            Quietest { HOURS_GRID_QUIET_STRETCH_HOURS } hours: <span className="text-text-primary">
                                { describeSpot( quietest ) } - { formatHour( quietest.hour + HOURS_GRID_QUIET_STRETCH_HOURS ) }
                            </span>, { formatCountOf( quietest.count, "room" ) }
                        </span>
                    ) }
                </div>
            ) }

            <p className="text-xs text-text-muted mt-2 mb-0">
                { hoursCountedSince
                    ? `Rooms made over the last ${ DASHBOARD_STATS_WINDOWS.HOURS_DAYS } days, in your time zone (${ timeZone }) - counted by the hour since ${ formatDate( hoursCountedSince ) }.`
                    : "Nothing has been counted by the hour yet." }
            </p>
        </div>
    );
}

/**
 * When in the week rooms are made, across every server. The quietest stretch is where a restart is felt least.
 */
export function BusiestHours() {
    const [ state ] = useCommandState<UsageDisplayState, UsageDisplayState>(
        "Statistics/UsageStats",
        ( state: UsageDisplayState ): UsageDisplayState => ( { usageStats: state.usageStats } )
    );

    const usage = state.usageStats;

    if ( ! usage ) {
        return null;
    }

    return <HoursGrid hours={ usage.roomsPerHour } hoursCountedSince={ usage.hoursCountedSince } showQuietest />;
}

export default BusiestHours;
