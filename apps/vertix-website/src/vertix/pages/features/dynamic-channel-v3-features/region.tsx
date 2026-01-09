import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function Region() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">🌍</span>
                <h3 className="mb-0">Region</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p className="fs-4"><b>(🌍 Region)</b> button lets you select the voice server region.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 6:10 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelRegionComponent"
                            variables={ {
                                regionEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.region,
                                region: "Automatic"
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


