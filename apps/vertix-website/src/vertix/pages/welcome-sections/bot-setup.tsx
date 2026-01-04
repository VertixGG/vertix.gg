import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/Robot.png";

import "../../components/discord/discord-chat-container.css";

export default function BotSetup() {
    return (
        <div className="mb-5">
            <h4 id="bot-setup" className="mb-4">Getting Started is a Breeze! ✨</h4>
            <div className="fs-5 text-secondary">
                <p className="mb-4">
                    Ready to launch? Follow these simple steps to set up your first Master Channel and transform your server:
                </p>
                <div className="row g-4 align-items-center mb-5">
                    <div className="col-md-12">
                        <ul className="list-unstyled">
                            <li className="mb-3">
                                <span className="badge bg-primary rounded-circle me-2">1</span>
                                Type <code>/setup</code> in any channel to begin.
                            </li>
                            <li className="mb-3">
                                <span className="badge bg-primary rounded-circle me-2">2</span>
                                Click the <strong>➕ Create Master Channel</strong> button.
                            </li>
                            <li className="mb-3">
                                <span className="badge bg-primary rounded-circle me-2">3</span>
                                Choose a name template or keep the default by clicking <strong>▶ Next</strong>.
                            </li>
                            <li className="mb-3">
                                <span className="badge bg-primary rounded-circle me-2">4</span>
                                Pick your interface buttons and click <strong>▶ Next</strong>.
                            </li>
                            <li className="mb-3">
                                <span className="badge bg-primary rounded-circle me-2">5</span>
                                Set your verified roles and click <strong>✔ Finish</strong>!
                            </li>
                        </ul>
                        <p className="mt-4 fst-italic">
                            💡 <strong>Pro Tip:</strong> You can always tweak these settings later using the same <code>/setup</code> command.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-4 mt-4">
                <div className="discord-chat-container border-box w-100 m-0" style={ { minHeight: "500px" } }>

                    <DiscordUIComponentMessage
                        author="Vertix"
                        avatar={ VertixAvatar }
                        timestamp="Today at 5:55 PM"
                        mentionUsername="iNewLegend"
                        interactionUser="iNewLegend"
                        interactionCommand="/setup"
                        ephemeral={ true }
                        componentName="VertixBot/UI-V3/ConfigComponent"
                        preferredEmbedsGroup="VertixBot/UI-V3/SetupEditEmbedGroup"
                        embedOverrides={ {
                            "VertixBot/UI-V3/SetupEditEmbed": {
                                description:
                                    "Configure master channel according to your preferences.\n\n"
                                    + "**_🎛️ General_**\n\n"
                                    + "➤ ∙ Name: {masterChannelName}\n"
                                    + "➤ ∙ Channel ID: <span class=\"discord-embed-code\">{masterChannelId}</span>\n"
                                    + "➤ ∙ Dynamic Channels Name: <span class=\"discord-embed-code\">{dynamicChannelNameTemplate}</span>\n"
                                    + "➤ ∙ Logs Channel: {logsChannel}\n\n"
                                    + "**_🎚 Buttons Interface_**\n\n"
                                    + "{dynamicChannelButtonsTemplate}\n\n"
                                    + "**_🛡️ Verified Roles_**\n\n"
                                    + "▹ {verifiedRolesDisplay}\n\n"
                                    + "**_⚙️ Configuration_**\n\n"
                                    + "@ ∙ Mention user in primary message: {configUserMention}\n"
                                    + "⫸ ∙ Auto save dynamic channels: {configAutoSave}\n"
                                    + "❯❯ ∙ Send logs to custom channel: {configLogs}\n\n",
                            },
                        } }
                        variables={ {
                            index: "1",
                            masterChannelId: "1121075197588541460",
                            masterChannelName: "<span class=\"discord-mention-pill\">🔊 + New Channel</span>",
                            dynamicChannelNameTemplate: "{user}'s Channel",
                            logsChannel: "<span class=\"discord-mention-pill\">#logs</span>",
                            dynamicChannelButtonsTemplate:
                                "• ( ✏️ ∙ **Rename** )\n"
                                + "• ( ✋ ∙ **User Limit** )\n"
                                + "• ( 🧹 ∙ **Clear Chat** )\n"
                                + "• ( 🚫 ∙ **Private** / 🌐 ∙ **Public** )\n"
                                + "• ( 🙈 ∙ **Hidden** / 🐵 ∙ **Shown** )\n"
                                + "• ( 👥 ∙ **Access** )\n"
                                + "• ( 🔄 ∙ **Reset** )\n"
                                + "• ( 🔀 ∙ **Transfer** )\n"
                                + "• ( 😈 ∙ **Claim** )",
                            verifiedRolesDisplay: "<span class=\"discord-mention-pill\">@everyone</span>",
                            configUserMention: "`🟢 On`",
                            configAutoSave: "`🟢 On`",
                            configLogs: "`🟢 On`",
                        } }
                        elementOverrides={ {
                            "VertixBot/UI-General/DoneButton": { label: "✓ Done" },
                        } }
                    />
                </div>
            </div>
        </div>
    );
}

