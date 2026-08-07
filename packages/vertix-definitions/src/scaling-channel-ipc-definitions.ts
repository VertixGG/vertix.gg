import type { IPC_REQUEST_ACTIONS, IPCDiscordChannelInfo } from "@vertix.gg/definitions/src/ipc-definitions";

export interface CreateScalingSetupPayload {
    guildId: string;
    userOwnerId: string;
    prefix?: string;
    maxMembers?: number;
}

export interface UpdateScalingSettingsPayload {
    guildId: string;
    masterChannelId: string;
    settings: {
        scalingChannelPrefix?: string;
        scalingChannelMaxMembersPerChannel?: number;
        scalingChannelMinAvailableChannels?: number;
        scalingChannelCategoryId?: string | null;
    };
}

export interface TriggerReindexPayload {
    guildId: string;
    masterChannelId: string;
}

export interface TriggerCleanupPayload {
    guildId: string;
    masterChannelId: string;
}

export interface DeleteScalingSetupPayload {
    guildId: string;
    masterChannelId: string;
}

export interface GetScalingChannelInfoRequest {
    action: typeof IPC_REQUEST_ACTIONS.GET_SCALING_CHANNEL_INFO;
    guildId: string;
    masterChannelId: string;
    scalingChannelIds: string[];
}

export interface GetScalingChannelInfoResponse {
    masterChannel: IPCDiscordChannelInfo | null;
    category: IPCDiscordChannelInfo | null;
    scalingChannels: IPCDiscordChannelInfo[];
}
