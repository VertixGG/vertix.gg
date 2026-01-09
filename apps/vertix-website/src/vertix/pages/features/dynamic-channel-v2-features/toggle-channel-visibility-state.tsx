import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

export default function ToggleChannelVisibilityState() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">🙈 / 🐵</span>
                <h3 className="mb-0">- Toggle Channel Visibility State</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>(🙈 Hidden )</b> button, change <code>View Channel</code> permission to <code>False</code> only granted user can see the channel.</p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="discord-chat-container border-box m-0" style={ { minHeight: "500px" } }>
                            <div className="discord-date-header" style={ { textAlign: "center", color: "#72767d", fontSize: "12px", padding: "8px 0", borderBottom: "1px solid #4f545c", marginBottom: "16px" } }>
                                <span style={ { background: "#36393f", padding: "0 8px" } }>June 25, 2023</span>
                            </div>
                            <DiscordUIComponentMessage
                                author="Vertix"
                                avatar={ VertixAvatar }
                                timestamp="Today at 1:00 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V2/DynamicChannel"
                                variables={ {
                                    name: "inewlegend's Channel",
                                    limit: "Unlimited",
                                    state: "🌐 **Public**",
                                    visibilityState: "🙈 **Hidden**",
                                    region: "**Automatic**",
                                } }
                                elementOverrides={ {
                                    "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                                    "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                                    "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Shown" },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": { label: "Access" },
                                    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset" },
                                    "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer" },
                                    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim", disabled: true },
                                } }
                            />
                            <DiscordUIComponentMessage
                                author="Vertix"
                                avatar={ VertixAvatar }
                                timestamp="Today at 2:51 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                                preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsHiddenEmbedGroup"
                                variables={ {
                                    allowedUsersDisplay: "_Allowed users_:\n• @doctor-helper\n",
                                    message: "You can use **( 👥 Access )** - _Button_ to manage the access of your channel."
                                } }
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>(🐵 Shown )</b> button, restore the permissions of <code>View Channel</code> back to default.<br/>Now everyone can see the channel</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "500px" } }>
                        <div className="discord-date-header" style={ { textAlign: "center", color: "#72767d", fontSize: "12px", padding: "8px 0", borderBottom: "1px solid #4f545c", marginBottom: "16px" } }>
                            <span style={ { background: "#36393f", padding: "0 8px" } }>June 25, 2023</span>
                        </div>
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 1:00 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannel"
                            variables={ {
                                name: "inewlegend's Channel",
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
                                "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset" },
                                "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer" },
                                "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim", disabled: true },
                            } }
                        />
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 2:58 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsShownEmbedGroup"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

