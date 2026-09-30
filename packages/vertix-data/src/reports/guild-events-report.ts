import { DASHBOARD_STATS_LIMITS } from "@vertix.gg/definitions/src/dashboard-stats-definitions";
import {
    GUILD_EVENT_ATTENDANCE_KINDS,
    GUILD_EVENT_RUN_PHASES,
    resolveGuildEventAttendanceKind
} from "@vertix.gg/definitions/src/guild-events-definitions";

import type {
    IGuildEventsRegular,
    IGuildEventsStats
} from "@vertix.gg/definitions/src/dashboard-stats-definitions";

/**
 * How a server's events went - who came, who did not, and who keeps coming.
 *
 * Every member is sorted by the one attendance rule the board and the Events page use, held to the
 * least time in voice each run ended with, so the home page never counts somebody the attendance
 * says did not come.
 */

/** A run, as far as its attendance needs it. */
export interface IGuildEventsReportRun {
    id: string;
    phase: string;
    minVoiceSeconds: number | null;
}

/** A member's part in a run, as far as their attendance needs it. */
export interface IGuildEventsReportAttendee {
    runId: string;
    userId: string;
    displayName: string | null;
    interested: boolean;
    checkedInAt: Date | null;
    late: boolean;
    voiceSeconds: number;
}

/**
 * Function buildGuildEventsStats() :: What the events that ended add up to.
 *
 * Only an ended run is counted: one still going has no final attendance, and a canceled one has none
 * at all. A regular is somebody who came, most often first; a tie goes to whoever missed fewer.
 */
export function buildGuildEventsStats( options: {
    runs: IGuildEventsReportRun[];
    attendees: IGuildEventsReportAttendee[];
    isEnabled: boolean;
} ): IGuildEventsStats {
    const ended = new Map(
        options.runs
            .filter( ( run ) => GUILD_EVENT_RUN_PHASES.ENDED === run.phase )
            .map( ( run ) => [ run.id, run ] )
    );

    const stats: IGuildEventsStats = {
            isEnabled: options.isEnabled,
            held: ended.size,
            expected: 0,
            came: 0,
            late: 0,
            noShows: 0,
            walkIns: 0,
            regulars: []
        },
        members = new Map<string, IGuildEventsRegular>();

    for ( const attendee of options.attendees ) {
        const run = ended.get( attendee.runId );

        if ( ! run ) {
            continue;
        }

        const kind = resolveGuildEventAttendanceKind( {
            interested: attendee.interested,
            hasCheckedIn: null !== attendee.checkedInAt,
            late: attendee.late,
            voiceSeconds: attendee.voiceSeconds,
            minVoiceSeconds: run.minVoiceSeconds ?? 0
        } );

        if ( ! kind ) {
            continue;
        }

        if ( attendee.interested ) {
            stats.expected++;
        }

        const member = members.get( attendee.userId ) ?? {
            userId: attendee.userId,
            displayName: null,
            attended: 0,
            noShows: 0
        };

        member.displayName = attendee.displayName ?? member.displayName;

        switch ( kind ) {
            case GUILD_EVENT_ATTENDANCE_KINDS.CAME:
                stats.came++;
                member.attended++;
                break;

            case GUILD_EVENT_ATTENDANCE_KINDS.LATE:
                stats.late++;
                member.attended++;
                break;

            case GUILD_EVENT_ATTENDANCE_KINDS.WALK_IN:
                stats.walkIns++;
                member.attended++;
                break;

            case GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW:
                stats.noShows++;
                member.noShows++;
                break;
        }

        members.set( attendee.userId, member );
    }

    stats.regulars = [ ... members.values() ]
        .filter( ( member ) => member.attended > 0 )
        .sort( ( a, b ) => b.attended - a.attended || a.noShows - b.noShows )
        .slice( 0, DASHBOARD_STATS_LIMITS.REGULARS_MAX );

    return stats;
}
