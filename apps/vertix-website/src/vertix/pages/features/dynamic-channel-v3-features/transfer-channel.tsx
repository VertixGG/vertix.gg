import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES, useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";

export default function TransferChannel() {
    const openFeature = useOpenDynamicChannelV3Feature();

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <DynamicChannelV3Emoji
                    name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.transferChannel }
                    alt="Transfer"
                    fallback="🔀"
                    className="text-h2 mr-4"
                />
                <h3 className="mb-0">Transfer Channel</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>( 🔀 Transfer )</b> allows you to transfer channel ownership to another user.</p>
                        </div>
                    </div>

                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:03 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannel"
                            onElementClick={ openFeature }
                            variables={ DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES }
                        />
                    </div>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>Select the user you want to transfer the channel to.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
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

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><span className="text-vc-magenta">⚠️</span> Are you sure?</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
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

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>The previous owner will fully lose control over the transferred channel.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
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

