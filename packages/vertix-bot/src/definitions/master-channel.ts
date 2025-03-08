// TODO: Maybe Rename file to permissions.ts
import { OverwriteType, PermissionsBitField } from "discord.js";

const { Flags } = PermissionsBitField;

/* Default Permissions */

export const DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS = new PermissionsBitField([
    Flags.Connect,
    Flags.ManageChannels,
    Flags.ManageRoles,
    Flags.MoveMembers,
    Flags.ReadMessageHistory,
    Flags.SendMessages,
    Flags.ViewChannel,
    Flags.EmbedLinks
]);

export const DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS = {
    allow: [
        Flags.MoveMembers,
        Flags.ViewChannel,
        Flags.Connect,
        Flags.ReadMessageHistory,
        Flags.ManageChannels // Temporarily.
    ]
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
        Flags.EmbedLinks
        // Flags.ManageGuild,
    ]
};

export const DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS = {
    deny: [Flags.SendMessages]
};

export const DEFAULT_SETUP_PERMISSIONS = [
    PermissionsBitField.Flags.ManageGuild,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageRoles
];
