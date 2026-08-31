import { DiscordUIComponentMessage, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function PrimaryMessageEdit() {
    const title = "༄ Manage your Dynamic Channel";
    const description =
        "Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.\n\n" +
        "Please be advised that the privilege to make alterations is vested solely of the channel owner.";

    return (
        <div className="mb-12">
            <div className="flex items-center mb-4">
                <span className="text-h2 mr-4">📝</span>
                <h3 className="mb-0">Edit Primary Message</h3>
            </div>
            <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12">
                    <div className="mb-6">
                        <div className="text-h5 text-vc-ice-dim">
                            <p className="text-h4"><b>(📝 Edit Primary Message)</b> lets you edit the title and description of the dynamic channel message.</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex flex-wrap gap-4">
                            <DiscordModal title="Edit title" cancelLabel="Cancel" showNotice={ true }>
                                <DiscordInput label="Title" value={ title } style="paragraph" />
                            </DiscordModal>

                            <DiscordModal title="Edit Description" cancelLabel="Cancel" showNotice={ true }>
                                <DiscordInput label="Description" value={ description } style="paragraph" />
                            </DiscordModal>
                        </div>
                    </div>

                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 2:20 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent"
                            variables={ {
                                editPrimaryMessageEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.editPrimaryMessage,
                                title
                            } }
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                        />
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 2:21 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent"
                            variables={ {
                                editPrimaryMessageEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.editPrimaryMessage,
                                description
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

