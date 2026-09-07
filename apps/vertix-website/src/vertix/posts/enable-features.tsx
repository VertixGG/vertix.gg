import { DiscordUIComponentMessage, DiscordCommandSuggestion } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc.png";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.png";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

// Copied from the `buttonsList` array options of `VertixBot/UI-V2/SetupEditButtonsEmbed`, so the
// page reads exactly like the screen it is documenting.
const DYNAMIC_BUTTON_LABELS = [
    "✏️ ∙ **Rename**",
    "✋ ∙ **User Limit**",
    "🧹 ∙ **Clear Chat**",
    "🚫 ∙ **Private** / 🌐 ∙ **Public**",
    "🙈 ∙ **Hidden** / 🐵 ∙ **Shown**",
    "👥 ∙ **Access**",
    "🔃 ∙ **Reset**",
    "😈 ∙ **Claim**"
];

const BUTTONS_LIST = DYNAMIC_BUTTON_LABELS.map( ( label ) => `> - ${ label }` ).join( "\n" );

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

// The renderer substitutes only from this map - it does not read the language file's `options`,
// so every display variable is given its resolved text rather than the token the bot resolves.
const CONFIG_VARIABLES = {
    index: "1",
    masterChannelId: "1120709141841842227",
    dynamicChannelNameTemplate: "{user}'s Channel",
    dynamicChannelButtonsTemplate: DYNAMIC_BUTTON_LABELS.map( ( label ) => `- ( ${ label } )` ).join( "\n" ),
    verifiedRoles: "@everyone",
    dynamicChannelLogsChannelDisplay: "**None**",
    newChannelPrivacy: "🌐 Public",
    newChannelLimit: "Copied from the generator channel",
    staffRolesDisplay: "**None**",
    voiceRoleDisplay: "**None**",
    configUserMention: "`🟢∙On`",
    configAutoSave: "`🔴∙Off`",
    configLogs: "`🔴∙Off`",
    configControlChannelAutoCreate: "`🟢∙On`",
};

const BUTTONS_VARIABLES = {
    ...CONFIG_VARIABLES,

    // Written with the channel's display name rather than a `<#id>` mention: discord renders that
    // as a pill, the site has no channel resolver and would print the raw id.
    scopeDisplay:
        "**You are editing the default buttons of 🔊 ➕ New Channel.**\n" +
        "Whoever owns a channel created here sees these buttons — unless they have one of the " +
        "roles listed further down, which replaces this set for them.",
    listHeadingDisplay: "**On every panel**",
    buttonsList: BUTTONS_LIST,
    rosterHeading: "**Roles with buttons of their own**",
    rosterDisplay:
        "> - *None yet. Every owner gets the default set.*\n" +
        "> - *For example: let one role claim and reset channels while everyone else can only rename.*",
    hintDisplay: "To give one role a different set, pick it in **➕ Give a role its own buttons**."
};

// After the pick is saved, the same screen comes back with Transfer in the list and the closing
// line replaced by the confirmation.
const BUTTONS_SAVED_VARIABLES = {
    ...BUTTONS_VARIABLES,

    buttonsList: [ ...DYNAMIC_BUTTON_LABELS, "🔀 ∙ **Transfer**" ]
        .map( ( label ) => `> - ${ label }` )
        .join( "\n" ),
    hintDisplay:
        "✅ Sent to every channel this master channel has open. Each one now shows the set its " +
        "own owner should get."
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

export default function EnableFeatures() {
    return (
        <div className="vc-container vc-page-panel">
            <h5>Enabling Dynamic Channel Features</h5>
            <br />

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
                    Select the <b>Master Channel</b> you want to turn the feature on for.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:22 PM"
                            componentName="VertixBot/UI-General/SetupComponent"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ {
                                masterChannelMessage: MASTER_CHANNEL_MESSAGE,
                                badwordsMessage: BADWORDS_MESSAGE,
                                voiceRoleMessage: "None"
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
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
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
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:22 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditButtonsElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditButtonsEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ BUTTONS_VARIABLES }
                            elementOverrides={ {
                                "VertixBot/UI-V2/SetupEditButtonsScopeSelectMenu": { selectedLabel: "🌐 Default buttons" },
                                "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu": { highlightedCaret: true }
                            } }
                        />
                    </div>
                </li>
                <br />
                <li>
                    Tick the feature you want to turn on — <b>🔀 Transfer</b> here, as an example.
                    Anything you tick is added, anything you untick is removed.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:22 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditButtonsElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditButtonsEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ BUTTONS_VARIABLES }
                            elementOverrides={ {
                                "VertixBot/UI-V2/SetupEditButtonsScopeSelectMenu": { selectedLabel: "🌐 Default buttons" }
                            } }
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
                    Your pick is saved straight away — the list in the message updates to include it.
                    <br />
                    <br />
                    Channels that are <b>already open</b> keep the buttons they were created with.
                    Press <b>🔄 Update Existing Channels</b> to send the new set to them as well.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 10:56 AM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditButtonsElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditButtonsEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ BUTTONS_SAVED_VARIABLES }
                            elementOverrides={ {
                                "VertixBot/UI-V2/SetupEditButtonsScopeSelectMenu": { selectedLabel: "🌐 Default buttons" },
                                "VertixBot/UI-V2/SetupEditButtonsUpdateExistingButton": { highlighted: true }
                            } }
                        />
                    </div>
                    <br />
                    That's all — every feature on this screen is turned on and off the same way.
                    <br />
                    <br />
                    Want one role to get a different set? Pick it in{ " " }
                    <b>➕ Give a role its own buttons</b> — its owners see that set instead of the
                    default one, and everyone else is unaffected.
                </li>
            </ol>
        </div>
    );
}
