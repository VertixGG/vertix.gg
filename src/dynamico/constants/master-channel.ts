import { PermissionsBitField } from "discord.js";

const { Flags } = PermissionsBitField;

export const DEFAULT_MASTER_CATEGORY_NAME = "⚡ Dynamic Channels",
    DEFAULT_MASTER_CHANNEL_CREATE_NAME = "➕ New Channel",
    DEFAULT_MASTER_DYNAMIC_CHANNEL_NAME_FORMAT = "%{userDisplayName}%'s Channel",
    DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS = 3;

export const DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS = {
    allow: [
        Flags.ManageChannels,
        Flags.MoveMembers,
        Flags.ViewChannel,
        Flags.Connect,
    ],
};

export const DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS = {
    deny: [ Flags.SendMessages ],
};

