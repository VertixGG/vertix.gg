import { DiscordUIComponentMessage, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

export default function UserLimit() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">✋</span>
                <h3 className="mb-0">User Limit</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="d-flex justify-content-start">
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
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <ul className="text-start">
                                <li><strong>(✋ Limit)</strong> button, allow you to set user limit for the channel.</li>
                                <li>You can see the limit between <code>0</code> to <code>99</code>, &nbsp; <code>0 = Unlimited</code></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "450px" } }>
                            <div className="discord-date-header" style={ { textAlign: "center", color: "#72767d", fontSize: "12px", padding: "8px 0", borderBottom: "1px solid #4f545c", marginBottom: "16px" } }>
                                <span style={ { background: "#36393f", padding: "0 8px" } }>June 9, 2023</span>
                            </div>
                            <DiscordUIComponentMessage
                                author="Vertix"
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
                                author="Vertix"
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

