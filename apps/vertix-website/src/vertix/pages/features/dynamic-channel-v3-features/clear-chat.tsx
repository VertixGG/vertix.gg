import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function ClearChat() {
    const ownerDisplayName = "iNewLegend";

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🧹</span>
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
                                variables={ {
                                    ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                    name: "iNewLegend's Channel"
                                } }
                                elementOverrides={ {
                                    "VertixBot/UI-V3/DynamicChannelClaimChannelButton": { disabled: true }
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

