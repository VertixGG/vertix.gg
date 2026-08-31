import VCBrand from "@vertix.gg/assets/brand/vc-naked.png";

import Terms from "./welcome-sections/terms";
import TemporaryVoiceChannelsFeatures from "./welcome-sections/temporary-voice-channels-features";
import SetupFeatures from "./welcome-sections/setup-features";
import AutoScalingFeatures from "./welcome-sections/auto-scaling-features";
import DashboardFeatures from "./welcome-sections/dashboard-features";
import BotSetup from "./welcome-sections/bot-setup";
import ButtonsInterface from "./welcome-sections/buttons-interface";
import Suggestions from "./welcome-sections/suggestions";
import NegativeReviews from "./welcome-sections/negative-reviews";

import "../components/discord/discord-chat-container.css";

export default function Welcome() {
    return (
        <div className="p-4 md:p-12">
            <div className="flex justify-center">
                <div className="w-full xl:w-10/12">
                    <div className="mb-12 flex flex-col items-center justify-center gap-8
                        text-center md:flex-row md:text-left">
                        <img
                            src={ VCBrand }
                            alt="VoiceChannels"
                            className="vc-logo w-[clamp(140px,14vw,220px)] shrink-0 select-none"
                        />
                        <div>
                            <h1 className="mb-4 text-[2.5rem] font-bold leading-tight md:text-[3.5rem]">Welcome to VoiceChannels</h1>
                            <p className="max-w-[800px] text-xl font-light text-vc-ice-dim">
                                We're thrilled to have you here! VoiceChannels is designed to revolutionize your Discord server experience
                                with the most advanced temporary voice channel management tools. Let's get you started on your journey.
                            </p>
                        </div>
                    </div>

                    <Terms />
                    <hr />

                    <TemporaryVoiceChannelsFeatures />
                    <hr />

                    <AutoScalingFeatures />
                    <hr />

                    <DashboardFeatures />
                    <hr />

                    <SetupFeatures />
                    <hr />

                    <BotSetup />
                    <hr />

                    <ButtonsInterface />
                    <hr />

                    <Suggestions />
                    <hr />

                    <NegativeReviews />
                </div>
            </div>
        </div>
    );
}

