import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

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
                            <p><b>( 🔀 Transfer )</b> allows you to transfer channel ownership to another user.</p>
                        </div>
                    </div>

                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:03 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannel"
                            variables={ DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES }
                            elementOverrides={ {
                                "VertixBot/UI-V3/DynamicChannelClaimChannelButton": { disabled: true }
                            } }
                        />
                    </div>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>Select the user you want to transfer the channel to.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:05 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelTransferOwnerComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelTransferOwnerEmbedGroup"
                            preferredElementsGroup="VertixBot/UI-V3/DynamicChannelTransferOwnerUserMenuGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><span className="text-warning">⚠️</span> Are you sure?</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:05 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelTransferOwnerComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelTransferOwnerUserSelectedEmbedGroup"
                            preferredElementsGroup="VertixBot/UI-General/YesNoElementsGroup"
                            variables={ {
                                userDisplayName: "leonidvinikov"
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>The previous owner will fully lose control over the transferred channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:39 PM"
                            mentionUsername="doctor-helper"
                            componentName="VertixBot/UI-V3/DynamicChannelTransferOwnerComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelTransferOwnerTransferredEmbedGroup"
                            hideElements={ true }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}


