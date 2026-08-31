import { DiscordCommandSuggestion, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

import HowToSetupStep1 from "@vertix.gg/website/src/vertix/posts/steps/how-to-setup-step-1";
import HowToSetupStep2 from "@vertix.gg/website/src/vertix/posts/steps/how-to-setup-step-2";
import HowToSetupStep3 from "@vertix.gg/website/src/vertix/posts/steps/how-to-setup-step-3";

export default function HowToSetup() {
    return (
        <>
            <div className="vc-container vc-page-panel">
                <h4>Setup step-by-step</h4>
                <br/>

                <ul className="text-h5">
                    <li>
                        Enter your discord server and type <code>/setup</code> in any channel.
                        <br/>
                        <br/>
                        <DiscordCommandSuggestion
                            searchTerm="/setup"
                            items={ [ {
                                command: "/setup",
                                description: "Displaying VoiceChannels setup wizard in ephemeral mode.",
                                botName: "VoiceChannels",
                                botAvatar: VertixAvatar,
                            } ] }
                        />
                    </li>
                    <hr/>
                    <br/>
                    <HowToSetupStep1 displayStep={ true } />
                    <br/>
                    <hr/>
                    <br/>
                    <HowToSetupStep2 displayStep={ true } />
                    <br/>
                    <hr/>
                    <br/>
                    <HowToSetupStep3 displayStep={ true } />
                </ul>

                <hr/>
                <br/>

                <ul className="text-h5">
                    <li>
                        <h4>Create the dynamic channel</h4>
                        <br/>
                        Join <b>Master Channel (➕ New Channel )</b>
                        <br/>
                        <img className="vc-img" src="https://i.ibb.co/Tc1xJ5M/generate-dynamic.png" alt="s10"/>
                        <br/>
                        You will be automatically moved to new <b>Dynamic Channel (Temporary Voice Channel)</b>.
                        <br/>
                        <br/>
                        Open the chat the interface by clicking on the message badge.
                        <br/>
                        <img className="vc-img" src="https://i.ibb.co/X8nbPs0/enter-dynamic-chan.png" alt="s11"/>
                        <br/>
                        On the right screen of the window you will see the interface.
                        <br/>
                        <br/>
                        <div className="discord-chat-container vc-frame-box m-0">
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 3:33 PM"
                                componentName="VertixBot/UI-V2/DynamicChannel"
                                variables={ {
                                    name: "iNewLegend's Office",
                                    limit: "Unlimited",
                                    state: "🌐 **Public**",
                                    visibilityState: "😎 **Shown**",
                                    displayText: "Private",
                                } }
                                elementOverrides={ {
                                    "VertixBot/UI-V2/DynamicChannelPermissionsStateButton": {
                                        label: "Private",
                                        emoji: "🚫",
                                    },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsVisibilityButton": {
                                        label: "Hidden",
                                        emoji: "🙈",
                                    },
                                    "VertixBot/UI-V2/DynamicChannelPermissionsAccessButton": {
                                        label: "Access",
                                    },
                                    "VertixBot/UI-V2/DynamicChannelPremiumResetChannelButton": {
                                        label: "Reset Channel",
                                    },
                                    "VertixBot/UI-V2/DynamicChannelPremiumClaimChannelButton": {
                                        label: "Claim Channel",
                                    },
                                } }
                            />
                        </div>
                    </li>
                </ul>

                <hr/>

                <div className="vc-container">
                    <br/>
                    <div aria-live="polite" aria-atomic="true"
                        className="flex justify-center items-center">
                        <div className="vc-toast w-full" role="alert" aria-live="assertive" aria-atomic="true">
                            <div className="flex items-center gap-2 border-b border-vc-cyan/20
                                px-3 py-2 text-vc-cyan">
                                <img src="https://simgbb.com/avatar/PGKBv5T3fZLJ.png" width="30"
                                    className="rounded-2xl mr-2"
                                    alt="..."/>
                                <strong className="mr-auto">leonidvinikov@gmail.com</strong>
                                <small className="flex justify-end"><span className="hidden sm:block">Updated at&nbsp;</span>21/06/2023</small>
                            </div>
                            <div className="px-3 py-3 text-vc-ice">
                                Hi there👋<br/><br/>
                                Found something wrong?<br/>
                                Do you have any questions?<br/>
                                Doesn't like something?<br/><br/>
                                <a href="https://discord.com/invite/dEwKeQefUU" target="_blank" rel="noreferrer">Join
                                    our discord server</a> and let us know!
                                or use <code>/help</code> command to send us feedback.<br/><br/>
                                We value your opinion and are eager to take it into consideration!<br/><br/>
                                Best regards ❤️<br/>
                                <b>VoiceChannels Team</b>.
                            </div>
                        </div>
                    </div>
                </div>

                <br/>
            </div>

        </>
    );
}
