import { OverwriteType, PermissionsBitField } from "discord.js";

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
    type: OverwriteType.Role,
    allow: [
        Flags.ManageChannels,
        Flags.ManageRoles,
        Flags.MoveMembers,
        Flags.ViewChannel,
    ],
};

export const DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS_REQUIREMENTS_FIELDS = {
    Connect: true,
    ReadMessageHistory: true,
    SendMessages: true,
    ViewChannel: true,
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

