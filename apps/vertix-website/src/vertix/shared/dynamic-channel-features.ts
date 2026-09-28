import { useNavigate } from "react-router-dom";

export const DYNAMIC_CHANNEL_V2_FEATURES_PATH = "/features/dynamic-channel-v2",
    DYNAMIC_CHANNEL_V3_FEATURES_PATH = "/features/dynamic-channel-v3";

export const DYNAMIC_CHANNEL_FEATURE_PARAM = "feature";

/**
 * The emoji names the buttons carry, for looking the artwork up in the manifest.
 */
export const DYNAMIC_CHANNEL_V3_EMOJI_NAMES = {
    rename: "ChannelRename",
    limit: "UserLimit",
    permissions: "ChannelPermissions",
    privacy: "ChannelPrivacy",
    region: "ChannelRegion",
    editPrimaryMessage: "EditChannelMessage",
    clearChat: "ClearChat",
    resetChannel: "ResetChannel",
    transferChannel: "TransferChannel",
    claimChannel: "ClaimChannel",
    templates: "ChannelTemplates",
    status: "Megaphone",
    inviteChannel: "InviteChannel",
    knockChannel: "KnockChannel",
    lfm: "LfmChannel",
};

export interface DynamicChannelFeature {
    value: string;
    title: string;
    emoji: string;
    customEmoji?: string;
}

/**
 * The features a features page explains, in the order it explains them.
 *
 * `emoji` is the unicode the button carries - for v3 only the stand-in, since its real artwork is
 * `customEmoji` and arrives from the manifest after first paint.
 */
export const DYNAMIC_CHANNEL_V3_FEATURES: readonly DynamicChannelFeature[] = [
    { value: "buttons-interface", title: "Buttons Interface", emoji: "🎚️" },
    { value: "rename-channel", title: "Rename Channel", emoji: "✏️", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.rename },
    { value: "user-limit", title: "User Limit", emoji: "✋", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.limit },
    { value: "clear-chat", title: "Clear Chat", emoji: "🧹", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.clearChat },
    { value: "permissions", title: "Permissions", emoji: "👥", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.permissions },
    { value: "invite-channel", title: "Invite", emoji: "📨", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.inviteChannel },
    { value: "knock-channel", title: "Knock", emoji: "🚪", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.knockChannel },
    { value: "privacy-state", title: "Privacy State", emoji: "🚫", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.privacy },
    { value: "region", title: "Region & Bitrate", emoji: "🌍", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.region },
    { value: "edit-primary-message", title: "Edit Primary Message", emoji: "📝", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.editPrimaryMessage },
    { value: "templates", title: "Channel Templates", emoji: "📂", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.templates },
    { value: "status", title: "Channel Status", emoji: "📢", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.status },
    { value: "reset-channel", title: "Reset Channel", emoji: "🔃", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.resetChannel },
    { value: "transfer-channel", title: "Transfer Channel", emoji: "🔀", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.transferChannel },
    { value: "lfm", title: "Looking for Members", emoji: "🔎", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.lfm },
    { value: "claim-channel", title: "Claim Channel", emoji: "😈", customEmoji: DYNAMIC_CHANNEL_V3_EMOJI_NAMES.claimChannel },
];

export const DYNAMIC_CHANNEL_V2_FEATURES: readonly DynamicChannelFeature[] = [
    { value: "buttons-interface", title: "Buttons Interface", emoji: "🎚️" },
    { value: "rename-channel", title: "Rename Channel", emoji: "✏️" },
    { value: "user-limit", title: "User Limit", emoji: "✋" },
    { value: "clear-chat", title: "Clear Chat", emoji: "🧹" },
    { value: "toggle-channel-state", title: "Toggle Channel State", emoji: "🚫" },
    { value: "toggle-visibility-state", title: "Toggle Visibility State", emoji: "🙈" },
    { value: "access", title: "Access Management", emoji: "👥" },
    { value: "region", title: "Region & Bitrate", emoji: "🌍" },
    { value: "status", title: "Channel Status", emoji: "📣" },
    { value: "reset-channel", title: "Reset Channel", emoji: "🔃" },
    { value: "transfer-channel", title: "Transfer Channel", emoji: "🔀" },
    { value: "lfm", title: "Looking for Members", emoji: "🔎" },
    { value: "claim-channel", title: "Claim Channel", emoji: "😈" },
];

export function toDynamicChannelFeatureHref( featuresPath: string, feature: string ): string {
    return `${ featuresPath }?${ new URLSearchParams( { [ DYNAMIC_CHANNEL_FEATURE_PARAM ]: feature } ) }`;
}

/**
 * The feature each button of the v2 primary message stands for, by element name.
 *
 * The v2 panel carries ten buttons and the v2 features page explains ten features, so every one of
 * them has somewhere to go - which is not something to rely on, and is why a button with nothing
 * behind it is left inert rather than sent to the top of the page.
 */
