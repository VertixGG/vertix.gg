import { DiscordUIComponentMessage, DiscordModal, DiscordInput, DiscordMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

// Reuse the chat container style
import "../../components/discord/discord-chat-container.css";

export default function DynamicChannelV2Page() {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-xl-10 ">
                    <h1 className="text-center">Dynamic Channel V2 - Features</h1>
                    <hr/>

                    <div className="mb-5">
                        <div className="d-flex align-items-center mb-3">
                            <span className="fs-2 me-3">🎚</span>
                            <h3 className="mb-0">Buttons Interface</h3>
                        </div>
                        <div className="row g-5 align-items-center">
                            <div className="col-12">
                                <div className="mb-4">
                                    <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "300px" } }>
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
                    <hr />
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
                    <hr />
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
                    <hr />
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
                    <hr />
                    <div className="mb-5">
                        <div className="d-flex align-items-center mb-3">
                            <span className="fs-2 me-3">🚫 / 🌐</span>
                            <h3 className="mb-0">- Toggle Channel State</h3>
                        </div>
                        <div className="row g-5">
                            <div className="col-12">
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p><b>(🚫 Private )</b> button, will allow only granted users to connect the channel.</p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
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
                                                state: "🚫 **Private**",
                                                visibilityState: "🐵 **Shown**",
                                                region: "**Automatic**",
                                            } }
                                            elementOverrides={ {
                                                "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                                                "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                                                "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                                                "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Public" },
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
                                            timestamp="Today at 2:51 PM"
                                            mentionUsername="iNewLegend"
                                            componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsPrivateEmbedGroup"
                                            variables={ {
                                                allowedUsersDisplay: "_Allowed users_:\n• @doctor-helper\n",
                                                message: "You can use **( 👥 Access )** - _Button_ to manage the access of your channel."
                                            } }
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p><b>(🌐 Public )</b> button, restore the permissions of <code>Connect</code> back to default,<br/>Now everyone can connect.</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
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
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsPublicEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelPermissionsPublicEmbed": {
                                                title: "🌐  The channel is public now",
                                                description: "Please be aware that your room is currently accessible to anyone.\n\nMembers **without** access will be able to enter the room unless it is hidden or set to private."
                                            }
                                        } }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
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
                                    <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
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
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
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
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelPermissionsShownEmbed": {
                                                title: "🐵  The channel is visible now"
                                            }
                                        } }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="mb-5">
                        <div className="d-flex align-items-center mb-3">
                            <span className="fs-2 me-3">👥</span>
                            <h3 className="mb-0">Access</h3>
                        </div>
                        <div className="row g-5">
                            <div className="col-12">
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p className="fs-4"><b>(👥 Access )</b> button, provides management menus.</p>
                                        <b>Displays:</b><br/>
                                        - <b>Granted</b> Users<br/>
                                        - <b>Blocked</b> Users
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 3:08 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsAccessEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelPermissionsAccessEmbed": {
                                                title: "👥  Manage permissions of your channel",
                                                description: "**_Allowed Users_**:\n• @doctor-helper\n\n**_Blocked Users_**:\nCurrently there are no blocked users."
                                            }
                                        } }
                                    />
                                </div>

                                <hr className="my-5"/>

                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p><b>(👍 Grant Access )</b> menu, give member the permissions to override channel state.</p>
                                        <p>Granted users will be able to <b>see / join</b> the channel even if its <b>private</b> or <b>hidden</b>.</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 3:08 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsGrantedEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelPermissionsGrantedEmbed": {
                                                title: "👍  Access granted",
                                                description: "**clicpow** added successfully and now has access to this channel!\n\n**_Allowed Users_**:\n• @doctor-helper\n• @ClicpoW\n\n**_Blocked Users_**:\nCurrently there are no blocked users."
                                            }
                                        } }
                                    />
                                </div>

                                <hr className="my-5"/>

                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p><b>(👎 Remove Access )</b> menu, remove user access from allowed list</p>
                                        <p>User cannot enter or see the channel according to the state.</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 3:08 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsDeniedEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelPermissionsDeniedEmbed": {
                                                title: "👎  Access canceled",
                                                description: "**clicpow** successfully revoked and no longer has access to this channel!\n\n**_Allowed Users_**:\n• @doctor-helper\n\n**_Blocked Users_**:\nCurrently there are no blocked users."
                                            }
                                        } }
                                    />
                                </div>

                                <hr className="my-5"/>

                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p className="fs-5"><b>(🫵 Block User Access )</b> menu, block & kick the user from the channel.</p>
                                        <p>Blocked users will be restricted from viewing or connecting to the channel.</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 3:08 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsBlockedEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelPermissionsBlockedEmbed": {
                                                title: "🫵  User blocked",
                                                description: "**clicpow** successfully blocked and no longer has access to this channel!\n\n**_Allowed Users_**:\n• @doctor-helper\n\n**_Blocked Users_**:\n• @clicpow"
                                            }
                                        } }
                                    />
                                </div>

                                <hr className="my-5"/>

                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p><b>(🤙 Un-block User Access )</b> menu, remove user from blocked users list</p>
                                        <p>User can enter or see the channel according to the state.</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 3:08 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsUnblockedEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelPermissionsUnblockedEmbed": {
                                                title: "🤙  User unblocked",
                                                description: "**clicpow** successfully un-blocked!\n\n**_Allowed Users_**:\nCurrently there are no granted users.\n\n**_Blocked Users_**:\nCurrently there are no blocked users."
                                            }
                                        } }
                                    />
                                </div>

                                <hr className="my-5"/>

                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p><b>(👢 Kick User )</b> menu, simply kicks the user from the channel.</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 3:08 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannelPermissionsComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelPermissionsKickEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelPermissionsKickEmbed": {
                                                title: "👢  User kicked",
                                                description: "**clicpow** successfully kicked!\n\n**_Allowed Users_**:\n• @doctor-helper\n\n**_Blocked Users_**:\nCurrently there are no blocked users."
                                            }
                                        } }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
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
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "300px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 3:47 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannelPremiumResetChannelComponent"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelPremiumResetChannelEmbed": {
                                                title: "🔃  Dynamic Channel has been reset to default settings!",
                                                description: "Settings has been reset to default:\n\n- Name: **{name}** {nameChanged}\n- User limit: ✋**{userLimit}** {userLimitChanged}\n- State: {state} {stateChanged}\n- Visibility State: {visibilityState} {visibilityStateChanged}\n- Allowed Users: {allowedUsers} {allowedUsersChanged}\n- Blocked Users: {blockedUsers} {blockedUsersChanged}"
                                            }
                                        } }
                                        variables={ {
                                            name: "iNewLegend's Channel",
                                            nameChanged: "(__restored__)",
                                            userLimit: "Unlimited",
                                            userLimitChanged: "(__restored__)",
                                            state: "🌐 **Public**",
                                            stateChanged: "(__restored__)",
                                            visibilityState: "🐵 **Shown**",
                                            visibilityStateChanged: "(__restored__)",
                                            allowedUsers: "None",
                                            allowedUsersChanged: "(__restored__)",
                                            blockedUsers: "None",
                                            blockedUsersChanged: "(__restored__)"
                                        } }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="mb-5">
                        <div className="d-flex align-items-center mb-3">
                            <span className="fs-2 me-3">🔀</span>
                            <h3 className="mb-0">Transfer Channel</h3>
                        </div>
                        <div className="row g-5">
                            <div className="col-12">
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p><b>( 🔀 Transfer )</b> button allows you to transfer channel ownership</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "400px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 10:03 PM"
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
                                            "VertixBot/UI-V2/DynamicChannelMetaRenameButton": { label: "Rename" },
                                            "VertixBot/UI-V2/DynamicChannelMetaLimitButton": { label: "Limit" },
                                            "VertixBot/UI-V2/DynamicChannelMetaClearChatButton": { label: "Clear Chat" },
                                            "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": { label: "Private" },
                                            "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": { label: "Hidden" },
                                            "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": { label: "Access" },
                                            "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": { label: "Reset Channel" },
                                            "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer Ownership", highlighted: true },
                                            "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim Channel", disabled: true },
                                        } }
                                    />
                                </div>
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p>Select the user you want to transfer the channel to</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "300px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 10:05 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannelTransferOwnerComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelTransferOwnerEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelTransferOwnerEmbed": {
                                                title: "🔀  Transfer channel ownership",
                                                description: "Transfer channel ownership to another user.\n\nSelect the user to whom you want to transfer the channel."
                                            }
                                        } }
                                    />
                                </div>
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p><span style={ { color: "yellow" } }>⚠️</span> Are you sure?</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "350px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 10:05 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannelTransferOwnerComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelectedEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelectedEmbed": {
                                                title: "🔀  Transfer channel ownership",
                                                description: "Transfer channel ownership to leonidvinikov.\n\n⚠️ By transferring the channel ownership to another user, you will lose your ownership privileges.\n\nAre you sure you want to transfer the channel ownership to\n**leonidvinikov**?"
                                            }
                                        } }
                                    />
                                </div>
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p>the previous owner will fully lose control over the transferred channel.</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "200px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 4:39 PM"
                                        mentionUsername="doctor-helper"
                                        componentName="VertixBot/UI-V2/DynamicChannelTransferOwnerComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelTransferOwnerTransferredEmbedGroup"
                                        embedOverrides={ {
                                            "VertixBot/UI-V2/DynamicChannelTransferOwnerTransferredEmbed": {
                                                title: "🔀  Transfer channel ownership succeeded!",
                                                description: "You are no longer the owner of this channel."
                                            }
                                        } }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="mb-5">
                        <div className="d-flex align-items-center mb-3">
                            <span className="fs-2 me-3">😈</span>
                            <h3 className="mb-0">Claim Channel</h3>
                        </div>
                        <div className="row g-5">
                            <div className="col-12">
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p><b>( 😈 Claim )</b> button will be enabled if the owner leaves the channel</p>
                                        <p>for more than X <code>default = 10</code> minutes. If the owner does not return, the claim button will be enabled.</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "600px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 4:16 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannel"
                                        variables={ {
                                            name: "iNewLegend's Office",
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
                                            "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim Channel" },
                                        } }
                                    />
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 4:27 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/ClaimStartComponent"
                                        variables={ {
                                            ownerId: "123456789",
                                            ownerDisplayName: "iNewLegend",
                                            absentMinutes: "10.0"
                                        } }
                                    />
                                </div>
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p>If the owner returns or clicks the <code>claim</code> button, ownership will return to them!</p>
                                    </div>
                                </div>
                                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "600px" } }>
                                    <DiscordUIComponentMessage
                                        author="Vertix"
                                        avatar={ VertixAvatar }
                                        timestamp="Today at 4:16 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/DynamicChannel"
                                        variables={ {
                                            name: "iNewLegend's Office",
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
                                        timestamp="Today at 4:28 PM"
                                        mentionUsername="iNewLegend"
                                        componentName="VertixBot/UI-V2/ClaimResultComponent"
                                        preferredEmbedsGroup="VertixBot/UI-V2/ClaimResultOwnerStopEmbedGroup"
                                        variables={ {
                                            absentMinutes: "10.0"
                                        } }
                                    />
                                </div>
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p>If the owner doesn't return, and someone else clicks on the <b>claim</b> button, they will have X minutes (<code>default = 1</code>) to claim the ownership.</p>
                                        <p>If they don't claim within that time or if someone else steps in, the whole vote process will begin!</p>
                                    </div>
                                </div>
                                <div className="image-placeholder">
                                    <img
                                        src="https://vertix.twic.pics/images/features-dynamic-channels/25_claim_2_candidates_wish_to_claim_b.png"
                                        alt="vote-process"
                                        style={ { maxWidth: "100%", borderRadius: "8px" } }
                                    />
                                </div>
                                <div className="mb-4">
                                    <div className="fs-5 text-secondary">
                                        <p>At the end of the vote, you will see the new owner's name and a link for the vote results.</p>
                                        <p>Below is an example of how the link for the results looks like:</p>
                                    </div>
                                </div>
                                <div className="image-placeholder">
                                    <img
                                        src="https://vertix.twic.pics/images/features-dynamic-channels/26_claim_results_z.png"
                                        alt="vote-results"
                                        style={ { maxWidth: "100%", borderRadius: "8px" } }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

