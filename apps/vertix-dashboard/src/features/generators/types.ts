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
}

export interface GuildDiscordChannel {
    id: string;
    name: string;
}

/**
 * What a generator's settings can point at - fetched from Discord, so the forms offer names
 * rather than asking for ids.
 */
export interface GuildDiscordOptions {
    roles: GuildDiscordRole[];
    textChannels: GuildDiscordChannel[];
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

export interface GuildGeneratorsDetails {
    scalingMasterChannels: ScalingMasterChannelInfo[];
    dynamicMasterChannels: DynamicMasterChannelInfo[];
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
     * Both kinds count against it together - a generator and an auto-scaling pool are different
     * things to run, but each is one setup the server is carrying.
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

export type MasterChannelType = "scaling" | "dynamic";

export interface MasterChannelListItem {
    id: string;
    channelId: string;
    type: MasterChannelType;
    childCount: number;
    createdAt: string;
}
