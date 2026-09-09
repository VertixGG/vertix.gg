export type ChannelState = "unknown" | "public" | "private";
export type ChannelVisibilityState = "unknown" | "shown" | "hidden";

/**
 * @since 0.0.8
 */
export type ChannelPrivacyState = ChannelState | ChannelVisibilityState;
