import { DiscordUIComponentMessage, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function RenameChannel() {
    const channelName = "iNewLegend's Office123";

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">✏️</span>
                <h3 className="mb-0">Rename Channel</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="flex justify-start">
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
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <ul className="text-left">
                                <li><strong>Renaming channel is easy click on <b>( ✏️ Rename )</b> button.</strong></li>
                                <li>Then type new name of the channel and press <code>submit</code>.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="discord-chat-container vc-frame-box m-0">
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
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
                                author="VoiceChannels"
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

