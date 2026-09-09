import type { ServerConfig, GuildDiscordOptions } from "@vertix.gg/dashboard/src/features/server-config/types";

export interface ServerConfigState {
    guildId: string | null;
    /** The stored values, or null until the guild is loaded. */
    config: ServerConfig | null;
    /** The roles the forms offer, so they name a role rather than asking for an id. */
    discordOptions: GuildDiscordOptions | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
}

export const SERVER_CONFIG_INITIAL_STATE: ServerConfigState = {
    guildId: null,
    config: null,
    discordOptions: null,
    isLoading: false,
    isSaving: false,
    error: null
};
