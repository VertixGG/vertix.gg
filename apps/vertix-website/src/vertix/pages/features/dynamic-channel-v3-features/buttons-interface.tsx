import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function ButtonsInterface() {
    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">🎚️</span>
                <h3 className="mb-0">Buttons Interface</h3>
            </div>
            <div className="grid grid-cols-12 gap-12 items-center">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="discord-chat-container vc-frame-box m-0">
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="10:52 AM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V3/DynamicChannel"
                                variables={ DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES }
                                elementOverrides={ {
                                    "VertixBot/UI-V3/DynamicChannelClaimChannelButton": { disabled: true }
                                } }
                            />
                        </div>
                    </div>
                    <div className="text-h5 text-vc-ice-dim">
                        <ul className="text-left inline-block">
                            <li><strong>The buttons interface is located inside the dynamic channel.</strong></li>
                            <li>You can access it by opening the chat box of the dynamic channel.</li>
                            <li>You can modify the buttons using <code>/setup</code> command.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

