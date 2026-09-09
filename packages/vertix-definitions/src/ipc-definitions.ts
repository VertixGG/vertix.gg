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
    GET_GUILD_OPTIONS: "get_guild_options"
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
}

export interface IPCGuildChannel {
    id: string;
    name: string;
}

export interface GetGuildOptionsResponse {
    roles: IPCGuildRole[];
    textChannels: IPCGuildChannel[];
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
    | GetGuildOptionsRequest;
