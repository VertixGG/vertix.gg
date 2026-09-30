import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { CalendarCheck, Loader2 } from "lucide-react";

import {
    EVENTS_ATTENDANCE_SECTIONS,
    EVENTS_PHASE_LABELS
} from "@vertix.gg/dashboard/src/features/events/lib/constants";
import { formatEventDate } from "@vertix.gg/dashboard/src/features/events/lib/format-event-date";

import type { EventsState } from "@vertix.gg/dashboard/src/features/events/commands";
import type { GuildEventRunSummary } from "@vertix.gg/dashboard/src/features/events/types";

interface EventsHistorySelectedState {
    runs: GuildEventRunSummary[];
    nextCursor: string | null;
    isLoadingRuns: boolean;
    openRunId: string | null;
}

function selectHistory( state: EventsState ): EventsHistorySelectedState {
    return {
        runs: state.runs,
        nextCursor: state.nextCursor,
        isLoadingRuns: state.isLoadingRuns,
        openRunId: state.openRunId
    };
}

/**
 * Every event Events has run in the server, newest first - opening one shows who came.
 */
export function EventsHistory() {
    const [ state ] = useCommandState<EventsState, EventsHistorySelectedState>( "Dashboard/Events", selectHistory );

    const openRun = useCommand( "Dashboard/Events/OpenRun" );
    const loadMore = useCommand( "Dashboard/Events/LoadMoreRuns" );

    return (
        <section className="bg-surface border border-border rounded-lg min-w-0">
            <div className="px-5 py-4 border-b border-border-muted">
                <h2 className="text-lg font-semibold text-text-primary mb-0">History</h2>
                <p className="text-xs text-text-muted mb-0">
                    Every event from the moment its check-in opened. Open one to see who came.
                </p>
            </div>

            { ! state.runs.length ? (
                <div className="m-5 px-4 py-10 border border-dashed border-border rounded-lg text-center">
                    <CalendarCheck className="w-6 h-6 text-text-muted mx-auto mb-2" />
                    <p className="text-sm text-text-muted mb-0">
                        No events yet. Once Events is on, each scheduled voice event shows up here as its check-in opens.
                    </p>
                </div>
            ) : (
                <ul className="list-none pl-0 mb-0 divide-y divide-border-muted">
                    { state.runs.map( ( run ) => (
                        <li key={ run.id }>
                            <button
                                onClick={ () => openRun.run( { runId: run.id } ) }
                                className={ `w-full text-left px-5 py-3 hover:bg-surface-hover transition-colors
                                    ${ state.openRunId === run.id ? "bg-surface-elevated" : "" }` }
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium text-text-primary truncate">{ run.name }</span>
                                    <span className="text-xs text-text-muted shrink-0">{ EVENTS_PHASE_LABELS[ run.phase ] }</span>
                                </div>

                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-text-muted">
                                    <span>{ formatEventDate( run.occurrenceStartAt ) }</span>

                                    { EVENTS_ATTENDANCE_SECTIONS.map( ( section ) => (
                                        <span key={ section.kind } title={ section.title }>
                                            { section.mark } { run.counts[ section.kind ] }
                                        </span>
                                    ) ) }
                                </div>
                            </button>
                        </li>
                    ) ) }
                </ul>
            ) }

            { state.nextCursor && (
                <div className="px-5 py-3 border-t border-border-muted">
                    <button
                        onClick={ () => loadMore.run( {} ) }
                        disabled={ state.isLoadingRuns }
                        className="inline-flex items-center gap-2 bg-surface-elevated hover:bg-surface-hover border border-border
                            hover:border-border-accent text-text-accent text-sm rounded-md px-4 py-2 transition-colors
                            disabled:opacity-50"
                    >
                        { state.isLoadingRuns && <Loader2 className="w-4 h-4 animate-spin" /> }
                        Load more
                    </button>
                </div>
            ) }
        </section>
    );
}

export default EventsHistory;
