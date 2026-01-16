import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vertix-icon-discord.webp";

export default function TransferChannel() {
    return (
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
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "400px" } }>
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
                                "VertixBot/UI-V2/DynamicChannelTransferOwnerButton": { label: "Transfer Ownership" },
                                "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": { label: "Claim Channel", disabled: true },
                            } }
                        />
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>Select the user you want to transfer the channel to</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "300px" } }>
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:05 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelTransferOwnerComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelTransferOwnerEmbedGroup"
                            preferredElementsGroup="VertixBot/UI-V2/DynamicChannelTransferOwnerUserMenuGroup"
                            elementOverrides={ {
                                "VertixBot/UI-V2/DynamicChannelTransferOwnerUserMenu": {}
                            } }
                            ephemeral={ true }
                        />
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><span className="text-warning">⚠️</span> Are you sure?</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "350px" } }>
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:05 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V2/DynamicChannelTransferOwnerComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelTransferOwnerUserSelectedEmbedGroup"
                            variables={ {
                                userDisplayName: "leonidvinikov"
                            } }
                            preferredElementsGroup="VertixBot/UI-General/YesNoElementsGroup"
                            elementOverrides={ {
                                "VertixBot/UI-General/YesButton": {}
                            } }
                            ephemeral={ true }
                        />
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>the previous owner will fully lose control over the transferred channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0" style={ { minHeight: "200px" } }>
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:39 PM"
                            mentionUsername="doctor-helper"
                            componentName="VertixBot/UI-V2/DynamicChannelTransferOwnerComponent"
                            preferredEmbedsGroup="VertixBot/UI-V2/DynamicChannelTransferOwnerTransferredEmbedGroup"
                            hideElements={ true }
                            ephemeral={ true }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

