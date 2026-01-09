import { DiscordUIComponentMessage, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

export default function RenameChannel() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">✏️</span>
                <h3 className="mb-0">Rename Channel</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="d-flex justify-content-start">
                            <DiscordModal
                                title="Rename dynamic channel"
                                cancelLabel="Cancel"
                                showNotice={ true }
                            >
                                <DiscordInput
                                    label="CHOOSE NAME FOR YOUR CHANNEL"
                                    value="iNewLegend's Office123"
                                    style="short"
                                />
                            </DiscordModal>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <ul className="text-start">
                                <li><strong>Renaming channel is easy click on <b>( ✏️ Rename )</b> button.</strong></li>
                                <li>Then type new name of the channel and press <code>submit</code>.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="discord-chat-container border-box m-0" style={ { minHeight: "450px" } }>
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
                                    limit: "Unlimited",
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
                                timestamp="Today at 3:34 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V2/DynamicChannelMetaRenameComponent"
                                preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelMetaRenameSuccessEmbedGroup"
                                variables={ {
                                    channelName: "iNewLegend's Office123"
                                } }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

