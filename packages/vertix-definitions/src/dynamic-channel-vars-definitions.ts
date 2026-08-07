export const VAR_DYNAMIC_CHANNEL_USER = "{user}" as const,
    VAR_DYNAMIC_CHANNEL_STATE = "{state}" as const,
    VAR_DYNAMIC_CHANNEL_GAME = "{game}" as const,
    VAR_DYNAMIC_CHANNEL_INDEX = "{index}" as const;

/**
 * Regex pattern that matches all supported index placeholder variants.
 * Supports: {index}, {{index}}, {auto-scale}, {autoscale}
 */
export const INDEX_PLACEHOLDER_PATTERN = /\{\{index\}\}|\{index\}|\{auto-scale\}|\{autoscale\}/g;
