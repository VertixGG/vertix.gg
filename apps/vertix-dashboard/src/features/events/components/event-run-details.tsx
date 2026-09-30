import { useEffect } from "react";

import { useCommand, useCommandState } from "@zenflux/react-commander/hooks";

import { AlertTriangle, Loader2, X } from "lucide-react";

import {
    formatGuildEventVoiceTime,
    GUILD_EVENT_ATTENDANCE_KINDS
} from "@vertix.gg/definitions/src/guild-events-definitions";

import {
    EVENTS_ATTENDANCE_SECTIONS,
    EVENTS_PHASE_LABELS,
    EVENTS_TIME
} from "@vertix.gg/dashboard/src/features/events/lib/constants";
import { formatEventDate } from "@vertix.gg/dashboard/src/features/events/lib/format-event-date";

import type { EventsState } from "@vertix.gg/dashboard/src/features/events/commands";
import type { GuildEventRunDetail } from "@vertix.gg/dashboard/src/features/events/types";

interface EventRunDetailsSelectedState {
    openRunId: string | null;
    openRun: GuildEventRunDetail | null;
    runFailed: boolean;
}

function selectDetails( state: EventsState ): EventRunDetailsSelectedState {
    return {
        openRunId: state.openRunId,
        openRun: state.openRun,
        runFailed: state.runFailed
    };
}

/**
 * One event's attendance: who came, who was late, who never came and who walked in, each with
 * their time in voice - the same lists the board in discord ends as.
 */
export function EventRunDetails() {
    const [ state ] = useCommandState<EventsState, EventRunDetailsSelectedState>( "Dashboard/Events", selectDetails );

    const closeRun = useCommand( "Dashboard/Events/CloseRun" );

    const isOpen = null !== state.openRunId;

    useEffect( () => {
        if ( ! isOpen ) {
            return;
        }

        const onKeyDown = ( event: KeyboardEvent ) => {
            if ( "Escape" === event.key ) {
                closeRun.run( {} );
            }
        };

        window.addEventListener( "keydown", onKeyDown );

        return () => window.removeEventListener( "keydown", onKeyDown );
    }, [ isOpen ] );

    if ( ! isOpen ) {
        return null;
    }

    // Drawn only under its own id - a run that finished loading after another was opened is not this one.
    const run = state.openRun?.id === state.openRunId ? state.openRun : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-label={ run?.name ?? "Attendance" }
                className="w-full max-w-lg max-h-[85vh] flex flex-col bg-surface border border-border rounded-lg overflow-hidden"
            >
                <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-text-primary mb-0 truncate">{ run?.name ?? "Attendance" }</h2>
                        { run && (
                            <p className="text-xs text-text-muted mb-0">
                                { formatEventDate( run.occurrenceStartAt ) } · { EVENTS_PHASE_LABELS[ run.phase ] }
                            </p>
                        ) }
                    </div>

                    <button
                        onClick={ () => closeRun.run( {} ) }
                        className="text-text-muted hover:text-text-primary transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    { state.runFailed ? (
                        <div className="py-8 text-center">
                            <AlertTriangle className="w-6 h-6 text-warning mx-auto mb-2" />
                            <p className="text-sm text-text-muted mb-0">Could not load this event&apos;s attendance.</p>
                        </div>
                    ) : ! run ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
                        </div>
                    ) : ! run.attendees.length ? (
                        <p className="text-sm text-text-muted mb-0">Nobody was on the list, and nobody came.</p>
                    ) : (
                        EVENTS_ATTENDANCE_SECTIONS.map( ( section ) => {
                            const members = run.attendees.filter( ( attendee ) => attendee.kind === section.kind );

                            if ( ! members.length ) {
                                return null;
                            }

                            return (
                                <div key={ section.kind }>
                                    <h3 className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">
                                        { section.mark } { section.title } ({ members.length })
                                    </h3>

                                    <ul className="list-none pl-0 mb-0 space-y-1">
                                        { members.map( ( member ) => (
                                            <li key={ member.userId } className="flex items-center justify-between gap-3 text-sm">
                                                <span className="text-text-primary truncate">{ member.displayName ?? member.userId }</span>

                                                { GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW !== member.kind && (
                                                    <span className="text-text-muted tabular-nums shrink-0" title="Time in voice">
                                                        { formatGuildEventVoiceTime( member.voiceSeconds * EVENTS_TIME.MS_PER_SECOND ) }
                                                    </span>
                                                ) }
                                            </li>
                                        ) ) }
                                    </ul>
                                </div>
                            );
                        } )
                    ) }
                </div>
            </div>
        </div>
    );
}

export default EventRunDetails;
