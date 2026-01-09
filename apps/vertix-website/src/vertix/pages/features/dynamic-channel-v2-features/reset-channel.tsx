import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

export default function ResetChannel() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">🔃</span>
                <h3 className="mb-0">Reset Channel</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>( 🔃 Reset )</b> button, need a quick reset to defaults? The result includes:</p>
                            <ul className="text-start">
                                <li><code>Name</code></li>
                                <li><code>User Limit</code></li>
                                <li><code>State</code></li>
                                <li><code>Granted Users</code></li>
                            </ul>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:33 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannel"
                            variables={ {
                                name: "iNewLegend's Office",
                                limit: "Unlimited",
                                state: "🌐 **Public**",
                                visibilityState: "🐵 **Shown**",
                                region: "Automatic",
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                                "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                                "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                                "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": { label: "Access" },
                                "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset Channel" },
                                "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim Channel", disabled: true },
                                "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { hidden: true },
                            } }
                        />

                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:38 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelPremiumResetChannelComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPremiumResetChannelEmbedGroup"
                            variables={ {
                                name: "iNewLegend's Office",
                                nameChanged: "(__restored__)",
                                userLimit: "Unlimited",
                                userLimitChanged: "(__restored__)",
                                state: "🌐 **Public**",
                                stateChanged: "(__unchanged__)",
                                visibilityState: "🐵 **Shown**",
                                visibilityStateChanged: "(__unchanged__)",
                                allowedUsers: "<@iNewLegend>",
                                allowedUsersChanged: "(__unchanged__)",
                                blockedUsers: "None",
                                blockedUsersChanged: "(__unchanged__)",
                                rateLimited: "",
                            } }
                            hideElements={ true }
                            ephemeral={ true }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

