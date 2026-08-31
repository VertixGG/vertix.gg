import { DiscordUIComponentMessage, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

export default function UserLimit() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">✋</span>
                <h3 className="mb-0">User Limit</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="flex justify-start">
                            <DiscordModal
                                title="Set user limit"
                                cancelLabel="Cancel"
                                showNotice={ true }
                            >
                                <DiscordInput
                                    label="SET USER LIMIT (0 FOR UNLIMITED)"
                                    value="4"
                                    style="short"
                                />
                            </DiscordModal>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <ul className="text-left">
                                <li><strong>(✋ Limit)</strong> button, allow you to set user limit for the channel.</li>
                                <li>You can see the limit between <code>0</code> to <code>99</code>, &nbsp; <code>0 = Unlimited</code></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "450px" } }>
                            <div className="discord-date-header" style={ { textAlign: "center", color: "#72767d", fontSize: "12px", padding: "8px 0", borderBottom: "1px solid #4f545c", marginBottom: "16px" } }>
                                <span style={ { background: "#36393f", padding: "0 8px" } }>June 9, 2023</span>
                            </div>
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 3:33 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V2/DynamicChannel"
                                variables={ {
                                    name: "iNewLegend's Office123",
                                    limit: "4",
                                    state: "🌐 **Public**",
                                    visibilityState: "🐵 **Shown**",
                                    region: "**Automatic**",
                                } }
                                elementOverrides={ {
                                    "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                                    "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                                    "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": { label: "Access" },
                                    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset Channel" },
                                    "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer" },
                                    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim Channel", disabled: true },
                                } }
                            />
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 3:35 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V2/DynamicChannelMetaLimitComponent"
                                preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelMetaLimitSuccessEmbedGroup"
                                variables={ {
                                    userLimit: "4"
                                } }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

