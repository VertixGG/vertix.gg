import type {
    IGuildEventRunDetail,
    IGuildEventRunSummary,
    IGuildEventRunsPage,
    IGuildEventsSettingsPatch,
    IGuildEventsSettingsView
} from "@vertix.gg/definitions/src/guild-events-definitions";

import type {
    GuildDiscordChannel,
    GuildDiscordOptions,
    GuildDiscordRole,
    GuildDiscordVoiceChannel
} from "@vertix.gg/dashboard/src/features/generators/types";

export type { GuildDiscordChannel, GuildDiscordOptions, GuildDiscordRole, GuildDiscordVoiceChannel };

export type GuildEventsSettings = IGuildEventsSettingsView;
export type GuildEventsSettingsPatch = IGuildEventsSettingsPatch;
export type GuildEventRunSummary = IGuildEventRunSummary;
export type GuildEventRunDetail = IGuildEventRunDetail;
export type GuildEventRunsPage = IGuildEventRunsPage;

/** Which setting a save in flight is changing, so only its own control waits. */
export type TEventsSetting = keyof GuildEventsSettingsPatch;
