import { DiscordUIComponentMessage, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function UserLimit() {
    const userLimit = "4";

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">✋</span>
                <h3 className="mb-0">User Limit</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="flex justify-start">
                            <DiscordModal
                                title="Set user limit"
                                cancelLabel="Cancel"
                                showNotice={ true }
                            >
                                <DiscordInput
                                    label="SET USER LIMIT (0 FOR UNLIMITED)"
                                    value={ userLimit }
                                    style="short"
                                />
                            </DiscordModal>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <ul className="text-left">
                                <li><strong>(✋ Limit)</strong> button, allow you to set user limit for the channel.</li>
                                <li>You can set the limit between <code>0</code> to <code>99</code>, <code>0 = Unlimited</code></li>
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
                                    name: "iNewLegend's Office123",
                                    limit: userLimit
                                } }
                                elementOverrides={ {
                                    "VertixBot/UI-V3/DynamicChannelClaimChannelButton": { disabled: true }
                                } }
                            />
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 3:35 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V3/DynamicChannelLimitComponent"
                                variables={ {
                                    userLimit,
                                    userLimitValue: userLimit,
                                    userLimitUnlimited: "Unlimited"
                                } }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

