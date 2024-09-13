import { PermissionsBitField } from "discord.js";

import { PermissionFlagsBits } from "discord-api-types/v10";

import type { Guild, VoiceState } from "discord.js";

/* Default Data Key Settings */

export const DYNAMIC_CHANNEL_SETTINGS_KEY_PRIMARY_MESSAGE_ID = "primaryMessageId";

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

export enum DynamicEditChannelStateResultCode {
    Error = 0,
    Success = "success",
    RenameChannelStateRateLimit = "rename-channel-state-rate-limit",
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

export interface IDynamicEditChannelStateResult {
    code: DynamicEditChannelStateResultCode,
    retryAfter?: number,
}

export interface IDynamicClearChatResult {
    code: DynamicClearChatResultCode,
    deletedCount?: number,
}

/**
 * Renamed from `IDynamicResetChannelState`
 */
export interface TDynamicChannelConfiguration {
    name: string,
    userLimit: number,
    state: ChannelState,
    visibilityState: ChannelVisibilityState,
    allowedUserIds: string[],
    blockedUserIds: string[],

    // @since 0.0.8
    region?: string,
    primaryMessageTitle?: string,
    primaryMessageDescription?: string,
}

export interface IDynamicResetChannelResult {
    code: DynamicResetChannelResultCode,

    oldState?: TDynamicChannelConfiguration,
    newState?: TDynamicChannelConfiguration,

    rateLimitRetryAfter?: number,
}

/* Default Permissions */

export const DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS = new PermissionsBitField();

DEFAULT_DYNAMIC_CHANNEL_GRANTED_PERMISSIONS.add(
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.ReadMessageHistory
);

export type ChannelState = "unknown" | "public" | "private";
export type ChannelVisibilityState = "unknown" | "shown" | "hidden";

/**
 * @since 0.0.8
 */
export type ChannelPrivacyState = ChannelState | ChannelVisibilityState;

export type AddStatus = "error" | "action-on-bot-user" |  "self-grant" | "already-granted" | "success";
export type EditStatus = "error" | "action-on-bot-user" | "self-edit" | "already-have" | "success";
export type RemoveStatus = "error" | "action-on-bot-user" | "self-deny" | "user-blocked" | "not-in-the-list" | "success"
export type ActStatus = "error" | "action-on-bot-user" | "self-action" | "not-in-the-list" | "success";
