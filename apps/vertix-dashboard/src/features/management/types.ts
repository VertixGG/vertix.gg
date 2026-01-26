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
}

export interface DynamicMasterChannelInfo {
    id: string;
    channelId: string;
    categoryId: string | null;
    createdAt: string;
    dynamicChannelsCount: number;
}

export interface DiscordChannelInfo {
    id: string;
    name: string;
    memberCount: number;
    position: number;
}

export interface ScalingChannelInfo {
    id: string;
    channelId: string;
    createdAt: string;
    discord?: DiscordChannelInfo | null;
}

export interface GuildManagementDetails {
    scalingMasterChannels: ScalingMasterChannelInfo[];
    dynamicMasterChannels: DynamicMasterChannelInfo[];
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

export type MasterChannelType = "scaling" | "dynamic";

export interface MasterChannelListItem {
    id: string;
    channelId: string;
    type: MasterChannelType;
    childCount: number;
    createdAt: string;
}
