import { DiscordUIComponentMessage, DiscordCommandSuggestion } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vertix-icon-discord.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.png";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

const DYNAMIC_BUTTON_LABELS = [
    "✏️ ∙ **Rename**",
    "✋ ∙ **User Limit**",
    "🧹 ∙ **Clear Chat**",
    "🚫 ∙ **Private** / 🌐 ∙ **Public**",
    "🙈 ∙ **Hidden** / 🐵 ∙ **Shown**",
    "👥 ∙ **Access**",
    "🔃 ∙ **Reset Channel**",
    "😈 ∙ **Claim Channel**"
];

const BUTTON_OPTION_VALUES = {
    rename: "0",
    limit: "1",
    clearChat: "2",
    privatePublic: "3",
    shownHidden: "4",
    access: "5",
    reset: "6",
    transfer: "12",
    claim: "7"
};

const DEFAULT_SELECTED_BUTTON_VALUES = [
    BUTTON_OPTION_VALUES.rename,
    BUTTON_OPTION_VALUES.limit,
    BUTTON_OPTION_VALUES.clearChat,
    BUTTON_OPTION_VALUES.privatePublic,
    BUTTON_OPTION_VALUES.shownHidden,
    BUTTON_OPTION_VALUES.access,
    BUTTON_OPTION_VALUES.reset,
    BUTTON_OPTION_VALUES.claim
];

const CONFIG_VARIABLES = {
    index: "1",
    masterChannelId: "1120709141841842227",
    dynamicChannelNameTemplate: "{user}'s Channel",
    dynamicChannelButtonsTemplate: DYNAMIC_BUTTON_LABELS.map( ( label ) => `- ( ${ label } )` ).join( "\n" ),
    verifiedRoles: "@everyone",
    dynamicChannelLogsChannelDisplay: "**None**",
    configUserMention: "`🟢∙On`",
    configAutoSave: "`🔴∙Off`",
    configLogs: "`🔴∙Off`",
    configControlChannelAutoCreate: "`🟢∙On`",
};

const MASTER_CHANNEL_MESSAGE =
    "**#1**\n" +
    "▷ Name: 🔊 ➕ New Channel\n" +
    "▷ Channel ID: 1120709141841842227\n" +
    "▷ Dynamic Channels Name: `{user}'s Channel`\n" +
    "▷ Buttons: ✏️, ✋, 🧹, 🚫, 🙈, 👥, 🔃, 😈\n" +
    "▷ Verified Roles: @everyone\n" +
    "▷ Logs Channel: None";

const BADWORDS_MESSAGE = "`badword*`";

export default function EnableTransferOwnership() {
    return (
        <div className="container box-1">
            <h5>Enabling Dynamic Channel - Buttons</h5>
            <br />

            <ol className="fs-5">
                <li>
                    Enter your discord server and type <code>/setup</code> in any channel.
                    <br />
                    <br />
                    <div className="discord-chat-container border-box m-0 box-normalize">
                        <DiscordCommandSuggestion
                            searchTerm="/setup"
                            items={ [
                                {
                                    command: "/setup",
                                    description: "Displaying Vertix setup wizard in ephemeral mode.",
                                    botName: "Vertix",
                                    botAvatar: VertixAvatar
                                }
                            ] }
                        />
                    </div>
                </li>
                <br />
                <li>
                    Select <b>Master Channel</b> you want to enable the button in.
                    <br />
                    <br />
                    <div className="discord-chat-container border-box m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:22 PM"
                            componentName="VertixBot/UI-General/SetupComponent"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ {
                                masterChannelMessage: MASTER_CHANNEL_MESSAGE,
                                badwordsMessage: BADWORDS_MESSAGE
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-General/SetupMasterEditSelectMenu": {
                                    highlighted: true,
                                    selectedLabel: "Edit Master Channel #1"
                                }
                            } }
                        />
                    </div>
                </li>
                <br />
                <li>
                    Select <b>Edit Channel's Buttons</b> option.
                    <br />
                    <br />
                    <div className="discord-chat-container border-box m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:22 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ CONFIG_VARIABLES }
                            elementOverrides={ {
                                "VertixBot/UI-General/DeleteButton": { hidden: true }
                            } }
                            expandedSelectMenu={ {
                                elementName: "VertixBot/UI-V2/SetupEditSelectEditOptionMenu",
                                highlightedValue: "edit-dynamic-channel-buttons"
                            } }
                        />
                    </div>
                </li>
                <br />
                <li>
                    Click on <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59003L12 13.17L7.41 8.59003L6 10L12 16L18 10L16.59 8.59003Z"></path></svg> down arrow.
                    <br />
                    <br />
                    <div className="discord-chat-container border-box m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:22 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditButtonsElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditButtonsEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ CONFIG_VARIABLES }
                            elementOverrides={ {
                                "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu": { highlightedCaret: true }
                            } }
                        />
                    </div>
                </li>
                <br />
                <li>
                    Select the <b>🔀 Transfer Ownership</b> for example option, then press <b>done</b> button.
                    <br />
                    <br />
                    <div className="discord-chat-container border-box m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:22 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditButtonsElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditButtonsEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ CONFIG_VARIABLES }
                            expandedSelectMenu={ {
                                elementName: "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu",
                                selectedValues: DEFAULT_SELECTED_BUTTON_VALUES,
                                highlightedValue: BUTTON_OPTION_VALUES.transfer
                            } }
                        />
                    </div>
                </li>
                <br />
                <li>
                    At this point, you have two options:
                    <ul>
                        <li>Enable it for all dynamic channels (including newly created).</li>
                        <li>Enable it only for newly created dynamic channels.</li>
                    </ul>
                    <br />
                    Select the option that suits you the most.
                    <br />
                    <br />
                    <div className="discord-chat-container border-box m-0">
                        <DiscordUIComponentMessage
                            author="Vertix"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:56 AM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditButtonsEffectElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditButtonsEffectEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ CONFIG_VARIABLES }
                        />
                    </div>
                    <br />
                    That's all! Now your members can transfer ownership of dynamic channels.
                </li>
            </ol>
        </div>
    );
}
