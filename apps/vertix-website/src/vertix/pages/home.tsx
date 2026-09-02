import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";
import VertixAvatar from "@vertix.gg/assets/brand/vc.png";

import DiscordDynamicChannelV2 from "../components/discord/discord-dynamic-channel-v2";
import DiscordDynamicChannelV3 from "../components/discord/discord-dynamic-channel-v3";

import "../components/discord/discord-chat-container.css";

export default function Home() {
    return (
        <>
            <div className="vc-container vc-page-panel">
                <div className="grid grid-cols-12 text-center pt-2 select-none">
                    <div className="col-span-12 lg:col-span-4">
                        <span className="block text-[clamp(54px,12vw,100px)] font-bold leading-none
                            text-vc-crimson drop-shadow-[0_0_28px_var(--vc-glow-crimson)]">
                            ⫸
                        </span>

                        <h2 className="font-normal">Auto Save</h2>
                        <p className="text-vc-ice">You can disable or enable autosave for temporary voice channels for
                            each voice channels generator</p>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
                        <span className="block text-[clamp(54px,12vw,100px)] font-bold leading-none
                            text-vc-cyan drop-shadow-[0_0_28px_var(--vc-glow-cyan)]">
                            ❯❯
                        </span>

                        <h2 className="font-normal">Logs</h2>
                        <p className="text-vc-ice">Select <code>#log-channel</code> to monitor channels activity,
                            support's log channel per voice channels generator</p>
                    </div>

                    <div className="col-span-12 lg:col-span-4">
                        <span className="block text-[clamp(54px,12vw,100px)] font-bold leading-none
                            text-vc-mint drop-shadow-[0_0_28px_var(--vc-glow-mint)]">
                            ⌘
                        </span>

                        <h2 className="font-normal">Configuration</h2>
                        <p className="text-vc-ice">Configuration of the features & interface, always available
                            via <code>/setup</code> command</p>
                    </div>
                </div>

                <hr className="mb-12"/>

                <h3 className="mb-4">Who is <b>VoiceChannels</b>?</h3>

                <p className="text-h5">is an exceptional Discord bot designed to revolutionize your server experience.</p>
                <p className="text-h5">Sets a new standard in Discord bots.</p>
                <p className="text-h5">With a focus on providing best user satisfaction, as well as offering convenient
                    temporary voice channels
                    and comprehensive owner management tools.</p>
                <p className="text-h5">Operated on a dedicated server, <b>VoiceChannels</b> guarantees an impressive uptime of
                    99%,
                    ensuring reliable
                    performance and uninterrupted access for your server members.</p>

                <br/>

                <div className="hidden xl:block mb-12">
                    <h3 className="mb-6 text-center">Experience the evolution of VoiceChannels</h3>
                    <div className="mt-6">
                        <div className="mb-12">
                            <h4 className="mb-4 text-vc-ice-dim text-center">UI V2 (Classic)</h4>
                            <DiscordDynamicChannelV2/>
                        </div>

                        <div>
                            <h4 className="mb-4 text-vc-azure-soft text-center">UI V3 (Modern)</h4>
                            <DiscordDynamicChannelV3/>
                        </div>
                    </div>
                </div>

                <h3 className="mb-4">Why should you choose <b>VoiceChannels</b>?</h3>

                <p className="text-h5">Developed by a team of experienced developers, we have crafted this bot with utmost
                    dedication to ensure
                    an exceptional user experience.</p>
                <p className="text-h5">We value your input and actively review each <a
                    href="mailto:leonidvinikov@gmail.com">suggestion</a> and customization request
                    you provide.</p>
                <p className="text-h5">Most of the features in <b>VoiceChannels</b> are based on suggestions from our community.
                </p>
                <p className="text-h5">
                    We are dedicated to providing the best user experience with <b>VoiceChannels</b>, and we are excited to
                    incorporate your ideas and suggestions into our platform.
                    Your input is invaluable to us, and we appreciate your contribution to making <b>VoiceChannels</b> even
                    better.
                </p>
                <br/>
                <p className="text-h5">We have an extensive backlog of
                    exciting features in
                    the pipeline, including:</p>
                <ul>
                    <li>Fully customizable text elements to personalize your server's appearance.</li>
                    <li>A user-friendly dashboard for easy configuration and management.</li>
                    <li>Support for multiple languages to cater to diverse communities</li>
                    <li>Server logs to keep track of important activities and events.</li>
                    <li>And many more exciting features on the horizon!</li>
                </ul>
                <br/>
                <p className="text-h5">To get started with <b>VoiceChannels</b>, use <code>/setup</code> command and follow our
                    simple <a href="/posts/how-to-setup">step-by-step</a> guide.</p>
                <br/>

                <div className="hidden xl:block mb-12">
                    <div className="discord-chat-container vc-frame-box m-0">
                        <DiscordUIComponentMessage
                            author="VoiceChannels"
                            avatar={ VertixAvatar }
                            timestamp="12:12"
                            mentionUsername="iNewLegend"
                            interactionUser="iNewLegend"
                            interactionCommand="/setup"
                            ephemeral={ true }
                            componentName="VertixBot/UI-General/SetupComponent"
                            variables={ {
                                masterChannelMessage: "None",
                                badwordsMessage: "`bla`"
                            } }
                            elementOverrides={ {
                                "VertixBot/UI-General/SetupMasterEditSelectMenu": { hidden: true },
                                "VertixBot/UI-General/SetupMasterCreateSelectMenu": { highlighted: false }
                            } }
                        />
                    </div>
                    <br/>
                </div>

                <p className="text-h5">Thank you for considering <b>VoiceChannels</b>, and we look forward to enhancing your
                    Discord
                    server experience</p>
                <p className="text-h5">Best regards,</p>
                <p className="text-h5"><b>VoiceChannels</b> team.</p>
            </div>
        </>
    );
}
