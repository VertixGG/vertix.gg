import { DiscordUIComponentMessage, DiscordCommandSuggestion, DiscordChannelList } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import {
    DYNAMIC_CHANNEL_BUTTON_ORDER,
    MASTER_CHANNEL_ID,
    MASTER_CHANNEL_VARIABLES,
    SETUP_EMPTY_VARIABLES,
    masterChannelButtonList
} from "@vertix.gg/website/src/vertix/components/discord/preview-variables";

import { DEMO_CHANNEL_NAME, DEMO_MEMBERS } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

const CONFIG_VARIABLES = {
    ...MASTER_CHANNEL_VARIABLES,

    dynamicChannelButtonsTemplate: masterChannelButtonList( DYNAMIC_CHANNEL_BUTTON_ORDER )
};

const CONFIG_VARIABLES_AUTO_STATUS_OFF = {
    ...CONFIG_VARIABLES,

    configAutoStatus: "`🔴∙Off`"
};

/**
 * The configuration menu as the bot draws it for the master channel above, where the automatic
 * status is still on.
 *
 * Written out rather than read off the export, because every label there is a template the bot
 * finishes per option - and each option names the state picking it switches to, not the one it is
 * in. That is the whole reason the option that turns the status off reads "Off".
 */
const CONFIGURATION_MENU_OPTIONS = [
    { label: "@ ∙ Mention user in primary message ∙🔴 Off" },
    { label: "⫸ ∙ Auto save dynamic channel ∙🟢 On" },
    { label: "📢 ∙ Automatic channel status ∙🔴 Off", highlighted: true },
    { label: "❯❯ ∙ Send logs to custom channel ∙🔴 Off" }
];

const MASTER_CHANNEL_MESSAGE =
    "**#1**\n" +
    "▷ Name: 🔊 ➕ New Channel\n" +
    `▷ Channel ID: ${ MASTER_CHANNEL_ID }\n` +
    "▷ Dynamic Channels Name: `{user}'s Channel`\n" +
    "▷ Buttons: ✏️, ✋, 🧹, 🚫, 🙈, 👥, 🔃, 🔀, 😈\n" +
    "▷ Verified Roles: @everyone\n" +
    "▷ Logs Channel: None";

const BADWORDS_MESSAGE = "`badword*`";

const CHANNEL = {
    id: "dynamic-channel",
    name: DEMO_CHANNEL_NAME,
    active: true,
    userCount: 3,
    maxUsers: 5,
    users: [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex, DEMO_MEMBERS.jordan ]
};

// What the bot composes for the room above: the game most of it is playing, then how full it is.
const AUTO_STATUS = "Counter-Strike · 3/5";

