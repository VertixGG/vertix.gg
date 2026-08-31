import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function Privacy() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🚫</span>
                <h3 className="mb-0">Privacy State</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p className="text-h4"><b>(🚫 Privacy)</b> controls who can see and who can join your channel.</p>

                            <ul className="text-left">
                                <li><b>🌐 Public</b>: everyone can see and join.</li>
                                <li><b>🚫 Private</b>: everyone can see, only <b>Trusted Users</b> can join.</li>
                                <li><b>🙈 Hidden</b>: only <b>Trusted Users</b> can see and join.</li>
                                <li><b>Blocked Users</b>: cannot join in any state.</li>
                            </ul>

                            <p className="mb-0">Trusted and blocked users are managed via the <b>Permissions</b> feature.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
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
