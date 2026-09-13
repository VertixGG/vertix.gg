import { useNavigate } from "react-router-dom";

export const DYNAMIC_CHANNEL_V2_FEATURES_PATH = "/features/dynamic-channel-v2",
    DYNAMIC_CHANNEL_V3_FEATURES_PATH = "/features/dynamic-channel-v3";

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
};

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
};

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
};

/**
 * Function useOpenDynamicChannelFeature() :: Opens the feature a pressed button stands for.
 *
 * Hand the result to a rendered interface as `onElementClick` and its buttons answer the question
 * they raise - "what does this one do?". Lands on the features page with the section selected,
 * which is the same url the page's own dropdown produces, so the link stays shareable. A button
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

        navigate( `${ featuresPath }?feature=${ feature }` );

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