export default function DisableAutoStatus() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-h5">How to disable the automatic channel status (AutoStatus)</h1>
            <br />

            <p className="text-h5">
                The <b>status</b> is the short line Discord shows under a voice channel&apos;s name. Out of the
                box, VoiceChannels writes it for every dynamic channel and keeps it up to date — the game the
                room is playing, how many people are in it out of its limit, and whether it is private or
                hidden. That is <b>AutoStatus</b>, and it stays on until you switch it off.
            </p>

            <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 md:col-span-6">
                    <p className="text-h5 text-vc-ice-dim mb-2">With AutoStatus</p>
                    <DiscordChannelList
                        title="༄ Dynamic Channels"
                        channels={ [ { ...CHANNEL, status: { text: AUTO_STATUS } } ] }
                    />
                </div>
                <div className="col-span-12 md:col-span-6">
                    <p className="text-h5 text-vc-ice-dim mb-2">With AutoStatus off</p>
                    <DiscordChannelList
                        title="༄ Dynamic Channels"
                        channels={ [ CHANNEL ] }
                    />
                </div>
            </div>

            <p className="text-h5">
                It is set per <b>Master Channel</b>, not per server: switching it off on one leaves every other
                master channel as it was, so repeat the steps for each one it should stop on.
            </p>

            <hr />

            <h2 className="text-h4">In Discord</h2>
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

                    <br /></li>
                <li>
                    Select the <b>Master Channel</b> you want to switch AutoStatus off for.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 6:14 PM"
                            componentName="VertixBot/UI-General/SetupComponent"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ {
                                ...SETUP_EMPTY_VARIABLES,
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

                    <br /></li>
                <li>
                    Open the <b>⌘ ∙ Configuration</b> menu.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 6:14 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ CONFIG_VARIABLES }
                            elementOverrides={ {
                                "VertixBot/UI-General/ConfigExtrasSelectMenu": { highlightedCaret: true },
                                "VertixBot/UI-General/DeleteButton": { hidden: true }
                            } }
                        />
                    </div>

                    <br /></li>
                <li>
                    Pick <b>📢 ∙ Automatic channel status ∙🔴 Off</b>.
                    <br />
                    <br />
                    Each option in this menu names what picking it does, so while AutoStatus is on, its option
                    reads <b>Off</b>.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 6:14 PM"
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
                                elementName: "VertixBot/UI-General/ConfigExtrasSelectMenu",
                                options: CONFIGURATION_MENU_OPTIONS
                            } }
                        />
                    </div>

                    <br /></li>
                <li>
                    That is all — it is saved the moment you pick it, and the screen now reads{ " " }
                    <b>📢 ∙ Automatic channel status: <code>🔴∙Off</code></b>. Press <b>✓ Done</b> to close it.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="Today at 6:15 PM"
                            componentName="VertixBot/UI-V2/ConfigComponent"
                            preferredElementsGroup="VertixBot/UI-V2/SetupEditElementsGroup"
                            preferredEmbedsGroup="VertixBot/UI-V2/SetupEditEmbedGroup"
                            ephemeral={ true }
                            interactionUser="iNewLegend"
                            interactionUserAvatar={ UserAvatar }
                            interactionCommand="/setup"
                            variables={ CONFIG_VARIABLES_AUTO_STATUS_OFF }
                            elementOverrides={ {
                                "VertixBot/UI-General/DoneButton": { highlighted: true },
                                "VertixBot/UI-General/DeleteButton": { hidden: true }
                            } }
                        />
                    </div>
                </li>
            </ol>

            <hr />

            <h2 className="text-h4">In the dashboard</h2>
            <br />

            <ol className="text-h5">
                <li>
                    Open the <a href={ DASHBOARD_URL } target="_blank" rel="noreferrer">dashboard</a>, pick your
                    server and go to <b>Generators</b>.
                </li>
                <li>Select the master channel, then press <b>Edit</b> beside <b>Configuration</b>.</li>
                <li>Switch off <b>Automatic channel status</b> and press <b>Save changes</b>.</li>
            </ol>

            <hr />

            <h2 className="text-h4">After you switch it off</h2>
            <br />

            <ul className="text-h5">
                <li>
                    Channels that are already open keep the last status the bot wrote. Switching AutoStatus off
                    stops the writing, it does not wipe what is there — the line goes when the channel does, and
                    channels opened from then on start without one.
                </li>
                <li>
                    Owners can still set a status of their own with the <b>Status</b> button, and the bot writes
                    that one either way. To take that away too, remove the Status button from the master
                    channel — the same way you <a href="/posts/enable-features">turn a feature on</a>, unticking
                    it instead.
                </li>
                <li>An owner who clears their status is left with an empty line, rather than one the bot fills in.</li>
                <li>
                    A status somebody sets through Discord itself is left alone. With AutoStatus on, the bot
                    writes over it the next time the room changes.
                </li>
                <li>
                    Setting up a new master channel? The same option is in the <b>⌘ ∙ Configuration</b> menu on
                    step 2 of the setup wizard.
                </li>
                <li>
                    To switch it back on, pick the same option again — it now reads{ " " }
                    <b>📢 ∙ Automatic channel status ∙🟢 On</b>. The bot takes the line back the next time
                    something in the channel changes: somebody joins or leaves, or the owner changes its limit
                    or privacy.
                </li>
            </ul>
        </div>
    );
}
