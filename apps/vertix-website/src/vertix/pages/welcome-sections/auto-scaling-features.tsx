import { DiscordChannelWizard } from "@vertix.gg/discord-ui";

import { autoScalingWizardSteps } from "../../shared/auto-scaling-data";

export default function AutoScalingFeatures() {
    return (
        <div className="mb-5">
            <h4 id="auto-scaling-features" className="mb-4">Auto-Scaling Channels</h4>
            <p className="fs-5 text-secondary mb-4">
                Never worry about running out of voice channel capacity again. Vertix automatically
                creates and manages voice channels based on demand.
            </p>
            <DiscordChannelWizard
                steps={ autoScalingWizardSteps }
                autoPlay={ true }
                autoPlayInterval={ 4000 }
                showStepIndicators={ true }
                showNavigation={ true }
                pauseOnHover={ true }
            />
            <div className="mt-3 text-center">
                <a href="/features/auto-scaling" className="btn btn-outline-primary">
                    Learn More
                </a>
            </div>
        </div>
    );
}
