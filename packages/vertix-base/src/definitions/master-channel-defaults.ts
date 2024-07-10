import { uiUtilsWrapAsTemplate } from "@vertix.gg/gui/src/ui-utils";

export const DEFAULT_MASTER_CATEGORY_NAME = "༄ Dynamic Channels",
    DEFAULT_MASTER_CHANNEL_CREATE_NAME = "➕ New Channel",
    DEFAULT_MASTER_MAXIMUM_FREE_CHANNELS = 6;

/**
 * TODO: Move to `MasterChannelConfig`
 */
export const
    DEFAULT_DYNAMIC_CHANNEL_MENTIONABLE = true,
    DEFAULT_DYNAMIC_CHANNEL_AUTOSAVE = false,

    DEFAULT_DYNAMIC_CHANNEL_STATE_PRIVATE = "🔴",
    DEFAULT_DYNAMIC_CHANNEL_STATE_PUBLIC = "🟢",

    DEFAULT_DYNAMIC_CHANNEL_LOGS_CHANNEL_ID = null,

    DEFAULT_DYNAMIC_CHANNEL_USER_NAME_VAR = uiUtilsWrapAsTemplate( "user" ),
    DEFAULT_DYNAMIC_CHANNEL_STATE_VAR = uiUtilsWrapAsTemplate( "state" ),

    DEFAULT_DYNAMIC_CHANNEL_NAME_TEMPLATE = DEFAULT_DYNAMIC_CHANNEL_USER_NAME_VAR + "'s Channel";
