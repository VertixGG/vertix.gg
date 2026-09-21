import type { GetScalingChannelInfoRequest } from "@vertix.gg/definitions/src/scaling-channel-ipc-definitions";
import type { GetDynamicChannelInfoRequest } from "@vertix.gg/definitions/src/dynamic-channel-ipc-definitions";

export const IPC_CHANNELS = {
    MANAGEMENT: "vertix:management",
    MANAGEMENT_REQUEST: "vertix:management:request",
    MANAGEMENT_RESPONSE: "vertix:management:response"
} as const;

export const IPC_REQUEST_ACTIONS = {
    GET_SCALING_CHANNEL_INFO: "get_scaling_channel_info",
    GET_DYNAMIC_CHANNEL_INFO: "get_dynamic_channel_info",
    GET_GUILD_OPTIONS: "get_guild_options",
    GET_CONFIG_LIMITS: "get_config_limits",
    GET_GENERATOR_DEFAULTS: "get_generator_defaults"
} as const;

/**
 * The roles and channels a guild's settings can point at.
 *
 * Asked of the bot rather than fetched over rest: the bot is the process that is actually in the
 * guild and already holds them, while the api's own token may belong to an application that was
 * never invited there.
 */
export interface GetGuildOptionsRequest {
    action: typeof IPC_REQUEST_ACTIONS.GET_GUILD_OPTIONS;
    guildId: string;
}

/**
 * Why the bot cannot hand a role out.
 *
 * Codes rather than sentences, because the two screens that report this say it differently: the
 * missing permission is named as a permission in discord and as a reason in the dashboard. The
 * code is the part that has to agree, and it is what `isRoleAssignable()` answers with.
 */
export const ROLE_UNASSIGNABLE_REASONS = {
    UNKNOWN_BOT_MEMBER: "unknown-bot-member",
    MISSING_MANAGE_ROLES: "missing-manage-roles",
    MANAGED_ROLE: "managed-role",
    EVERYONE_ROLE: "everyone-role",
    ROLE_ABOVE_BOT: "role-above-bot"
} as const;

export type TRoleUnassignableReason =
    typeof ROLE_UNASSIGNABLE_REASONS[ keyof typeof ROLE_UNASSIGNABLE_REASONS ];

export interface IPCGuildRole {
    id: string;
    name: string;
    color: number;
    /**
     * Whether discord or an app owns this role, and so whether anybody can hand it out.
     *
     * Carried rather than filtered on, because whether it disqualifies a role depends on what is
     * being asked of it - and only the caller knows that. A setting the bot gives a member a role
     * for cannot use a managed one; a setting that only asks whether a member already holds one is
     * free to, and `Nitro Booster` is managed.
     */
    managed: boolean;
    /**
     * Whether the bot could actually give this role to somebody, and why not when it could not.
     *
     * Wider than `managed`: it also covers the permission the bot needs, the everyone role, and a
     * role sitting above the bot in the list. Only the bot can answer it - the api's own token may
     * belong to an application that was never invited to the guild, so it cannot resolve the bot's
     * member or its highest role - which is why both are optional. Absent is "not known", and a
     * picker should allow rather than refuse on it; the bot checks again before it assigns.
     */
    assignable?: boolean;
    reason?: TRoleUnassignableReason;
}

export interface IPCGuildChannel {
    id: string;
    name: string;
}

export interface GetGuildOptionsResponse {
    roles: IPCGuildRole[];
    textChannels: IPCGuildChannel[];
}

/**
 * The limits that apply to one guild, asked of the bot rather than read a second time.
 *
 * Named per guild because a limit is not the configuration's alone: a guild that was granted its
 * own allowance carries it, and the configured number is what the rest fall back to. Asking is
 * what keeps that in one place - the api holds no copy of a limit, no copy of the key one is filed
 * under, and no copy of which of the two wins, so none of them can drift from what is applied.
 */
export interface GetConfigLimitsRequest {
    action: typeof IPC_REQUEST_ACTIONS.GET_CONFIG_LIMITS;
    guildId: string;
}

/**
 * What a generator of this interface version is created with, asked of the bot.
 *
 * Asked rather than written down a second time. The api fills a form with these wherever a
 * generator has never stored a choice of its own, so a copy kept here would be a second set of
 * defaults that nobody compares - and the two did drift: the api had auto save on and mentionable
 * off while the bot had the opposite, which a dashboard saving that form would have written in.
 *
 * Per version, because v2 and v3 are created with different sets.
 */
export interface GetGeneratorDefaultsRequest {
    action: typeof IPC_REQUEST_ACTIONS.GET_GENERATOR_DEFAULTS;
    version: string;
}

export interface GetGeneratorDefaultsResponse {
    /**
     * The configuration as the bot holds it, unshaped: it is the bot's to describe, and the api
     * reads the handful of keys it shows the way it already reads a stored row.
     */
    settings: Record<string, unknown>;
}

export interface GetConfigLimitsResponse {
    /**
     * How many generators a guild may have, or null for no ceiling.
     *
     * Null rather than a very large number, because an unlimited allowance is `Infinity` on the bot
     * and `JSON.stringify` turns that into null anyway - said here so the reader is written for it
     * rather than meeting it.
     */
    maxMasterChannels: number | null;
}

export interface IPCDiscordChannelInfo {
    id: string;
    name: string;
    memberCount: number;
    position: number;
    /**
     * The channel's own limit, `0` for none. Absent on anything that is not a voice channel.
     *
     * A generator hands this to the dynamic channels it makes when they have no default of their
     * own, so the screens need it to name the number rather than only the rule.
     */
    userLimit?: number;
}

export type IPCManagementRequestPayload =
    | GetScalingChannelInfoRequest
    | GetDynamicChannelInfoRequest
    | GetGuildOptionsRequest
    | GetConfigLimitsRequest
    | GetGeneratorDefaultsRequest;
