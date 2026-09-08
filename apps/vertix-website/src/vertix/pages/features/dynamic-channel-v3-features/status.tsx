import { DiscordUIComponentMessage, DiscordModal, DiscordInput, DiscordChannelList } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES, useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";

export default function Status() {
    const openFeature = useOpenDynamicChannelV3Feature();

    const customStatus = "Ranked grind, need two";

    const channelMembers = [
        { id: "1", username: "iNewLegend", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" },
        { id: "2", username: "Alex", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" },
        { id: "3", username: "Jordan", avatar: "https://cdn.discordapp.com/embed/avatars/2.png" }
    ];

    const channel = {
        id: "dynamic-channel",
        name: "iNewLegend's Channel",
        active: true,
        userCount: 3,
        maxUsers: 5,
        users: channelMembers
    };

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <DynamicChannelV3Emoji
                    name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.status }
                    alt="Status"
                    fallback="📢"
                    className="text-h2 mr-4"
                />
                <h3 className="mb-0">Channel Status</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><strong>The status is the line Discord shows under your channel's name, press <b>( 📢 Status )</b> to set it.</strong></p>
                            <ul className="text-left">
                                <li>Type what is happening in your channel and press <code>submit</code>.</li>
                                <li>It stays until you change it, submit an empty status to clear it.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="flex justify-start">
                            <DiscordModal
                                title="Set dynamic channel status"
                                cancelLabel="Cancel"
                                showNotice={ true }
                            >
                                <DiscordInput
                                    label="WHAT IS HAPPENING IN YOUR CHANNEL"
                                    value={ customStatus }
                                    style="short"
                                />
                            </DiscordModal>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="discord-chat-container vc-frame-box m-0">
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 9:12 PM"
                                mentionUsername="iNewLegend"
                                componentName="VertixBot/UI-V3/DynamicChannel"
                                onElementClick={ openFeature }
                                variables={ {
                                    ...DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES,
                                    name: channel.name,
                                    limit: String( channel.maxUsers )
                                } }
                            />
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 9:13 PM"
                                componentName="VertixBot/UI-V3/DynamicChannelStatusComponent"
                                preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelStatusSuccessEmbedGroup"
                                variables={ {
                                    channelStatus: customStatus
                                } }
                                ephemeral={ true }
                                interactionUser="iNewLegend"
                            />
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 md:col-span-6">
                                <h5 className="text-vc-ice-dim mb-2">Without a status</h5>
                                <DiscordChannelList
                                    title="༄ Dynamic Channels"
                                    channels={ [ channel ] }
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <h5 className="text-vc-ice-dim mb-2">With your status</h5>
                                <DiscordChannelList
                                    title="༄ Dynamic Channels"
                                    channels={ [ { ...channel, status: { text: customStatus } } ] }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
