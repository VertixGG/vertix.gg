import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES, useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";

export default function InviteChannel() {
    const openFeature = useOpenDynamicChannelV3Feature();

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <DynamicChannelV3Emoji
                    name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.inviteChannel }
                    alt="Invite"
                    fallback="📨"
                    className="text-h2 mr-4"
                />
                <h3 className="mb-0">Invite</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>( 📨 Invite )</b> lets someone into your channel and tells them where it is.</p>
                            <p>
                                Granting access through the access menu works too, but nothing reaches the person you
                                granted it to. An invite does both at once, which is what makes a private channel
                                usable without explaining it in chat first.
                            </p>
                        </div>
                    </div>

                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:03 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannel"
                            onElementClick={ openFeature }
                            variables={ DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES }
                        />
                    </div>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>Pick who you want in.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:04 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelInviteComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelInviteEmbedGroup"
                            preferredElementsGroup="VertixBot/UI-V3/DynamicChannelInviteUserMenuGroup"
                            variables={ {
                                inviteEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.inviteChannel
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>
                                They get a direct message naming the channel and a link straight to it. If their
                                direct messages are closed you are told so - the access is already theirs either way.
                            </p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:04 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelInviteComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelInviteSentEmbedGroup"
                            variables={ {
                                inviteEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.inviteChannel,
                                invitedDisplayName: "leonidvinikov"
                            } }
                            hideElements={ true }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
