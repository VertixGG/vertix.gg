import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vertix-icon-discord.webp";

import { DYNAMIC_CHANNEL_V3_EMOJIS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

export default function Templates() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">📂</span>
                <h3 className="mb-0">Channel Templates</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p><b>( 📂 Templates )</b> lets you save and apply configurations with one click.</p>
                        </div>
                    </div>
                    <div className="discord-chat-container border-box m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 7:40 PM"
                            mentionUsername="iNewLegend"
                            componentName="VertixBot/UI-V3/DynamicChannelTemplatesComponent"
                            variables={ {
                                templatesEmoji: DYNAMIC_CHANNEL_V3_EMOJIS.templates,
                                templatesCount: "2",
                                maxTemplates: "5",
                                templatesListDisplay: "**Your Templates:**\n- Gaming\n- Study"
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

