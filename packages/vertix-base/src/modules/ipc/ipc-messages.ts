export const IPC_CHANNELS = {
    MANAGEMENT: "vertix:management",
    MANAGEMENT_REQUEST: "vertix:management:request",
    MANAGEMENT_RESPONSE: "vertix:management:response"
} as const;

export type IPCChannel = typeof IPC_CHANNELS[ keyof typeof IPC_CHANNELS ];

export const MANAGEMENT_ACTIONS = {
    CREATE_SCALING_SETUP: "create_scaling_setup",
    UPDATE_SCALING_SETTINGS: "update_scaling_settings",
    TRIGGER_REINDEX: "trigger_reindex",
    TRIGGER_CLEANUP: "trigger_cleanup",
    DELETE_SCALING_SETUP: "delete_scaling_setup",
    CREATE_DYNAMIC_SETUP: "create_dynamic_setup",
    UPDATE_DYNAMIC_SETTINGS: "update_dynamic_settings",
    DELETE_DYNAMIC_SETUP: "delete_dynamic_setup",
    REFRESH_CUSTOMIZATION: "refresh_customization"
} as const;

export type ManagementAction = typeof MANAGEMENT_ACTIONS[ keyof typeof MANAGEMENT_ACTIONS ];

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

export interface CreateDynamicSetupPayload {
    guildId: string;
    userOwnerId: string;
    version?: "v2" | "v3";
    nameTemplate?: string;
    autoSave?: boolean;
    mentionable?: boolean;
}

export interface UpdateDynamicSettingsPayload {
    guildId: string;
    masterChannelId: string;
    settings: {
        dynamicChannelNameTemplate?: string;
        dynamicChannelAutoSave?: boolean;
        dynamicChannelMentionable?: boolean;
    };
}

export interface DeleteDynamicSetupPayload {
    guildId: string;
    masterChannelId: string;
}

export interface RefreshCustomizationPayload {
    guildId: string;
}

export type ManagementPayload =
    | { action: typeof MANAGEMENT_ACTIONS.CREATE_SCALING_SETUP; data: CreateScalingSetupPayload }
    | { action: typeof MANAGEMENT_ACTIONS.UPDATE_SCALING_SETTINGS; data: UpdateScalingSettingsPayload }
    | { action: typeof MANAGEMENT_ACTIONS.TRIGGER_REINDEX; data: TriggerReindexPayload }
    | { action: typeof MANAGEMENT_ACTIONS.TRIGGER_CLEANUP; data: TriggerCleanupPayload }
    | { action: typeof MANAGEMENT_ACTIONS.DELETE_SCALING_SETUP; data: DeleteScalingSetupPayload }
    | { action: typeof MANAGEMENT_ACTIONS.CREATE_DYNAMIC_SETUP; data: CreateDynamicSetupPayload }
    | { action: typeof MANAGEMENT_ACTIONS.UPDATE_DYNAMIC_SETTINGS; data: UpdateDynamicSettingsPayload }
    | { action: typeof MANAGEMENT_ACTIONS.DELETE_DYNAMIC_SETUP; data: DeleteDynamicSetupPayload }
    | { action: typeof MANAGEMENT_ACTIONS.REFRESH_CUSTOMIZATION; data: RefreshCustomizationPayload };

export interface IPCMessage<T = unknown> {
    id: string;
    timestamp: number;
    channel: IPCChannel;
    payload: T;
}

export interface IPCRequest<T = unknown> extends IPCMessage<T> {
    requestId: string;
}

export interface IPCResponse<T = unknown> extends IPCMessage<T> {
    requestId: string;
    success: boolean;
    error?: string;
}

export function createIPCMessage<T>( channel: IPCChannel, payload: T ): IPCMessage<T> {
    return {
        id: `${ Date.now() }-${ Math.random().toString( 36 ).substring( 2, 9 ) }`,
        timestamp: Date.now(),
        channel,
        payload
    };
}

export function createIPCRequest<T>( channel: IPCChannel, payload: T ): IPCRequest<T> {
    const requestId = `req-${ Date.now() }-${ Math.random().toString( 36 ).substring( 2, 9 ) }`;

    return {
        id: requestId,
        requestId,
        timestamp: Date.now(),
        channel,
        payload
    };
}

export function createIPCResponse<T>(
    channel: IPCChannel,
    requestId: string,
    payload: T,
    success: boolean,
    error?: string
): IPCResponse<T> {
    return {
        id: `res-${ Date.now() }-${ Math.random().toString( 36 ).substring( 2, 9 ) }`,
        requestId,
        timestamp: Date.now(),
        channel,
        payload,
        success,
        error
    };
}

// Request/Response types for fetching Discord channel info
export const MANAGEMENT_REQUEST_ACTIONS = {
    GET_SCALING_CHANNEL_INFO: "get_scaling_channel_info",
    GET_DYNAMIC_CHANNEL_INFO: "get_dynamic_channel_info"
} as const;

export interface DiscordChannelInfo {
    id: string;
    name: string;
    memberCount: number;
    position: number;
}

export interface GetScalingChannelInfoRequest {
    action: typeof MANAGEMENT_REQUEST_ACTIONS.GET_SCALING_CHANNEL_INFO;
    guildId: string;
    masterChannelId: string;
    scalingChannelIds: string[];
}

export interface GetScalingChannelInfoResponse {
    masterChannel: DiscordChannelInfo | null;
    category: DiscordChannelInfo | null;
    scalingChannels: DiscordChannelInfo[];
}

export interface GetDynamicChannelInfoRequest {
    action: typeof MANAGEMENT_REQUEST_ACTIONS.GET_DYNAMIC_CHANNEL_INFO;
    guildId: string;
    masterChannelId: string;
    dynamicChannelIds: string[];
}

export interface GetDynamicChannelInfoResponse {
    masterChannel: DiscordChannelInfo | null;
    category: DiscordChannelInfo | null;
    dynamicChannels: DiscordChannelInfo[];
}

export type ManagementRequestPayload = GetScalingChannelInfoRequest | GetDynamicChannelInfoRequest;
export type ManagementResponsePayload = GetScalingChannelInfoResponse | GetDynamicChannelInfoResponse;
