import { DiscordUIComponentMessage, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function RenameChannel() {
    const channelName = "iNewLegend's Office123";

    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">✏️</span>
                <h3 className="mb-0">Rename Channel</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="d-flex justify-content-start">
                            <DiscordModal
                                title="Rename dynamic channel"
                                cancelLabel="Cancel"
                                showNotice={ true }
                            >
                                <DiscordInput
                                    label="CHOOSE NAME FOR YOUR CHANNEL"
                                    value={ channelName }
                                    style="short"
                                />
                            </DiscordModal>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <ul className="text-start">
                                <li><strong>Renaming channel is easy click on <b>( ✏️ Rename )</b> button.</strong></li>
                                <li>Then type new name of the channel and press <code>submit</code>.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="discord-chat-container border-box w-100 m-0">
                            <DiscordUIComponentMessage
                                author="Vertix"
                                avatar={ VertixAvatar }
                                timestamp="Today at 3:33 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V3/DynamicChannel"
                                variables={ {
                                    ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                    name: channelName
                                } }
                                elementOverrides={ {
                                    "VertixBot/UI-V3/DynamicChannelClaimChannelButton": { disabled: true }
                                } }
                            />
                            <DiscordUIComponentMessage
                                author="Vertix"
                                avatar={ VertixAvatar }
                                timestamp="Today at 3:34 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V3/DynamicChannelRenameComponent"
                                preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelRenameSuccessEmbedGroup"
                                variables={ {
                                    channelName
                                } }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


