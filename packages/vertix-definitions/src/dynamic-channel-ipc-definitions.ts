import type {
    CreateScalingSetupPayload,
    UpdateScalingSettingsPayload,
    TriggerReindexPayload,
    TriggerCleanupPayload,
    DeleteScalingSetupPayload
} from "@vertix.gg/definitions/src/scaling-channel-ipc-definitions";

import type { IPC_REQUEST_ACTIONS, IPCDiscordChannelInfo } from "@vertix.gg/definitions/src/ipc-definitions";
import type { TGuildTimingsOverrides } from "@vertix.gg/definitions/src/guild-timings-definitions";

export const DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS = {
    CREATE_SCALING_SETUP: "create_scaling_setup",
    UPDATE_SCALING_SETTINGS: "update_scaling_settings",
    TRIGGER_REINDEX: "trigger_reindex",
    TRIGGER_CLEANUP: "trigger_cleanup",
    DELETE_SCALING_SETUP: "delete_scaling_setup",
    CREATE_DYNAMIC_SETUP: "create_dynamic_setup",
    UPDATE_DYNAMIC_SETTINGS: "update_dynamic_settings",
    DELETE_DYNAMIC_SETUP: "delete_dynamic_setup",
    UPDATE_GUILD_SETTINGS: "update_guild_settings",
    REFRESH_CUSTOMIZATION: "refresh_customization"
} as const;

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
    /**
     * What the dashboard can change about a generator, keyed the way the master channel settings
     * are. Every key is optional - only what was edited is sent, and the bot applies exactly that.
     */
    settings: {
        dynamicChannelNameTemplate?: string;
        dynamicChannelAutoSave?: boolean;
        dynamicChannelAutoStatus?: boolean;
        dynamicChannelMentionable?: boolean;
        dynamicChannelDefaultPrivacyState?: "public" | "private" | "hidden";
        dynamicChannelDefaultUserLimit?: number | null;
        dynamicChannelVerifiedRoles?: string[];
        dynamicChannelStaffRoles?: string[];
        dynamicChannelVoiceRoleId?: string | null;
        dynamicChannelLogsChannelId?: string | null;
        dynamicChannelButtonsTemplate?: string[];
        dynamicChannelButtonsTemplateByRole?: Record<string, string[]>;
        /** Where the button set is divided into rows; empty returns it to rows of five. */
        dynamicChannelButtonsRowBreaks?: number[];
    };
}

export interface UpdateGuildSettingsPayload {
    guildId: string;
    /**
     * The guild wide defaults every generator falls back to when it holds none of its own.
     *
     * Every key is optional - only what was edited is sent - and an empty list means unset, which
     * is `@everyone` for the audience and nobody for the staff.
     */
    settings: {
        /** Only what the guild chose for itself, in milliseconds - absent keys stay as they are. */
        timings?: TGuildTimingsOverrides;
        voiceRoleId?: string | null;
        verifiedRoleIds?: string[];
        staffRoleIds?: string[];
        /** Empty restores the built in list rather than turning the filter off. */
        badwords?: string[];
    };
}

export interface DeleteDynamicSetupPayload {
    guildId: string;
    masterChannelId: string;
}

export interface RefreshCustomizationPayload {
    guildId: string;
}

export interface GetDynamicChannelInfoRequest {
    action: typeof IPC_REQUEST_ACTIONS.GET_DYNAMIC_CHANNEL_INFO;
    guildId: string;
    masterChannelId: string;
    dynamicChannelIds: string[];
}

export interface GetDynamicChannelInfoResponse {
    masterChannel: IPCDiscordChannelInfo | null;
    category: IPCDiscordChannelInfo | null;
    dynamicChannels: IPCDiscordChannelInfo[];
}

export type DynamicChannelIPCManagementPayload =
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.CREATE_SCALING_SETUP; data: CreateScalingSetupPayload }
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.UPDATE_SCALING_SETTINGS; data: UpdateScalingSettingsPayload }
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.TRIGGER_REINDEX; data: TriggerReindexPayload }
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.TRIGGER_CLEANUP; data: TriggerCleanupPayload }
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.DELETE_SCALING_SETUP; data: DeleteScalingSetupPayload }
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.CREATE_DYNAMIC_SETUP; data: CreateDynamicSetupPayload }
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.UPDATE_DYNAMIC_SETTINGS; data: UpdateDynamicSettingsPayload }
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.DELETE_DYNAMIC_SETUP; data: DeleteDynamicSetupPayload }
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.UPDATE_GUILD_SETTINGS; data: UpdateGuildSettingsPayload }
    | { action: typeof DYNAMIC_CHANNEL_IPC_MANAGEMENT_ACTIONS.REFRESH_CUSTOMIZATION; data: RefreshCustomizationPayload };
