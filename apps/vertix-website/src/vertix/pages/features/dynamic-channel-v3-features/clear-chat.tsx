import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function ClearChat() {
    const ownerDisplayName = "iNewLegend";

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
                            <p>We believe in full customization, if you enabled <code>Send Messages</code> sometimes you may want to clean the channel.</p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="discord-chat-container border-box m-0">
                            <DiscordUIComponentMessage
                                author="Vertix"
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
                                author="Vertix"
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


