import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJI_NAMES, useOpenDynamicChannelV3Feature } from "@vertix.gg/website/src/vertix/shared/dynamic-channel-features";

import { DYNAMIC_CHANNEL_V3_EMOJIS, DYNAMIC_CHANNEL_V3_PRIMARY_MESSAGE_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";
import { DynamicChannelV3Emoji } from "@vertix.gg/website/src/vertix/components/discord/dynamic-channel-v3-emoji";

export default function KnockChannel() {
    const openFeature = useOpenDynamicChannelV3Feature();

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <DynamicChannelV3Emoji
                    name={ DYNAMIC_CHANNEL_V3_EMOJI_NAMES.knockChannel }
                    alt="Knock"
                    fallback="🚪"
                    className="text-h2 mr-4"
                />
                <h3 className="mb-0">Knock</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p><b>( 🚪 Knock )</b> asks the owner of a private channel to let you in.</p>
                            <p>
                                It is the one button that is not for the owner. Without it a private channel is a
                                wall - you can see it, you cannot join it, and the only way in is to find the owner
                                somewhere else and ask. Knock turns it into a door.
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
                            <p>The owner is asked, inside the channel itself.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:04 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelKnockRequestComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelKnockRequestEmbedGroup"
                            preferredElementsGroup="VertixBot/UI-General/YesNoElementsGroup"
                            variables={ {
                                knockEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.knockChannel,
                                knockerId: "123456789",
                                knockerDisplayName: "doctor-helper"
                            } }
                        />
                    </div>

                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p>
                                Letting them in grants access the way the access menu would, and either answer reaches
                                whoever knocked. Ignoring it answers too - a request expires on its own, and one
                                person can only have one waiting per channel.
                            </p>
                        </div>
                    </div>
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:05 PM"
                            mentionUsername="doctor-helper"
                            componentName="VertixBot/UI-V3/DynamicChannelKnockComponent"
                            preferredEmbedsGroup="VertixBot/UI-V3/DynamicChannelKnockSentEmbedGroup"
                            variables={ {
                                knockEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.knockChannel,
                                knockedChannelName: "iNewLegend's Channel"
                            } }
                            hideElements={ true }
                            ephemeral={ true }
                            interactionUser="doctor-helper"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
