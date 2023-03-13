import { PermissionsBitField } from "discord.js";

const { Flags } = PermissionsBitField;

export const DEFAULT_MASTER_CATEGORY_NAME = "⚡ Dynamic Channels",
    DEFAULT_MASTER_CHANNEL_CREATE_NAME = "➕ New Channel",
    DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS = 3;

export const DEFAULT_DATA_DYNAMIC_CHANNEL_NAME = "%{userDisplayName}%'s Channel";

export const DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS = {
    allow: [
        Flags.MoveMembers,
        Flags.ViewChannel,
        Flags.Connect,
        Flags.ReadMessageHistory,
        Flags.ManageChannels, // Temporarily.
    ],
};

export const DEFAULT_MASTER_CHANNEL_CREATE_BOT_ROLE_PERMISSIONS_REQUIREMENTS = {
    allow: [
        Flags.ManageRoles, // Should be first.
        Flags.Connect,
        Flags.ManageChannels,
        Flags.MoveMembers,
        Flags.ReadMessageHistory,
        Flags.SendMessages,
        Flags.ViewChannel,
    ],
};

export const DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS = {
    deny: [ Flags.SendMessages ],
};

