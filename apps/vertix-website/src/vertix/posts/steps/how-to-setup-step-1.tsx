import { DiscordUIComponentMessage, DiscordSelectMenuDropdown, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc.png";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.png";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

interface IHowToSetupStep1Props {
    displayStep?: boolean
}

export default function HowToSetupStep1( props: IHowToSetupStep1Props ) {
    return (
        <>
            <li>
                {
                    props.displayStep ? (
                        <h4 id="step-1">Step 1</h4>
                    ) : <h3>Channel's default name</h3>
                }
                <br/>
                Select <b>( ➕ ∙ Create Master Channel )</b> menu to create a new master channel.
                <ul>
                    <li>What is a <b>Master Channel</b>?</li>
                    <ul>
                        <li>A voice channel that generate dynamic temporary voice channels, his name will be <b>(
                            ➕ New Channel )</b></li>
                    </ul>

                    <br/>

                    <li>How i generate new temporary dynamic channel?</li>
                    <ul>
                        <li>Simply just join the <b>Master Channel ( ➕ New Channel )</b> and you will be
                            automatically moved to new temporary voice channel
                        </li>
                    </ul>
                </ul>
                <br/>
                <div className="discord-chat-container vc-frame-box m-0 box-normalize">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:13 AM"
                        componentName="VertixBot/UI-General/SetupComponent"
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-General/SetupMasterCreateSelectMenu": { highlighted: true }
                        } }
                    />
                </div>
                <br/>
                <p>After clicking the menu, you will see the available options:</p>
                <div style={ { maxWidth: "450px" } }>
                    <DiscordSelectMenuDropdown
                        options={ [
                            {
                                iconEmoji: "➕",
                                label: "Dynamic Channel (V2)",
                                description: "Classic dynamic voice channels",
                                highlighted: true,
                            },
                            {
                                iconEmoji: "✨",
                                label: "Dynamic Channel (V3)",
                                description: "Enhanced dynamic channels with more features",
                            },
                            {
                                iconEmoji: "📈",
                                label: "Auto-Scaling Channel",
                                description: "Automatically scales based on member count",
                            },
                        ] }
                    />
                </div>
                <br/>
                <p>Select <b>Dynamic Channel (V2)</b> to continue with the classic setup.</p>
            </li>
            <br/>
            <li>
                <h4 id="set-default-channels-name-template">Set default channel's name template</h4>
                Edit by pressing <div className="vc-btn vc-btn-sm pointer-events-none">#️⃣ Edit Channel
                    Name</div> button or
                continue with <code>default = { "{user}" }'s channel</code>
                by pressing <a href={ `${ props.displayStep ? "#step-2" : "2" }` } className="vc-btn vc-btn-sm vc-btn-azure">Next ▶</a>
                <br/>
                <br/>
                <ul>
                    <li>What is <b>Default Channel's Name Template?</b></li>
                    <ul>
                        <li>Its the name that will be used to create the temporary voice channels, that are
                            created by joining this <b>Master Channel.</b></li>
                    </ul>
                </ul>
                <br/>
                <div className="discord-chat-container vc-frame-box m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:13 AM"
                        componentName="VertixBot/UI-V3/SetupNewWizardComponent"
                        preferredElementsGroup="VertixBot/UI-V3/SetupStep1Component/ElementsGroup"
                        preferredEmbedsGroup="VertixBot/UI-V3/SetupStep1Component/EmbedsGroup"
                        variables={
                            { dynamicChannelNameTemplate: "{user}'s Channel" }
                        }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-General/ChannelNameTemplateEditButton": { highlighted: true },
                            "VertixBot/UI-General/WizardFinishButton": { hidden: true },
                        } }
                    />
                </div>
            </li>
            <br/>

            <ul>
                <li>What is <code>{ "{user}" }</code>?</li>
                <ul>
                    <li>Its name <b>Placeholder</b> that will be used to create the temporary voice
                        channels, that are created by joining this <b>Master Channel.</b></li>
                    <li>Assume your name in discord is <b>Bob</b>, And the placeholder is: <code>{ "{User}" }'s
                        Channel</code> by
                        joining to the <b>Master Channel</b> newly created temporary channel's name
                        will be <code>Bob's Channel</code></li>
                </ul>
            </ul>
            <br/>
            <DiscordModal title="Set dynamic channels name" showNotice={ true } cancelLabel="Cancel">
                <DiscordInput
                    label="SET DEFAULT DYNAMIC CHANNELS NAME"
                    value="{user}'s Office"
                />
            </DiscordModal>
            <p className="pt-12">
                Press <div className="vc-btn vc-btn-azure select-none pointer-events-none">Submit</div> to proceed.
            </p>
            <br/>
            <div className="discord-chat-container vc-frame-box m-0">
                <DiscordUIComponentMessage
                    author="VoiceChannels"
                    avatar={ VertixAvatar }
                    timestamp="Today at 9:35 AM"
                    componentName="VertixBot/UI-V3/SetupNewWizardComponent"
                    preferredElementsGroup="VertixBot/UI-V3/SetupStep1Component/ElementsGroup"
                    preferredEmbedsGroup="VertixBot/UI-V3/SetupStep1Component/EmbedsGroup"
                    variables={ { dynamicChannelNameTemplate: "{user}'s Office" } }
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
            <p className="pt-12">
                Then press <a href={ `${ props.displayStep ? "#step-2" : "2" }` } className="vc-btn vc-btn-sm vc-btn-azure">Next ▶</a> to continue next step.
            </p>
        </>
    );
}
