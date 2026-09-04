import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc.png";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.png";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

import { ArrowDown } from "@vertix.gg/website/src/vertix/ui/arrows";

interface IHowToSetupStep2Props {
    displayStep?: boolean
}

export default function HowToSetupStep2( props: IHowToSetupStep2Props ) {
    return (
        <>
            <li>
                {
                    props.displayStep ? (
                        <h4 id="step-2">Step 2</h4>
                    ) :  <h4>Set temporary dynamic channel's button interface</h4>
                }
                <br/>
                {
                    props.displayStep ?  <h4>Set temporary dynamic channel's button interface</h4> : null
                }
                Click on ( <div className="vc-btn vc-btn-sm pointer-events-none"><ArrowDown/></div> ) down arrow to edit or
                continue with <b>( <code>default = All Buttons Enabled</code> )</b> by
                pressing <a href={ `${ props.displayStep ? "#step-3" : "3" }` } className="vc-btn vc-btn-sm vc-btn-azure">Next ▶</a>
                <br/>
                <br/>
                <div className="discord-chat-container vc-frame-box m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:35 AM"
                        componentName="VertixBot/UI-V2/SetupNewWizardComponent"
                        preferredElementsGroup="VertixBot/UI-V2/SetupStep2Component/ElementsGroup"
                        preferredEmbedsGroup="VertixBot/UI-V2/SetupStep2Component/EmbedsGroup"
                        embedOverrides={ {
                            "VertixBot/UI-V2/SetupStep2Embed": {
                                title: "Step 2 - Dynamic Channels Setup",
                                description: "Setup dynamic channel management interface.\n\n**_🎚 Buttons Interface_**\n\n- ( ✏️ ∙ **Rename** )\n- ( ✋ ∙ **User Limit** )\n- ( 🧹 ∙ **Clear Chat** )\n- ( 🚫 ∙ **Private** / 🌐 ∙ **Public** )\n- ( 🙈 ∙ **Hidden** / 🐵 ∙ **Shown** )\n- ( 👥 ∙ **Access** )\n- ( 🔃 ∙ **Reset** )\n- ( 🔀 ∙ **Transfer** )\n- ( 😈 ∙ **Claim** )\n\n**_⚙️ Configuration_**\n\n> @ ∙ Mention user in primary message: `🟢∙On`\n> ⫸ ∙ Auto save dynamic channels: `🔴∙Off`\n> ▥ ∙ Auto create panel channel: `🟢∙On`\n\nYou can keep the default settings by pressing **( `Next ▶` )** button.\n\nNot sure what buttons do? check out the [explanation](https://voicechannels.online/features/dynamic-channel-v2).",
                            },
                        } }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu": { highlighted: true },
                            "VertixBot/UI-General/WizardFinishButton": { hidden: true },
                        } }
                        expandedSelectMenu={ {
                            elementName: "VertixBot/UI-V2/ChannelButtonsTemplateSelectMenu",
                            selectedValues: [ "4", "5", "6", "7" ],
                        } }
                    />
                </div>
            </li>
            <br/>
            <p>
                Select buttons you wish to enable in your temporary dynamic channels that created by joining
                this <b>Master Channel</b>.
            </p>
            <h5>What the buttons do?</h5>

            <p><b>Basic Controls:</b></p>
            <ul>
                <li>✏️ <b>Rename</b> - Allow the channel owner to rename his channel.</li>
                <li>✋ <b>User Limit</b> - Allow the channel owner to set members limit.</li>
                <li>🧹 <b>Clear Chat</b> - Clear basic messages (not including embeds).</li>
            </ul>

            <p><b>Privacy & Visibility:</b></p>
            <ul>
                <li>🚫/🌐 <b>Private/Public</b> - Toggle channel connectivity.</li>
                <li>🙈/🐵 <b>Hidden/Shown</b> - Toggle channel visibility.</li>
            </ul>

            <p><b>Access Management:</b></p>
            <ul>
                <li>👥 <b>Access</b> - Edit channel permissions with 4 sub-options:
                    <ul>
                        <li>👍 Grant Access - Allow user to see/connect even when private.</li>
                        <li>👎 Remove Access - Revoke previously granted access.</li>
                        <li>🫵 Block User - Kick and prevent user from connecting.</li>
                        <li>🤙 Un-Block User - Remove the block.</li>
                    </ul>
                </li>
            </ul>

            <p><b>Advanced:</b></p>
            <ul>
                <li>🔃 <b>Reset Channel</b> - Restore default state (name, limit, visibility, permissions).</li>
                <li>🔀 <b>Transfer Ownership</b> - Transfer channel ownership to another user.</li>
                <li>😈 <b>Claim Channel</b> - Claim ownership after owner leaves for 10 minutes.</li>
            </ul>

            <p className="pt-12">
                Select the options that suit you, then click <a href={ `${ props.displayStep ? "#step-3" : "3" }` } className="vc-btn vc-btn-sm vc-btn-azure">Next ▶</a> to continue.
            </p>
            <br/>
            <div className="discord-chat-container vc-frame-box m-0">
                <DiscordUIComponentMessage
                    author="VoiceChannels"
                    avatar={ VertixAvatar }
                    timestamp="Today at 9:35 AM"
                    componentName="VertixBot/UI-V2/SetupNewWizardComponent"
                    preferredElementsGroup="VertixBot/UI-V2/SetupStep2Component/ElementsGroup"
                    preferredEmbedsGroup="VertixBot/UI-V2/SetupStep2Component/EmbedsGroup"
                    embedOverrides={ {
                        "VertixBot/UI-V2/SetupStep2Embed": {
                            title: "Step 2 - Dynamic Channels Setup",
                            description: "Setup dynamic channel management interface.\n\n**_🎚 Buttons Interface_**\n\n- ( ✏️ ∙ **Rename** )\n- ( ✋ ∙ **User Limit** )\n- ( 🧹 ∙ **Clear Chat** )\n- ( 🚫 ∙ **Private** / 🌐 ∙ **Public** )\n- ( 🙈 ∙ **Hidden** / 🐵 ∙ **Shown** )\n- ( 👥 ∙ **Access** )\n- ( 🔃 ∙ **Reset** )\n- ( 🔀 ∙ **Transfer** )\n- ( 😈 ∙ **Claim** )\n\n**_⚙️ Configuration_**\n\n> @ ∙ Mention user in primary message: `🟢∙On`\n> ⫸ ∙ Auto save dynamic channels: `🔴∙Off`\n> ▥ ∙ Auto create panel channel: `🟢∙On`\n\nYou can keep the default settings by pressing **( `Next ▶` )** button.\n\nNot sure what buttons do? check out the [explanation](https://voicechannels.online/features/dynamic-channel-v2).",
                        },
                    } }
                    ephemeral={ true }
                    interactionUser="iNewLegend"
                    interactionUserAvatar={ UserAvatar }
                    interactionCommand="/setup"
                    elementOverrides={ {
                        "VertixBot/UI-General/WizardNextButton": { highlighted: true },
                        "VertixBot/UI-General/WizardFinishButton": { hidden: true },
                    } }
                />
            </div>
        </>
    );
}
