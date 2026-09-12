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
 * The tokens a channel status is allowed to carry.
 *
 * Only the ones that can change while people are sitting in the channel. The status is rewritten on
 * every join, leave and state change, so a live token says something new each time; the index, the
 * guild id and the owner's roles are fixed for the life of the channel, and a token that can never
 * move belongs in the name, where it is written once.
 */
export const DYNAMIC_CHANNEL_STATUS_VARS = [
    VAR_DYNAMIC_CHANNEL_USER,
    VAR_DYNAMIC_CHANNEL_GAME,
    VAR_DYNAMIC_CHANNEL_STATE
] as const;

/**
 * Regex pattern that matches the index placeholder.
 */
export const INDEX_PLACEHOLDER_PATTERN = /\{index\}/g;
