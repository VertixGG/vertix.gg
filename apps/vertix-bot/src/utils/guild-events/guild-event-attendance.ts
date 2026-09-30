import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import {
    formatGuildEventVoiceTime,
    GUILD_EVENT_ATTENDANCE_KINDS,
    GUILD_EVENTS_LIMITS,
    resolveGuildEventAttendanceKind
} from "@vertix.gg/definitions/src/guild-events-definitions";

/** One member's part in a run, as it is kept while the run is open. */
export interface IGuildEventAttendeeState {
    userId: string;
    /** On the event's "Interested" list. */
    interested: boolean;
    checkedInAt: number | null;
    late: boolean;
    noShow: boolean;
    /** Time over every visit that has ended. */
    voiceMs: number;
    /** When the visit still going began, or null when they are not there. */
    sessionStartedAt: number | null;
}

/** A list as a board draws it: the lines it shows, and how many more there are than it shows. */
export interface IGuildEventBoardList {
    lines: string[];
    count: number;
    hiddenCount: number;
}

export interface IGuildEventBoardLists {
    checkedIn: IGuildEventBoardList;
    waiting: IGuildEventBoardList;
    onTime: IGuildEventBoardList;
    late: IGuildEventBoardList;
    noShow: IGuildEventBoardList;
    walkIns: IGuildEventBoardList;
}

const LINE_SEPARATOR = " · ";

const MS_PER_SECOND = 1000;

/**
 * Who came to a run, when, and for how long - the arithmetic of it, kept apart from anything that
 * reads or writes, so each rule can be pinned down on its own.
 *
 * Presence is always read off where a member is now, never off which event said they moved: on a
 * switch between two channels the join and the leave are both announced, carrying the same state,
 * and either one arriving has to leave the same result.
 */
export class GuildEventAttendance extends InitializeBase {
    private static instance: GuildEventAttendance;

    public static getName() {
        return "VertixBot/Utils/GuildEventAttendance";
    }

    public static get $() {
        if ( ! GuildEventAttendance.instance ) {
            GuildEventAttendance.instance = new GuildEventAttendance();
        }

        return GuildEventAttendance.instance;
    }

    public constructor() {
        super();
    }

    public createAttendee( userId: string, interested = false ): IGuildEventAttendeeState {
        return {
            userId,
            interested,
            checkedInAt: null,
            late: false,
            noShow: false,
            voiceMs: 0,
            sessionStartedAt: null
        };
    }

    /**
     * Function observe() :: Bring a member's attendance in line with whether they are there now.
     *
     * Returns null when nothing changed, which is most of the time: every sweep and every move in
     * the event's channels asks, and only the first arrival or a departure is news.
     *
     * Somebody on a frozen roster who comes after all stops being a no-show and is late instead.
     */
    public observe(
        attendee: IGuildEventAttendeeState,
        isPresent: boolean,
        now: number,
        isFrozen: boolean
    ): IGuildEventAttendeeState | null {
        if ( isPresent && null === attendee.sessionStartedAt ) {
            const isFirstArrival = null === attendee.checkedInAt;

            return {
                ... attendee,
                sessionStartedAt: now,
                checkedInAt: isFirstArrival ? now : attendee.checkedInAt,
                late: attendee.late || ( isFirstArrival && isFrozen && attendee.interested ),
                noShow: false
            };
        }

        if ( ! isPresent && null !== attendee.sessionStartedAt ) {
            return {
                ... attendee,
                voiceMs: attendee.voiceMs + Math.max( 0, now - attendee.sessionStartedAt ),
                sessionStartedAt: null
            };
        }

        return null;
    }

    /**
     * Function creditUpTo() :: Close a visit that ended while nobody was watching.
     *
     * For a member gone by the time the bot came back: credited up to the last moment the run was
     * looked at, since when exactly they left cannot be known.
     */
    public creditUpTo( attendee: IGuildEventAttendeeState, at: number ): IGuildEventAttendeeState {
        if ( null === attendee.sessionStartedAt ) {
            return attendee;
        }

        return {
            ... attendee,
            voiceMs: attendee.voiceMs + Math.max( 0, at - attendee.sessionStartedAt ),
            sessionStartedAt: null
        };
    }

    /**
     * Function freeze() :: Mark who said they would come, and which of them had not.
     */
    public freeze( attendees: Map<string, IGuildEventAttendeeState>, rosterIds: Iterable<string> ) {
        for ( const userId of rosterIds ) {
            const attendee = attendees.get( userId ) ?? this.createAttendee( userId );

            attendees.set( userId, {
                ... attendee,
                interested: true,
                noShow: null === attendee.checkedInAt
            } );
        }

        return attendees;
    }

