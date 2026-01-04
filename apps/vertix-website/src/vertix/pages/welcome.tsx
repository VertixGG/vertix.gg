import RobotBrand from "@vertix.gg/assets/brand/Robot.png";

import Terms from "./documentation-sections/terms";
import TemporaryVoiceChannelsFeatures from "./documentation-sections/temporary-voice-channels-features";
import SetupFeatures from "./documentation-sections/setup-features";
import BotSetup from "./documentation-sections/bot-setup";
import ButtonsInterface from "./documentation-sections/buttons-interface";
import Suggestions from "./documentation-sections/suggestions";
import NegativeReviews from "./documentation-sections/negative-reviews";

import "../components/discord/discord-chat-container.css";

export default function Welcome() {
    return (
        <div className="p-5">
            <div className="row justify-content-center">
                <div className="col-12 col-xl-10">
                    <div className="documentation-page-header text-center mb-5">
                        <img
                            src={ RobotBrand }
                            alt="Vertix"
                            className="documentation-page-header__robot user-select-none mb-4"
                        />
                        <h1 className="display-4 fw-bold mb-3">Welcome to Vertix</h1>
                        <p className="lead text-secondary mx-auto" style={ { maxWidth: "800px" } }>
                            We're thrilled to have you here! Vertix is designed to revolutionize your Discord server experience
                            with the most advanced temporary voice channel management tools. Let's get you started on your journey.
                        </p>
                    </div>

                    <Terms />
                    <hr />

                    <TemporaryVoiceChannelsFeatures />
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

