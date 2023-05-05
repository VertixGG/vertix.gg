import { PermissionsBitField } from "discord.js";

import { uiUtilsWrapAsTemplate } from "@dynamico/ui/_base/ui-utils";

const { Flags } = PermissionsBitField;

export const DEFAULT_MASTER_OWNER_DYNAMIC_CHANNEL_PERMISSIONS = {
    allow: [
        Flags.MoveMembers,
        Flags.ViewChannel,
        Flags.Connect,
        Flags.ReadMessageHistory,
        Flags.ManageChannels, // Temporarily.
    ],
};

export const DEFAULT_DYNAMIC_CHANNEL_USER_TEMPLATE = uiUtilsWrapAsTemplate( "user" );
