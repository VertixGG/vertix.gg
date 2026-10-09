import type { TRoleUnassignableReason } from "@vertix.gg/definitions/src/ipc-definitions";

export interface ScalingSettings {
    scalingChannelPrefix: string;
    scalingChannelMaxMembersPerChannel: number;
    scalingChannelMinAvailableChannels: number;
    scalingChannelCategoryId: string | null;
}

export interface ScalingMasterChannelInfo {
    id: string;
    channelId: string;
    categoryId: string | null;
    createdAt: string;
    scalingChannelsCount: number;
    settings: ScalingSettings | null;
    // Populated when selected - single source of truth
    scalingChannels?: ScalingChannelInfo[];
    discord?: {
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
    };
}

export type ChannelPrivacyState = "public" | "private" | "hidden";

export interface DynamicSettings {
    dynamicChannelNameTemplate: string;
    dynamicChannelAutoSave: boolean;
    dynamicChannelAutoStatus: boolean;
    dynamicChannelMentionable: boolean;
    dynamicChannelDefaultPrivacyState: ChannelPrivacyState;
    /** Null copies the generator's own limit, which is what a channel did before the setting. */
    dynamicChannelDefaultUserLimit: number | null;
    dynamicChannelVerifiedRoles: string[];
    dynamicChannelStaffRoles: string[];
    /** Null defers to the guild wide voice role. */
    dynamicChannelVoiceRoleId: string | null;
    dynamicChannelLogsChannelId: string | null;
    /**
     * The channels this generator's rooms may advertise themselves on, and who gets pinged when
     * one does. Empty means the feature is off.
     *
     * Optional because an api that predates them answers without them, and the dashboard ships
     * separately from it - typed as always present, the compiler was satisfied and the settings
     * form crashed on the first render against a live server.
     */
    dynamicChannelLfmChannelIds?: string[];
    dynamicChannelLfmPingRoleIds?: string[];
    /**
     * The four clocks an LFM post runs on, in milliseconds. Optional for the same reason as the
     * two lists above, and reported already resolved - the api answers with what the bot will run
     * on rather than with what the row happens to hold.
     */
    dynamicChannelLfmPostCooldownMs?: number;
    dynamicChannelLfmPingCooldownMs?: number;
    dynamicChannelLfmPostExpiryMs?: number;
    dynamicChannelLfmOccupancyDebounceMs?: number;
    /** The buttons a generator's channels carry, by id, in the order the interface draws them. */
    dynamicChannelButtonsTemplate: string[];
    dynamicChannelButtonsTemplateByRole: Record<string, string[]>;
    /** Where that set is divided into rows; empty means the interface draws it in rows of five. */
    dynamicChannelButtonsRowBreaks: number[];
}

export interface GuildDiscordRole {
    id: string;
    name: string;
    color: number;
    /**
     * Whether discord or an app owns this role, and so whether anybody can hand it out.
     *
     * A picker that makes the bot give somebody a role has to refuse these; one that only asks
     * whether a member already holds a role does not, and `Nitro Booster` is managed.
     */
    managed: boolean;
    /**
     * Whether the bot could give this role to somebody, and why not when it could not.
     *
     * Wider than `managed` - it also covers the permission the bot needs, the everyone role, and a
     * role sitting above the bot in the list. Absent means nobody could answer, which a picker
     * should read as "allow": only the bot can work it out, and it checks again before assigning.
     */
    assignable?: boolean;
    reason?: TRoleUnassignableReason;
    /** Whether anybody may mention the role - what a ping of it needs, unless the bot may mention every role. */
    mentionable?: boolean;
}

export interface GuildDiscordChannel {
    id: string;
    name: string;
    /** An announcement channel rather than a plain text one - absent from an api older than the flag. */
    isAnnouncement?: boolean;
}

/** A voice or stage channel - where a scheduled event can be held. */
export interface GuildDiscordVoiceChannel {
    id: string;
    name: string;
    isStage: boolean;
}

/**
 * What a server's settings can point at - fetched from Discord, so the forms offer names rather
 * than asking for ids.
 */
export interface GuildDiscordOptions {
    roles: GuildDiscordRole[];
    textChannels: GuildDiscordChannel[];
    /** Absent from an api older than Events' channel limit. */
    voiceChannels?: GuildDiscordVoiceChannel[];
}

export interface DynamicMasterChannelInfo {
    id: string;
    channelId: string;
    categoryId: string | null;
    createdAt: string;
    dynamicChannelsCount: number;
    version: string;
    settings: DynamicSettings | null;
    // Populated when selected - single source of truth
    dynamicChannels?: DynamicChannelInfo[];
    discord?: {
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
    };
}

