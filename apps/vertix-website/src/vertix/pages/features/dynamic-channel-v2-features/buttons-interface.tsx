import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { useOpenDynamicChannelV2Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

export default function ButtonsInterface() {
    const openFeature = useOpenDynamicChannelV2Feature();

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🎚</span>
                <h3 className="mb-0">Buttons Interface</h3>
            </div>
            <div className="grid grid-cols-12 gap-12 items-center">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "300px" } }>
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="10:52 AM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V2/DynamicChannel"
                                variables={ {
                                    name: "iNewLegend's Channel",
                                    limit: "Unlimited",
                                    state: "🌐 **Public**",
                                    visibilityState: "🐵 **Shown**",
                                    region: "**Automatic**",
                                } }
                                elementOverrides={ {
                                    "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": { label: "Access" },
                                    // Claim is greyed out in a channel whose owner is still in it,
                                    // which is every channel this panel is drawn for - but the
                                    // panel here is a way into the ten features rather than a
                                    // channel to operate, so it is left pressable like the rest.
                                    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim" },
                                    "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                                    "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                                    "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                                    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset" },
                                    "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer" },
                                } }
                                onElementClick={ openFeature }
                            />
                        </div>
                    </div>
                    <div>
                        <div className="text-h5 text-vc-ice-dim">
                            <ul className="text-left inline-block">
                                <li><strong>The buttons interface is located inside the dynamic channel.</strong></li>
                                <li>Press a button above to read what it does.</li>
                                <li>You can access it by opening the chat box of the dynamic channel.</li>
                                <li>You can modify the buttons using <code>/setup</code> command</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

