import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES, useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";

export default function ClearChat() {
    const openFeature = useOpenDynamicChannelV3Feature();

    const ownerDisplayName = "iNewLegend";

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <DynamicChannelV3Emoji
                    name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.clearChat }
                    alt="Clear Chat"
                    fallback="🧹"
                    className="text-h2 mr-4"
                />
                <h3 className="mb-0">Clear Chat</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><strong><b>(🧹 Clear Chat )</b> button, will clear all the non embeds messages.</strong></p>
                            <p>We believe in full customization, if you enabled <code>Send Messages</code> sometimes you may want to clean the channel.</p>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="discord-chat-container vc-frame-box m-0">
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 1:00 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V3/DynamicChannel"
                                onElementClick={ openFeature }
                                variables={ {
                                    ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                    name: "iNewLegend's Channel"
                                } }
                            />
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 2:36 PM"
                                componentName="VertixBot/UI-V3/DynamicChannelClearChatComponent"
                                preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelClearChatSuccessEmbedGroup"
                                variables={ {
                                    clearEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.clearChat,
                                    ownerDisplayName,
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

