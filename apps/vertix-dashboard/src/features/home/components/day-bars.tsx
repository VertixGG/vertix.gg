import { formatDay } from "@vertix.gg/dashboard/src/features/home/lib/format";

import type { IDashboardDayCount } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface DayBarsProps {
    days: IDashboardDayCount[];
    /** What one of them is - `room`, `install` - for the line each bar says on hover. */
    unit: string;
    /**
     * The first day anything was counted. A day before it is drawn apart from a quiet one: nothing
     * was counted then, which says nothing about how busy it was.
     */
    countedSince?: string | null;
}

const MAX_HEIGHT_PERCENT = 100;

/** The least a bar with anything in it is drawn at, so a single room is not a hairline. */
const MIN_FILLED_PERCENT = 4;

function describe( count: number, unit: string ) {
    return `${ count } ${ unit }${ 1 === count ? "" : "s" }`;
}

/**
 * One bar per day, oldest first - the shape of a month at a glance, each bar saying its day and its
 * count on hover.
 */
export function DayBars( { days, unit, countedSince }: DayBarsProps ) {
    const max = Math.max( 1, ... days.map( ( day ) => day.count ) );

    if ( ! days.length ) {
        return null;
    }

    return (
        <div>
            <div className="flex items-end gap-[2px] h-28" role="img" aria-label={ `${ unit }s per day` }>
                { days.map( ( day ) => {
                    const isUncounted = !! countedSince && day.day < countedSince,
                        height = Math.max( MIN_FILLED_PERCENT, Math.round( day.count / max * MAX_HEIGHT_PERCENT ) ),
                        label = `${ formatDay( day.day ) } - ${ isUncounted ? "not counted yet" : describe( day.count, unit ) }`;

                    let bar = <div className="w-full h-[2px] bg-surface-elevated" />;

                    if ( isUncounted ) {
                        bar = <div className="w-full h-1/3 rounded-t-sm border border-dashed border-border opacity-50" />;
                    } else if ( day.count ) {
                        bar = <div className="w-full rounded-t-sm bg-accent hover:opacity-80" style={ { height: `${ height }%` } } />;
                    }

                    return (
                        <div key={ day.day } className="flex-1 h-full flex items-end" title={ label }>
                            { bar }
                        </div>
                    );
                } ) }
            </div>

            <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>{ formatDay( days[ 0 ].day ) }</span>
                <span>{ formatDay( days[ days.length - 1 ].day ) }</span>
            </div>
        </div>
    );
}

export default DayBars;
