import { useCommandState } from "@zenflux/react-commander/hooks";
import { withCommands } from "@zenflux/react-commander/with-commands";
import { QueryComponent } from "@zenflux/react-commander/query/component";

import { Link } from "react-router-dom";

import { ArrowRight, CalendarCheck, Footprints, UserCheck, UserX } from "lucide-react";

import { DASHBOARD_STATS_WINDOWS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

import { GuildEventsStatsQuery } from "@vertix.gg/dashboard/src/features/home/query/guild-events-stats-query";
import { StatCard } from "@vertix.gg/dashboard/src/features/home/components/stat-card";
import { formatCount, formatShare } from "@vertix.gg/dashboard/src/features/home/lib/format";

import type { DCommandFunctionComponent } from "@zenflux/react-commander/definitions";
import type { IGuildEventsStats } from "@vertix.gg/definitions/src/dashboard-stats-definitions";

interface EventsStatsDisplayProps {
    guildId: string;
}

interface EventsStatsDisplayState {
    guildEventsStats: IGuildEventsStats | null;
}

const EVENTS_STATS_INITIAL_STATE: EventsStatsDisplayState = {
    guildEventsStats: null
};

function OpenEventsLink( { label }: { label: string } ) {
    return (
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-text-accent hover:underline">
            { label }
            <ArrowRight className="w-4 h-4" />
        </Link>
    );
}

const EventsStatsDisplayComponent: DCommandFunctionComponent<EventsStatsDisplayProps, EventsStatsDisplayState> = () => {
    const [ state ] = useCommandState<EventsStatsDisplayState, EventsStatsDisplayState>(
        "Home/GuildEventsStats",
        ( state: EventsStatsDisplayState ): EventsStatsDisplayState => ( { guildEventsStats: state.guildEventsStats } )
    );

    const stats = state.guildEventsStats;

    if ( ! stats ) {
        return <div className="text-text-muted text-center py-8">Failed to load this server&apos;s events</div>;
    }

    if ( ! stats.held ) {
        return (
            <div className="bg-surface border border-border rounded-lg p-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-muted mb-0">
                    { stats.isEnabled
                        ? `No event has ended in the last ${ DASHBOARD_STATS_WINDOWS.EVENTS_DAYS } days - once one does, its turnout shows here.`
                        : "Events is off. Turn it on to take attendance at your scheduled voice events - who came, who didn't, and who always does." }
                </p>
                <OpenEventsLink label={ stats.isEnabled ? "Open Events" : "Set up Events" } />
            </div>
        );
    }

    const turnedUp = stats.came + stats.late;

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatCard
                    title="Events Held"
                    value={ formatCount( stats.held ) }
                    icon={ CalendarCheck }
                    description={ `In the last ${ DASHBOARD_STATS_WINDOWS.EVENTS_DAYS } days` }
                />
                <StatCard
                    title="Turnout"
                    value={ `${ formatShare( turnedUp, stats.expected ) }%` }
                    icon={ UserCheck }
                    description={ `${ formatCount( turnedUp ) } of ${ formatCount( stats.expected ) } who said they'd come - ${ formatCount( stats.late ) } late` }
                />
                <StatCard
                    title="No-shows"
                    value={ formatCount( stats.noShows ) }
                    icon={ UserX }
                    description={ `${ formatShare( stats.noShows, stats.expected ) }% of everyone on the lists` }
                />
                <StatCard
                    title="Walk-ins"
                    value={ formatCount( stats.walkIns ) }
                    icon={ Footprints }
                    description="Came without pressing Interested"
                />
            </div>

            <div className="bg-surface border border-border rounded-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border-muted">
                    <div>
                        <h3 className="text-sm font-semibold text-text-primary mb-0">Regulars</h3>
                        <p className="text-xs text-text-muted mb-0">Who comes most often</p>
                    </div>
                    <OpenEventsLink label="Every event" />
                </div>

                <ol className="list-none pl-0 mb-0 divide-y divide-border-muted">
                    { stats.regulars.map( ( member, index ) => (
                        <li key={ member.userId } className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                            <span className="flex items-center gap-3 min-w-0">
                                <span className="text-text-muted tabular-nums w-4 shrink-0">{ index + 1 }</span>
                                <span className="text-text-primary truncate">{ member.displayName ?? member.userId }</span>
                            </span>
                            <span className="text-text-muted shrink-0">
                                { formatCount( member.attended ) } of { formatCount( stats.held ) } events
                                { member.noShows ? ` · missed ${ formatCount( member.noShows ) }` : "" }
                            </span>
                        </li>
                    ) ) }
                </ol>
            </div>
        </>
    );
};

const EventsStatsDisplay = withCommands<EventsStatsDisplayProps, EventsStatsDisplayState>(
    "Home/GuildEventsStats",
    EventsStatsDisplayComponent,
    EVENTS_STATS_INITIAL_STATE,
    []
);

function EventsStatsSkeleton() {
    return <div className="bg-surface border border-border rounded-lg h-24 animate-pulse" />;
}

/**
 * How the server's scheduled events went - turnout, no-shows, walk-ins, and who always comes.
 */
export function EventsStatsSection( { guildId }: { guildId: string } ) {
    return (
        <QueryComponent<IGuildEventsStats, EventsStatsDisplayProps, IGuildEventsStats, EventsStatsDisplayState>
            fallback={ <EventsStatsSkeleton /> }
            module={ GuildEventsStatsQuery }
            component={ EventsStatsDisplay }
            props={ { guildId } }
        />
    );
}

export default EventsStatsSection;
