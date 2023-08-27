import { Guild, PermissionsBitField, VoiceState } from "discord.js";

const { Flags } = PermissionsBitField;

/* Default Data Key Settings */

export const DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID = "primaryMessageId",
    DYNAMIC_CHANNEL_SETTINGS_KEY_NAME = "name",
    DYNAMIC_CHANNEL_SETTINGS_KEY_USER_LIMIT = "userLimit",
    DYNAMIC_CHANNEL_SETTINGS_KEY_STATE = "state",
    DYNAMIC_CHANNEL_SETTINGS_KEY_VISIBILITY_STATE = "visibilityState",
    DYNAMIC_CHANNEL_SETTINGS_KEY_ALLOWED_USER_IDS = "allowedUserIds",
    DYNAMIC_CHANNEL_SETTINGS_KEY_BLOCKED_USER_IDS = "blockedUserIds";

/* Default Data Settings */
export const DEFAULT_DYNAMIC_CHANNEL_DATA_SETTINGS = {
    [ DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID ]: null,
};

export enum DynamicEditChannelNameInternalResultCode {
    Error = 0,
    Success = "success",
    RateLimit = "rate-limit",
}

export enum DynamicEditChannelNameResultCode {
    Error = 0,
    Success = "success",
    Badword = "badword",
    RateLimit = "rate-limit",
}

export enum DynamicClearChatResultCode {
    Error = 0,
    Success = "success",
    NothingToDelete = "nothing-to-delete",
}

export enum DynamicResetChannelResultCode {
    Error = 0,
    VoteRequired = "vote-required",
    Success = "success",
    SuccessRenameRateLimit = "success-rename-rate-limit",
}

export interface IDynamicChannelCreateArgs {
    username: string,
    oldState: VoiceState,
    newState: VoiceState,
    guild: Guild
    displayName: string,
}

export interface IDynamicEditChannelNameInternalResult {
    code: DynamicEditChannelNameInternalResultCode,
    retryAfter?: number,
}

export interface IDynamicEditChannelNameResult {
    code: DynamicEditChannelNameResultCode,
    retryAfter?: number,
    badword?: string,
}

export interface IDynamicClearChatResult {
    code: DynamicClearChatResultCode,
    deletedCount?: number,
}

export interface IDynamicResetChannelState {
    name: string,
    userLimit: number,
    state: ChannelState,
    visibilityState: ChannelVisibilityState,
    allowedUserIds: string[],
    blockedUserIds: string[],
}

export interface IDynamicResetChannelResult {
    code: DynamicResetChannelResultCode,

    oldState?: IDynamicResetChannelState,
    newState?: IDynamicResetChannelState,

    rateLimitRetryAfter?: number,
}

/* Default Permissions */

export const DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS = new PermissionsBitField();

DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS.add(
    Flags.ViewChannel,
    Flags.Connect,
    Flags.ReadMessageHistory
);

export type ChannelState = "unknown" | "public" | "private";
export type ChannelVisibilityState = "unknown" | "shown" | "hidden";

export type AddStatus = "error" | "action-on-bot-user" |  "self-grant" | "already-granted" | "success";
export type EditStatus = "error" | "action-on-bot-user" | "self-edit" | "already-have" | "success";
export type RemoveStatus = "error" | "action-on-bot-user" | "self-deny" | "user-blocked" | "not-in-the-list" | "success"
export type ActStatus = "error" | "action-on-bot-user" | "self-action" | "not-in-the-list" | "success";