export interface DynamicChannelInfo {
    id: string;
    channelId: string;
    userOwnerId: string | null;
    createdAt: string;
    discord?: DiscordChannelInfo | null;
}

export interface DynamicMasterDetails {
    master: DynamicMasterChannelInfo;
    dynamicChannels: DynamicChannelInfo[];
    discord?: {
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
    };
}

export interface UpdateDynamicSettingsInput {
    dynamicChannelNameTemplate?: string;
    dynamicChannelAutoSave?: boolean;
    dynamicChannelAutoStatus?: boolean;
    dynamicChannelMentionable?: boolean;
    dynamicChannelDefaultPrivacyState?: ChannelPrivacyState;
    dynamicChannelDefaultUserLimit?: number | null;
    dynamicChannelVerifiedRoles?: string[];
    dynamicChannelStaffRoles?: string[];
    dynamicChannelVoiceRoleId?: string | null;
    dynamicChannelLogsChannelId?: string | null;
    dynamicChannelLfmChannelIds?: string[];
    dynamicChannelLfmPingRoleIds?: string[];
    dynamicChannelLfmPostCooldownMs?: number;
    dynamicChannelLfmPingCooldownMs?: number;
    dynamicChannelLfmPostExpiryMs?: number;
    dynamicChannelLfmOccupancyDebounceMs?: number;
}

export interface DiscordChannelInfo {
    id: string;
    name: string;
    memberCount: number;
    position: number;
    /** The channel's own limit, `0` for none. Absent on anything that is not a voice channel. */
    userLimit?: number;
}

export interface ScalingChannelInfo {
    id: string;
    channelId: string;
    createdAt: string;
    discord?: DiscordChannelInfo | null;
}

/** A team lobby - one channel members gather in, split into team or group rooms and called back to. */
export interface LobbyMasterChannelInfo {
    id: string;
    channelId: string;
    categoryId: string | null;
    createdAt: string;
    /** The rooms it is split into right now - none while everyone is in the lobby. */
    lobbyRoomsCount: number;
    /** The roles that run it; empty when anyone in it may. */
    hostRoleIds: string[];
}

export interface GuildGeneratorsDetails {
    scalingMasterChannels: ScalingMasterChannelInfo[];
    dynamicMasterChannels: DynamicMasterChannelInfo[];
    /** Optional because an api that predates team lobbies answers without them. */
    lobbyMasterChannels?: LobbyMasterChannelInfo[];
    settings: GuildSettings;
}

/**
 * The server wide defaults every generator falls back to when it holds none of its own.
 *
 * An empty list is the unset state, not an empty audience - it resolves to `@everyone` for the
 * verified roles and to nobody for the staff roles. The forms need the two apart to say which of
 * them a generator is actually following.
 */
export interface GuildSettings {
    voiceRoleId: string | null;
    verifiedRoleIds: string[];
    staffRoleIds: string[];
    /**
     * How many master channels a server may have, out of the bot's own configuration.
     *
     * Every kind counts against it together - a generator, an auto-scaling pool and a team lobby are
     * different things to run, but each is one setup the server is carrying.
     *
     * Null when the api could not reach the bot to ask. Unknown rather than none: the screen shows
     * the count on its own and stops standing in the way, since a limit it had to invent would be
     * one nothing is actually enforcing.
     */
    maxMasterChannels: number | null;
}

export interface ScalingMasterDetails {
    master: ScalingMasterChannelInfo;
    scalingChannels: ScalingChannelInfo[];
    discord?: {
        masterChannel: DiscordChannelInfo | null;
        category: DiscordChannelInfo | null;
    };
}

export interface UpdateScalingSettingsInput {
    scalingChannelPrefix?: string;
    scalingChannelMaxMembersPerChannel?: number;
    scalingChannelMinAvailableChannels?: number;
    scalingChannelCategoryId?: string | null;
}

export interface CreateScalingSetupInput {
    prefix?: string;
    maxMembers?: number;
}

export type DynamicChannelVersion = "v2" | "v3";

export interface CreateDynamicSetupInput {
    version?: DynamicChannelVersion;
    nameTemplate?: string;
    autoSave?: boolean;
    mentionable?: boolean;
}

export type MasterChannelType = "scaling" | "dynamic" | "lobby";

export interface MasterChannelListItem {
    id: string;
    channelId: string;
    type: MasterChannelType;
    childCount: number;
    createdAt: string;
}
