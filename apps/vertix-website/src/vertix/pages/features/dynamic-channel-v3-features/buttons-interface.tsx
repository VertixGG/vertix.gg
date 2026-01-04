import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function ButtonsInterface() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">🎚️</span>
                <h3 className="mb-0">Buttons Interface</h3>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="discord-chat-container border-box w-100 m-0">
                            <DiscordUIComponentMessage
                                author="Vertix"
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
                    <div className="fs-5 text-secondary">
                        <ul className="text-start d-inline-block">
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


