import { OverwriteType, PermissionsBitField } from "discord.js";

import { DEFAULT_DYNAMIC_CHANNEL_USER_TEMPLATE } from "@dynamico/constants/dynamic-channel";

const { Flags } = PermissionsBitField;

export const DEFAULT_MASTER_CATEGORY_NAME = "🌀 Dynamic Channels",
    DEFAULT_MASTER_CHANNEL_CREATE_NAME = "➕ New Channel",
    DEFAULT_MASTER_CHANNEL_CREATE_NONE_NAME = "🚫 No Master Channels",
    DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS = 3;

export const DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME = DEFAULT_DYNAMIC_CHANNEL_USER_TEMPLATE + "'s Channel";

export const DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS = {
    dynamicChannelNameTemplate: DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_TEMPLATE_NAME,
};

export const DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS = {
    type: OverwriteType.Role,
    allow: [
        Flags.Connect,
        Flags.ManageChannels,
        Flags.ManageRoles,
        Flags.MoveMembers,
        Flags.ReadMessageHistory,
        Flags.SendMessages,
        Flags.ViewChannel,
        Flags.EmbedLinks,
    ],
};

export const DEFAULT_MASTER_CHANNEL_CREATE_BOT_USER_PERMISSIONS_REQUIREMENTS = {
    type: OverwriteType.Member,
    allow: [
        Flags.Connect,
        Flags.ReadMessageHistory,
        Flags.SendMessages,
        Flags.ViewChannel,
    ],
};

export const DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS = {
    deny: [ Flags.SendMessages ],
};

