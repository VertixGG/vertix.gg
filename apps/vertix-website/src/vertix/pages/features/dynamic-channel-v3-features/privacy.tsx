import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vertix-icon-discord.webp";

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
                            <p className="fs-4"><b>(🚫 Privacy)</b> controls who can see and who can join your channel.</p>

                            <ul className="text-start">
                                <li><b>🌐 Public</b>: everyone can see and join.</li>
                                <li><b>🚫 Private</b>: everyone can see, only <b>Trusted Users</b> can join.</li>
                                <li><b>🙈 Hidden</b>: only <b>Trusted Users</b> can see and join.</li>
                                <li><b>Blocked Users</b>: cannot join in any state.</li>
                            </ul>

                            <p className="mb-0">Trusted and blocked users are managed via the <b>Permissions</b> feature.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0">
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
