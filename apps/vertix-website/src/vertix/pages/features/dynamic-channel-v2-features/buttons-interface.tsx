import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vertix-icon-discord.webp";

export default function ButtonsInterface() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">🎚</span>
                <h3 className="mb-0">Buttons Interface</h3>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="discord-chat-container border-box m-0" style={ { minHeight: "300px" } }>
                            <DiscordUIComponentMessage
                                author="Vertix"
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
                                    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { disabled: true, label: "Claim" },
                                    "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                                    "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                                    "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                                    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset" },
                                    "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer" },
                                } }
                            />
                        </div>
                    </div>
                    <div>
                        <div className="fs-5 text-secondary">
                            <ul className="text-start d-inline-block">
                                <li><strong>The buttons interface is located inside the dynamic channel.</strong></li>
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

