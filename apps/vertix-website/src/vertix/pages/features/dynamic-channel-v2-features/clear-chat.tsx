import { DiscordUIComponentMessage, DiscordMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

export default function ClearChat() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">🧹</span>
                <h3 className="mb-0">Clear Chat</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><strong><b>(🧹 Clear Chat )</b> button, will clear all the non embeds messages.</strong></p>
                            <p>We believe in full customization, if you enabled <code>Send Messages</code> sometimes you may want to clean the channel</p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "400px" } }>
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
                            <DiscordMessage
                                author="doctor-helper"
                                avatar="https://cdn.discordapp.com/embed/avatars/0.png"
                                timestamp="Today at 2:32 PM"
                            >
                                <div style={ { color: "#dcddde", fontSize: "1rem", lineHeight: "1.5" } }>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eu mi at nulla eleifend placerat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Curabitur auctor risus leo, sed aliquam nisl imperdiet sed. Mauris dignissim convallis sem non malesuada. Nullam eget ullamcorper diam. Nam consequat nisi risus, sed hendrerit libero tincidunt at. Sed vitae ligula sed lacus luctus scelerisque non sed elit. Aenean a bibendum massa. Mauris tincidunt velit in nunc laoreet, et dignissim leo semper. Nulla iaculis auctor ante in imperdiet. Mauris non scelerisque ex. Proin suscipit, tellus in sodales dictum, erat ligula ornare justo, in vulputate mauris velit vitae elit.
                                </div>
                                <div style={ { color: "#dcddde", fontSize: "1rem", lineHeight: "1.5", marginTop: "8px" } }>
                                    Cras odio nibh, blandit eget efficitur id, tincidunt ac nulla. Sed pretium purus vitae malesuada ultrices. Duis sed est ut turpis mollis consectetur eget a orci. Nulla lacinia, mi quis bibendum scelerisque, quam turpis ornare elit, sit amet porta metus velit at sapien. Nulla erat enim, ultrices quis dapibus et, mollis in turpis. Sed vitae ultricies purus. Maecenas gravida pharetra elit non condimentum. Mauris purus lorem, posuere eu risus ut, porttitor imperdiet sapien. Etiam vel tellus nec sem lobortis ornare. Aenean euismod dictum arcu non viverra. Donec vitae felis rhoncus, ornare sapien non, egestas lacus. Phasellus tincidunt rhoncus volutpat. Ut est tellus, tristique in erat eu, efficitur vestibulum orci. Fusce sed mollis est, sed auctor ipsum. Sed in bibendum lorem, in tempor diam. Sed vehicula lorem efficitur tellus dignissim efficitur.
                                </div>
                            </DiscordMessage>
                            <DiscordMessage
                                author="iNewLegend"
                                avatar="https://cdn.discordapp.com/embed/avatars/1.png"
                                timestamp="Today at 2:32 PM"
                                app={ false }
                            >
                                <div style={ { color: "#dcddde", fontSize: "1rem" } }>What a mess</div>
                            </DiscordMessage>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "400px" } }>
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
                                timestamp="Today at 2:36 PM"
                                componentName="VertixBot/UI-V2/DynamicChannelMetaClearChatComponent"
                                preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelMetaClearChatSuccessEmbedGroup"
                                variables={ {
                                    ownerDisplayName: "inewlegend",
                                    totalMessages: "2"
                                } }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

