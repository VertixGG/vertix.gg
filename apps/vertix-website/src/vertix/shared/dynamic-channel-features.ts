import { useNavigate } from "react-router-dom";

export const DYNAMIC_CHANNEL_V3_FEATURES_PATH = "/features/dynamic-channel-v3";

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
};

/**
 * Function useOpenDynamicChannelV3Feature() :: Opens the feature a pressed button stands for.
 *
 * Hand the result to a rendered interface as `onElementClick` and its buttons answer the question
 * they raise - "what does this one do?". Lands on the features page with the section selected,
 * which is the same url the page's own dropdown produces, so the link stays shareable. A button
 * with no feature behind it stays inert.
 */
export function useOpenDynamicChannelV3Feature(): ( elementName: string ) => void {
    const navigate = useNavigate();

    return ( elementName: string ) => {
        const feature = DYNAMIC_CHANNEL_V3_FEATURE_BY_ELEMENT[ elementName ];

        if ( ! feature ) {
            return;
        }

        navigate( `${ DYNAMIC_CHANNEL_V3_FEATURES_PATH }?feature=${ feature }` );

        window.scrollTo( { top: 0, behavior: "smooth" } );
    };
}
