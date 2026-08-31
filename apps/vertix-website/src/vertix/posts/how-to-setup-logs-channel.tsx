import { DiscordUIComponentMessage, DiscordCommandSuggestion, DiscordMessage, DiscordEmbed } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc.png";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.png";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

const DYNAMIC_BUTTON_LABELS = [
    "✏️ ∙ **Rename**",
    "✋ ∙ **User Limit**",
    "🧹 ∙ **Clear Chat**",
    "🚫 ∙ **Private** / 🌐 ∙ **Public**",
    "🙈 ∙ **Hidden** / 🐵 ∙ **Shown**",
    "👥 ∙ **Access**",
    "🔃 ∙ **Reset**",
    "🔀 ∙ **Transfer**",
    "😈 ∙ **Claim**"
];

const CONFIG_VARIABLES = {
    index: "1",
    masterChannelId: "1120213539064385597",
    dynamicChannelNameTemplate: "{user}'s Channel",
    dynamicChannelButtonsTemplate: DYNAMIC_BUTTON_LABELS.map( ( label ) => `- ( ${ label } )` ).join( "\n" ),
    verifiedRoles: "@everyone",
    dynamicChannelLogsChannelDisplay: "**None**",
    configUserMention: "`🟢∙On`",
    configAutoSave: "`🔴∙Off`",
    configLogs: "`🔴∙Off`",
    configControlChannelAutoCreate: "`🟢∙On`",
};

const CONFIG_VARIABLES_ENABLED = {
    ...CONFIG_VARIABLES,
    dynamicChannelLogsChannelDisplay: "#general",
    configLogs: "`🟢∙On`",
};

export default function HowToSetupLogsChannel() {
    return (
        <div className="vc-container vc-page-panel">
            <h5>Enabling Dynamic Channel - Logs</h5>
            <br />
            <p className="text-h5">Since <b>Version</b> <code>0.0.5</code> we added <b>Logs Channel</b> is available for each <b>Master Channel</b>.</p>
            <p className="text-h5">The logs disabled by <code>default</code> and can be enabled using <code>/setup</code> command:</p>

            <ol className="text-h5">
                <li>
                    Enter your discord server and type <code>/setup</code> in any channel.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0 box-normalize">
                        <DiscordCommandSuggestion
                            searchTerm="/setup"
                            items={ [
                                {
                                    command: "/setup",
                                    description: "Displaying VoiceChannels setup wizard in ephemeral mode.",
                                    botName: "VoiceChannels",
                                    botAvatar: VertixAvatar
                                }
                            ] }
                        />
                    </div>
                </li>
                <br />
                <li>
                    Please select the Master Channel from which you would like to receive logs for the associated dynamic channels.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:42 PM"
                            componentName="VertixBot/UI-General/SetupComponent"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ {
                                masterChannelMessage: "**#1**\n▷ Name: 🔊 ➕ New Channel\n▷ Channel ID: 1120213539064385597\n▷ Dynamic Channels Name: `{user}'s Channel`\n▷ Buttons: ✏️, ✋, 🧹, 🚫, 🙈, 👥, 🔃, 🔀, 😈\n▷ Verified Roles: @everyone\n▷ Logs Channel: None",
                                badwordsMessage: "`badword*`",
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-General/SetupMasterEditSelectMenu": { highlighted: true }
                            } }
                        />
                    </div>
                </li>
                <br />
                <li>
                    Click on <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59003L12 13.17L7.41 8.59003L6 10L12 16L18 10L16.59 8.59003Z"></path></svg> down arrow.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:42 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ CONFIG_VARIABLES }
                            elementOverrides={ {
                                "VertixBot/UI-V2/LogChannelSelectMenu": { highlightedCaret: true },
                                "VertixBot/UI-General/DeleteButton": { hidden: true },
                            } }
                        />
                    </div>
                </li>
                <br />
                <li>
                    Please choose the channel where you would like to display the logs.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:42 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ CONFIG_VARIABLES_ENABLED }
                            elementOverrides={ {
                                "VertixBot/UI-General/DeleteButton": { hidden: true },
                            } }
                            expandedSelectMenu={ {
                                elementName: "VertixBot/UI-V2/LogChannelSelectMenu",
                                options: [
                                    { label: "# general" }
                                ]
                            } }
                        />
                    </div>
                </li>
                <br />
                <li>
                    Verify that <b>"</b><small>▹ ✎ ∙ Send logs to custom channel</small><b>"</b> is <code>🟢 On</code>.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 3:42 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ CONFIG_VARIABLES_ENABLED }
                            elementOverrides={ {
                                "VertixBot/UI-V2/LogChannelSelectMenu": { selectedLabel: "# general" },
                                "VertixBot/UI-General/DoneButton": { highlighted: true },
                                "VertixBot/UI-General/DeleteButton": { hidden: true },
                            } }
                        />
                    </div>
                    <br />
                    <ul>
                        <h5>Note:</h5>
                        <li>You can always turn it off "<small>⌘ ∙ Configuration</small>" menu.</li>
                        <li>For better security alignment, it is recommended to ensure that the role and permissions of the logs channel match your security requirements.</li>
                        <li>To ensure optimal organization and clarity, it is advisable to utilize a separate log channel for each master channel.</li>
                    </ul>
                </li>
                <br />
                <li>
                    At this point, the logs channel is ready to receive logs from the associated dynamic channels.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            bot={ true }
                            timestamp="Today at 3:44 PM"
                        >
                            <DiscordEmbed
                                color="#0099ff"
                                description="➤ ➕ Dynamic channel has been created, owner: iNewLegend<br/><br/>Channel: `➕ New Channel` masterChannelId: `1120213539064385597` • Today at 3:44 PM"
                            />
                            <DiscordEmbed
                                color="#0099ff"
                                description="➤ ➖ Dynamic channel has been deleted, owner: iNewLegend<br/><br/>Channel: `iNewLegend's Channel` masterChannelId: `1120213539064385597` • Today at 3:44 PM"
                            />
                        </DiscordMessage>
                    </div>
                </li>
            </ol>
        </div>
    );
}
