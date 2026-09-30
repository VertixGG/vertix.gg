import type {
    GuildDiscordChannel,
    GuildDiscordRole,
    GuildDiscordVoiceChannel,
    GuildEventRunDetail,
    GuildEventRunSummary,
    GuildEventsSettings,
    TEventsSetting
} from "@vertix.gg/dashboard/src/features/events/types";

export interface EventsState {
    guildId: string | null;
    /** How Events is set in the server. Null until it is loaded. */
    settings: GuildEventsSettings | null;
    /**
     * The plain text channels Events can post in, or null when Discord could not be asked. Announcement
     * channels are left out: the bot does not post boards there.
     */
    channels: GuildDiscordChannel[] | null;
    /** The voice and stage channels an event can be held in, or null when Discord could not be asked. */
    voiceChannels: GuildDiscordVoiceChannel[] | null;
    /** The roles Events can ping - every one but @everyone - or null when Discord could not be asked. */
    roles: GuildDiscordRole[] | null;
    isLoading: boolean;
    /** The load answered nothing - told apart from still waiting for it. */
    loadFailed: boolean;
    /** The setting a save in flight is changing, if one is. */
    pendingSetting: TEventsSetting | null;
    error: string | null;
    /** What a refused save came back with - the permissions the bot lacks, for one. */
    reasons: string[];

    /** The history so far, newest first. */
    runs: GuildEventRunSummary[];
    /** Where the next page starts, or null when there is no more. */
    nextCursor: string | null;
    isLoadingRuns: boolean;

    /** The run whose attendance is open, and its attendance once it is loaded. */
    openRunId: string | null;
    openRun: GuildEventRunDetail | null;
    isLoadingRun: boolean;
    runFailed: boolean;
}

export const EVENTS_INITIAL_STATE: EventsState = {
    guildId: null,
    settings: null,
    channels: null,
    voiceChannels: null,
    roles: null,
    isLoading: false,
    loadFailed: false,
    pendingSetting: null,
    error: null,
    reasons: [],
    runs: [],
    nextCursor: null,
    isLoadingRuns: false,
    openRunId: null,
    openRun: null,
    isLoadingRun: false,
    runFailed: false
};
