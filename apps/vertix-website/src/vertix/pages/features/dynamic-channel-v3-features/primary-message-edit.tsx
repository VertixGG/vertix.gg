import { DiscordUIComponentMessage, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import { DYNAMIC_CHANNEL_V3_EMOJIS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function PrimaryMessageEdit() {
    const title = "༄ Manage your Dynamic Channel";
    const description =
        "Embrace the responsibility of overseeing your dynamic channel, diligently customizing it according to your discerning preferences.\n\n" +
        "Please be advised that the privilege to make alterations is vested solely of the channel owner.";

    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">📝</span>
                <h3 className="mb-0">Edit Primary Message</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p className="fs-4"><b>(📝 Edit Primary Message)</b> lets you edit the title and description of the dynamic channel message.</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="d-flex flex-wrap gap-3">
                            <DiscordModal title="Edit title" cancelLabel="Cancel" showNotice={ true }>
                                <DiscordInput label="Title" value={ title } style="paragraph" />
                            </DiscordModal>

                            <DiscordModal title="Edit Description" cancelLabel="Cancel" showNotice={ true }>
                                <DiscordInput label="Description" value={ description } style="paragraph" />
                            </DiscordModal>
                        </div>
                    </div>

                    <div className="discord-chat-container border-box w-100 m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
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
                            author="Vertix"
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


