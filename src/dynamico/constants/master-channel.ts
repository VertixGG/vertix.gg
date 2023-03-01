import { PermissionsBitField } from "discord.js";

export const DEFAULT_MASTER_CATEGORY_NAME = "⚡ Dynamic Channels",
    DEFAULT_MASTER_CHANNEL_NAME = "➕ New Channel",
    DEFAULT_MASTER_DYNAMIC_CHANNEL_NAME_FORMAT = "%{userDisplayName}%'s Channel",
    DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS = 3;

export const DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS = {
    allow: [
        PermissionsBitField.Flags.ManageChannels,
        PermissionsBitField.Flags.MoveMembers,
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.Connect,
    ],
};

export const DEFAULT_MASTER_EVERYONE_CHANNEL_PERMISSIONS = {
    deny: [ PermissionsBitField.Flags.SendMessages ],
};
