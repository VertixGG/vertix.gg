import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function Privacy() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">🚫</span>
                <h3 className="mb-0">Privacy State</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p className="fs-4"><b>(🚫 Privacy)</b> button lets you manage privacy and visibility state.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 4:12 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelPrivacyComponent"
                            variables={ {
                                privacyEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.privacy,
                                state: "🌐 Public",
                                stateMessage: "Everyone can join your channel.",
                                allowedUsersDisplay: "- <@doctor-helper>\n",
                                blockedUsersDisplay: "Currently there are no blocked users.\n"
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


