import type { GuildDiscordOptions } from "@vertix.gg/dashboard/src/features/generators/types";

export type { GuildDiscordOptions };

/**
 * The server wide defaults, exactly as stored.
 *
 * Empty is the unset state rather than an empty choice, and what it falls back to differs per
 * setting: the verified roles resolve to `@everyone`, the staff roles to nobody, and the badwords
 * to the list the bot ships with. The screens have to say which, so nothing is resolved here.
 */
export interface ServerConfig {
    voiceRoleId: string | null;
    verifiedRoleIds: string[];
    staffRoleIds: string[];
    badwords: string[];
}

export type ServerConfigInput = Partial<ServerConfig>;
