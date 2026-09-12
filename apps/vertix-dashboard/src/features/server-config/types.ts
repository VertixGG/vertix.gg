import type {
    GuildTimingsInterface,
    TGuildTimingsOverrides
} from "@vertix.gg/definitions/src/guild-timings-definitions";

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
    timings: ServerConfigTimings;
}

/**
 * What the guild chose for its claim, and what it runs on having chosen nothing.
 *
 * Both in milliseconds. Held apart so a field can show the inherited value while staying empty,
 * which is how the screen says a timing is followed rather than chosen.
 */
export interface ServerConfigTimings {
    overrides: TGuildTimingsOverrides;
    defaults: GuildTimingsInterface;
}

/**
 * What a save carries.
 *
 * `timings` narrows to the guild's own choices: the defaults travel the other way only, since they
 * are the bot's own configuration and nothing here may set them.
 */
export type ServerConfigInput = Partial<Omit<ServerConfig, "timings">> & {
    timings?: TGuildTimingsOverrides;
};
