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
    GET_CONFIG_LIMITS: "get_config_limits"
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

export interface GetConfigLimitsResponse {
    /** How many dynamic generators a guild may have. */
    maxMasterChannels: number;
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
    | GetConfigLimitsRequest;