export const DYNAMIC_CHANNEL_V2_FEATURE_BY_ELEMENT: Readonly<Record<string, string>> = {
    "VertixBot/UI-V2/DynamicChannelMetaRenameButton": "rename-channel",
    "VertixBot/UI-V2/DynamicChannelMetaLimitButton": "user-limit",
    "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": "clear-chat",
    "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": "toggle-channel-state",
    "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": "toggle-visibility-state",
    "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": "access",
    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": "reset-channel",
    "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": "transfer-channel",
    "VertixBot/UI-V2/DynamicChannelMetaStatusButton": "status",
    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": "claim-channel",
    "VertixBot/UI-V2/DynamicChannelLfmButton": "lfm",
    "VertixBot/UI-V2/DynamicChannelRegionButton": "region",
};

/**
 * Every v3 button, in the order the panel prints them.
 *
 * The legend above the buttons is an image the api draws from a list this passes it, and left
 * unsaid it falls back to whichever list the api was deployed with - which is how a panel came to
 * draw fifteen buttons under a legend naming fourteen. Said here once, because two pages draw this
 * panel and a list written twice is a list that ends up disagreeing with itself.
 */
export const DYNAMIC_CHANNEL_V3_BUTTON_ORDER: ReadonlyArray<string> = [
    "rename", "limit", "access", "invite", "privacy",
    "region", "edit-primary-message", "clear-chat", "rest-channel", "transfer",
    "templates", "status", "knock", "lfm", "claim-button"
];

/**
 * The feature each button of the v3 primary message stands for, by element name.
 *
 * Keyed the way the exported UI definitions name their elements, so a press in a rendered
 * interface - wherever the site shows one - can open the section that explains that button.
 */
export const DYNAMIC_CHANNEL_V3_FEATURE_BY_ELEMENT: Readonly<Record<string, string>> = {
    "VertixBot/UI-V3/DynamicChannelRenameButton": "rename-channel",
    "VertixBot/UI-V3/DynamicChannelLimitMetaButton": "user-limit",
    "VertixBot/UI-V3/DynamicChannelPermissionsAccessButton": "permissions",
    "VertixBot/UI-V3/DynamicChannelPrivacyButton": "privacy-state",
    "VertixBot/UI-V3/DynamicChannelRegionButton": "region",
    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton": "edit-primary-message",
    "VertixBot/UI-V3/DynamicChannelClearChatButton": "clear-chat",
    "VertixBot/UI-V3/DynamicChannelResetChannelButton": "reset-channel",
    "VertixBot/UI-V3/DynamicChannelTransferOwnerButton": "transfer-channel",
    "VertixBot/UI-V3/DynamicChannelTemplatesButton": "templates",
    "VertixBot/UI-V3/DynamicChannelStatusButton": "status",
    "VertixBot/UI-V3/DynamicChannelClaimChannelButton": "claim-channel",
    "VertixBot/UI-V3/DynamicChannelInviteButton": "invite-channel",
    "VertixBot/UI-V3/DynamicChannelKnockButton": "knock-channel",
    "VertixBot/UI-V3/DynamicChannelLfmButton": "lfm",
};

/**
 * Function useOpenDynamicChannelFeature() :: Opens the feature a pressed button stands for.
 *
 * Hand the result to a rendered interface as `onElementClick` and its buttons answer the question
 * they raise - "what does this one do?". Lands on the features page with the section selected,
 * which is the same url the features sidebar links to, so the link stays shareable. A button
 * with no feature behind it stays inert.
 */
function useOpenDynamicChannelFeature(
    featuresPath: string,
    featureByElement: Readonly<Record<string, string>>
): ( elementName: string ) => void {
    const navigate = useNavigate();

    return ( elementName: string ) => {
        const feature = featureByElement[ elementName ];

        if ( ! feature ) {
            return;
        }

        navigate( toDynamicChannelFeatureHref( featuresPath, feature ) );

        window.scrollTo( { top: 0, behavior: "smooth" } );
    };
}

/** Opens the v2 feature a pressed button of the v2 panel stands for. */
export function useOpenDynamicChannelV2Feature(): ( elementName: string ) => void {
    return useOpenDynamicChannelFeature(
        DYNAMIC_CHANNEL_V2_FEATURES_PATH,
        DYNAMIC_CHANNEL_V2_FEATURE_BY_ELEMENT
    );
}

/** Opens the v3 feature a pressed button of the v3 panel stands for. */
export function useOpenDynamicChannelV3Feature(): ( elementName: string ) => void {
    return useOpenDynamicChannelFeature(
        DYNAMIC_CHANNEL_V3_FEATURES_PATH,
        DYNAMIC_CHANNEL_V3_FEATURE_BY_ELEMENT
    );
}
