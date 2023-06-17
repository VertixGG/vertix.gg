import { Guild, VoiceState } from "discord.js";

/* Default Data Key Settings */

export const DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID = "primaryMessageId";

/* Default Data Settings */
export const DEFAULT_DYNAMIC_CHANNEL_DATA_SETTINGS = {
    [ DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID ]: null,
};

export enum DynamicEditChannelResultCode {
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
    oldState: VoiceState,
    newState: VoiceState,
    guild: Guild
    displayName: string,
}

export interface IDynamicEditChannelNameResult {
    code: DynamicEditChannelResultCode,
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
}

export interface IDynamicResetChannelResult {
    code: DynamicResetChannelResultCode,

    oldState?: IDynamicResetChannelState,
    newState?: IDynamicResetChannelState,

    rateLimitRetryAfter?: number,
}

export type ChannelState = "unknown" | "public" | "private";
export type ChannelVisibilityState = "unknown" | "shown" | "hidden";
export type GrantStatus = "error" | "self-grant" | "already-granted" | "success";
export type DenyStatus = "error" | "success";
