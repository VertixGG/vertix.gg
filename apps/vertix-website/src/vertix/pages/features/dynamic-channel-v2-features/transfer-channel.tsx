import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

export default function TransferChannel() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🔀</span>
                <h3 className="mb-0">Transfer Channel</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>( 🔀 Transfer )</b> button allows you to transfer channel ownership</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "400px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
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
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>Select the user you want to transfer the channel to</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "300px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
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
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><span className="text-vc-magenta">⚠️</span> Are you sure?</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "350px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
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
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>the previous owner will fully lose control over the transferred channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0" style={ { minHeight: "200px" } }>
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
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

