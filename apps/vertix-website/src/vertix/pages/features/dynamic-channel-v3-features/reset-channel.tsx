import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function ResetChannel() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">🔃</span>
                <h3 className="mb-0">Reset Channel</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>( 🔃 Reset )</b> resets all settings to default.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
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


