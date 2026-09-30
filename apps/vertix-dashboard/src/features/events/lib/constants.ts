import {
    GUILD_EVENT_ATTENDANCE_KINDS,
    GUILD_EVENT_RUN_PHASES,
    GUILD_EVENTS_ERRORS
} from "@vertix.gg/definitions/src/guild-events-definitions";

import type {
    TGuildEventAttendanceKind,
    TGuildEventRunPhase
} from "@vertix.gg/definitions/src/guild-events-definitions";

/** What each stored failure means, in the words the settings screen in discord uses for it. */
export const EVENTS_ERROR_MESSAGES: Record<string, string> = {
    [ GUILD_EVENTS_ERRORS.POST_CHANNEL_MISSING ]: "The channel Events posts in is gone - pick another.",
    [ GUILD_EVENTS_ERRORS.POST_CHANNEL_FORBIDDEN ]:
        "The bot cannot post in that channel. It needs View Channel, Send Messages and Embed Links there.",
    [ GUILD_EVENTS_ERRORS.EVENT_CHANNEL_FORBIDDEN ]:
        "The bot could not see an event's voice channel, so it could not check anybody in. Give it View Channel there."
};

/** What a run's phase is called in the history. */
export const EVENTS_PHASE_LABELS: Record<TGuildEventRunPhase, string> = {
    [ GUILD_EVENT_RUN_PHASES.CHECK_IN ]: "Check-in",
    [ GUILD_EVENT_RUN_PHASES.RUNNING ]: "Under way",
    [ GUILD_EVENT_RUN_PHASES.ENDED ]: "Ended",
    [ GUILD_EVENT_RUN_PHASES.CANCELED ]: "Canceled"
};

/** Each kind of attendance, in the order the attendance lists them, with its heading and mark. */
export const EVENTS_ATTENDANCE_SECTIONS: readonly { kind: TGuildEventAttendanceKind; title: string; mark: string }[] = [
    { kind: GUILD_EVENT_ATTENDANCE_KINDS.CAME, title: "Came", mark: "✅" },
    { kind: GUILD_EVENT_ATTENDANCE_KINDS.LATE, title: "Late", mark: "🕒" },
    { kind: GUILD_EVENT_ATTENDANCE_KINDS.NO_SHOW, title: "Didn't come", mark: "❌" },
    { kind: GUILD_EVENT_ATTENDANCE_KINDS.WALK_IN, title: "Walked in", mark: "👋" }
];

const MS_PER_SECOND = 1000;

export const EVENTS_TIME = {
    MS_PER_SECOND
} as const;
