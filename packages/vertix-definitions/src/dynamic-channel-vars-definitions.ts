export const VAR_DYNAMIC_CHANNEL_USER = "{user}" as const,
    VAR_DYNAMIC_CHANNEL_STATE = "{state}" as const,
    VAR_DYNAMIC_CHANNEL_GAME = "{game}" as const,
    VAR_DYNAMIC_CHANNEL_INDEX = "{index}" as const,
    VAR_DYNAMIC_CHANNEL_INDEX_ROMAN = "{index-roman}" as const,
    VAR_DYNAMIC_CHANNEL_INDEX_ALPHA = "{index-alpha}" as const,
    VAR_DYNAMIC_CHANNEL_USER_USERNAME = "{user-username}" as const,
    VAR_DYNAMIC_CHANNEL_GUILD_ID = "{guild-id}" as const,
    VAR_DYNAMIC_CHANNEL_ROLE_HIGHEST = "{role-highest}" as const,
    VAR_DYNAMIC_CHANNEL_ROLE_HOIST = "{role-hoist}" as const;

/**
 * Regex pattern that matches the index placeholder.
 */
export const INDEX_PLACEHOLDER_PATTERN = /\{index\}/g;
