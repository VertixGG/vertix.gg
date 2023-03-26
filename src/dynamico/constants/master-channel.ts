import { OverwriteType, PermissionsBitField } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/base/ui-utils";

const { Flags } = PermissionsBitField;

export const DEFAULT_MASTER_CATEGORY_NAME = "🌀 Dynamic Channels",
    DEFAULT_MASTER_CHANNEL_CREATE_NAME = "➕ New Channel",
    DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS = 3;

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

export const DEFAULT_USER_DYNAMIC_CHANNEL_TEMPLATE = uiUtilsWrapAsTemplate( "user" );
export const DEFAULT_DATA_DYNAMIC_CHANNEL_NAME = DEFAULT_USER_DYNAMIC_CHANNEL_TEMPLATE + "'s Channel";