    /**
     * Function countSubsNeeded() :: How many places the "need a sub" post asks for.
     *
     * The no-shows, but never more than the channel has room for: a channel with a limit that is
     * already full needs nobody, however many never came.
     */
    public countSubsNeeded( noShowCount: number, freeSeats: number | null ) {
        return Math.max( 0, null === freeSeats ? noShowCount : Math.min( noShowCount, freeSeats ) );
    }

    /**
     * Function countStillNeeded() :: How many of the places asked for are still open.
     *
     * Anybody who arrives once the roster froze fills one - somebody from the roster who is late, or
     * somebody who saw the post.
     */
    public countStillNeeded( subsNeeded: number, attendees: Iterable<IGuildEventAttendeeState>, frozenAt: number ) {
        let arrived = 0;

        for ( const attendee of attendees ) {
            if ( null !== attendee.checkedInAt && attendee.checkedInAt >= frozenAt ) {
                arrived++;
            }
        }

        return Math.max( 0, subsNeeded - arrived );
    }

    public getVoiceMs( attendee: IGuildEventAttendeeState, now: number ) {
        return attendee.voiceMs + ( null === attendee.sessionStartedAt ? 0 : Math.max( 0, now - attendee.sessionStartedAt ) );
    }

    /**
     * Function formatDuration() :: Time in voice as hours and minutes, `1:05` - the way the dashboard
     * writes it too.
     */
    public formatDuration( ms: number ) {
        return formatGuildEventVoiceTime( ms );
    }

    /**
     * Function buildLists() :: Everybody on the board, sorted into the lists it draws.
     *
     * Before the roster froze a board only knows who is in and who on the roster is not yet; after,
     * whoever came is on time or late, the rest of the roster never came, and anybody who came
     * without being on it walked in. Everybody who came is listed longest first.
     *
     * `withTimes` is for the attendance a finished run ends as. A board still going leaves the times
     * out: they would change the text every minute, and so the message with it.
     *
     * `minVoiceMs` is the least time in voice that counts as having come, and it is only held to once
     * the run is over: until then nobody's time is final, and somebody who just arrived is there.
     */
    public buildLists(
        attendees: Iterable<IGuildEventAttendeeState>,
        rosterIds: Iterable<string>,
        now: number,
        withTimes: boolean,
        minVoiceMs = 0
    ): IGuildEventBoardLists {
        const all = [ ... attendees ],
            byId = new Map( all.map( ( attendee ) => [ attendee.userId, attendee ] ) ),
            roster = new Set( rosterIds );

        const came = all
                .filter( ( attendee ) => null !== attendee.checkedInAt )
                .sort( ( a, b ) => this.getVoiceMs( b, now ) - this.getVoiceMs( a, now ) ),
            kindOf = ( attendee: IGuildEventAttendeeState ) => resolveGuildEventAttendanceKind( {
                interested: attendee.interested,
                hasCheckedIn: null !== attendee.checkedInAt,
                late: attendee.late,
                voiceSeconds: Math.floor( this.getVoiceMs( attendee, now ) / MS_PER_SECOND ),
                minVoiceSeconds: withTimes ? Math.floor( minVoiceMs / MS_PER_SECOND ) : 0
            } ),
            plain = ( userId: string ) => `<@${ userId }>`,
            line = ( attendee: IGuildEventAttendeeState ) => withTimes
                ? `${ plain( attendee.userId ) }${ LINE_SEPARATOR }${ this.formatDuration( this.getVoiceMs( attendee, now ) ) }`
                : plain( attendee.userId );

        return {
            checkedIn: this.toList( came.map( ( attendee ) => plain( attendee.userId ) ) ),
            waiting: this.toList( [ ... roster ].filter( ( userId ) => ! byId.get( userId )?.checkedInAt ).map( plain ) ),
            onTime: this.toList( came.filter( ( attendee ) => GUILD_EVENT_ATTENDANCE_KINDS.CAME === kindOf( attendee ) ).map( line ) ),
            late: this.toList( came.filter( ( attendee ) => GUILD_EVENT_ATTENDANCE_KINDS.LATE === kindOf( attendee ) ).map( line ) ),
            noShow: this.toList( all.filter( ( attendee ) => GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW === kindOf( attendee ) ).map( ( attendee ) => plain( attendee.userId ) ) ),
            walkIns: this.toList( came.filter( ( attendee ) => GUILD_EVENT_ATTENDANCE_KINDS.WALK_IN === kindOf( attendee ) ).map( line ) )
        };
    }

    private toList( lines: string[] ): IGuildEventBoardList {
        return {
            lines: lines.slice( 0, GUILD_EVENTS_LIMITS.BOARD_LIST_MAX ),
            count: lines.length,
            hiddenCount: Math.max( 0, lines.length - GUILD_EVENTS_LIMITS.BOARD_LIST_MAX )
        };
    }
}
