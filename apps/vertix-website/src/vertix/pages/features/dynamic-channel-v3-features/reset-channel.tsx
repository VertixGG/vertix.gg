import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function ResetChannel() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🔃</span>
                <h3 className="mb-0">Reset Channel</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>( 🔃 Reset )</b> resets all settings to default.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 6:31 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelResetChannelComponent"
                            variables={ {
                                resetEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.resetChannel,
                                name: "iNewLegend's Channel",
                                nameChanged: "(__restored__)",
                                userLimit: "Unlimited",
                                userLimitChanged: "(__unchanged__)",
                                state: "🌐 **Public**",
                                stateChanged: "(__unchanged__)",
                                visibilityState: "🐵 **Shown**",
                                visibilityStateChanged: "(__unchanged__)",
                                region: "Automatic",
                                regionChanged: "(__unchanged__)",
                                primaryMessageChanged: "(__unchanged__)",
                                allowedUsers: "None",
                                allowedUsersChanged: "(__unchanged__)",
                                blockedUsers: "None",
                                blockedUsersChanged: "(__unchanged__)",
                                rateLimited: ""
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

