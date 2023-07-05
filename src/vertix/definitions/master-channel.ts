import { OverwriteType, PermissionsBitField } from "discord.js";

import {
    DynamicChannelElementsGroup
} from "@vertix/ui-v2/dynamic-channel/primary-message/dynamic-channel-elements-group";

import { uiUtilsWrapAsTemplate } from "@vertix/ui-v2/ui-utils";
import { UI_ELEMENTS_DEPTH } from "@vertix/ui-v2/_base/ui-definitions";

const { Flags } = PermissionsBitField;

/* Default Values */
export const DEFAULT_MASTER_CATEGORY_NAME = "༄ Dynamic Channels",
    DEFAULT_MASTER_CHANNEL_CREATE_NAME = "➕ New Channel",
    DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS = 3;

/* Templates */

export const DYNAMIC_CHANNEL_USER_TEMPLATE = uiUtilsWrapAsTemplate( "user" );

/* Templates Data */

export const DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE = DYNAMIC_CHANNEL_USER_TEMPLATE + "'s Channel";

export const DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE = DynamicChannelElementsGroup.getItems().flat( UI_ELEMENTS_DEPTH )
    .map( ( item ) => ( new item ).getId() ); // TODO: Create dedicated method for this, which validate the uniqueness of the ids

export const DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE = true;

export const DEFAULT_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID = null;

/* Default Data Key Settings */

export const MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE = "dynamicChannelNameTemplate",
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE = "dynamicChannelButtonsTemplate",
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE = "dynamicChannelMentionable",
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES = "dynamicChannelVerifiedRoles",
    MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID = "dynamicChannelLogsChannelId";

/* Default Data Settings */

export const DEFAULT_MASTER_CHANNEL_DATA_DYNAMIC_CHANNEL_SETTINGS = {
    [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_NAME_TEMPLATE ]: DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE,
    [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE ]: DEFAULT_DYNAMIC_CHANNEL_BUTTONS_TEMPLATE,
    [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_MENTIONABLE ]: DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE,
    [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_VERIFIED_ROLES ]: [],
    [ MASTER_CHANNEL_SETTINGS_KEY_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID ]: DEFAULT_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID,
};

/* Default Permissions */

export const DEFAULT_MASTER_CHANNEL_SETUP_PERMISSIONS = new PermissionsBitField( [
    Flags.Connect,
    Flags.ManageChannels,
    Flags.ManageRoles,
    Flags.MoveMembers,
    Flags.ReadMessageHistory,
    Flags.SendMessages,
    Flags.ViewChannel,
    Flags.EmbedLinks,
] );

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
        // Flags.ManageGuild,
    ],
};

export const DEFAULT_MASTER_CHANNEL_CREATE_EVERYONE_PERMISSIONS = {
    deny: [ Flags.SendMessages ],
};

export const DEFAULT_SETUP_PERMISSIONS  = [
    PermissionsBitField.Flags.ManageGuild,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageRoles,
];
