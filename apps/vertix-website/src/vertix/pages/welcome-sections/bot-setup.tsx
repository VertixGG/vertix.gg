import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import "../../components/discord/discord-chat-container.css";

export default function BotSetup() {
    return (
        <div className="mb-12">
            <h4 id="bot-setup" className="mb-6">Getting Started is a Breeze! ✨</h4>
            <div className="text-h5 text-vc-ice-dim">
                <p className="mb-6">
                    Ready to launch? Follow these simple steps to set up your first Master Channel and transform your server:
                </p>
                <div className="grid grid-cols-12 gap-6 items-center mb-12">
                    <div className="col-span-12 md:col-span-12">
                        <ul className="list-none pl-0">
                            <li className="mb-4">
                                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-vc-azure text-sm font-semibold text-vc-void">1</span>
                                Type <code>/setup</code> in any channel to begin.
                            </li>
                            <li className="mb-4">
                                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-vc-azure text-sm font-semibold text-vc-void">2</span>
                                Click the <strong>➕ Create Master Channel</strong> button.
                            </li>
                            <li className="mb-4">
                                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-vc-azure text-sm font-semibold text-vc-void">3</span>
                                Choose a name template or keep the default by clicking <strong>▶ Next</strong>.
                            </li>
                            <li className="mb-4">
                                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-vc-azure text-sm font-semibold text-vc-void">4</span>
                                Pick your interface buttons and click <strong>▶ Next</strong>.
                            </li>
                            <li className="mb-4">
                                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-vc-azure text-sm font-semibold text-vc-void">5</span>
                                Set your verified roles and click <strong>✔ Finish</strong>!
                            </li>
                        </ul>
                        <p className="mt-6 italic">
                            💡 <strong>Pro Tip:</strong> You can always tweak these settings later using the same <code>/setup</code> command.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 mt-6">
                <div className="discord-chat-container m-0" style={ { minHeight: "500px" } }>

                    <DiscordUIComponentMessage
                        author="VoiceChannels"
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

