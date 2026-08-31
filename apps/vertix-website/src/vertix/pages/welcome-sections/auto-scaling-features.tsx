import { DiscordChannelWizard } from "@vertix.gg/discord-ui";

import { autoScalingWizardSteps, AUTO_SCALING_CONFIG } from "../../shared/auto-scaling-data";

export default function AutoScalingFeatures() {
    return (
        <div className="mb-12">
            <h4 id="auto-scaling-features" className="mb-6">Auto-Scaling Channels</h4>
            <p className="text-h5 text-vc-ice-dim mb-6">
                Never worry about running out of voice channel capacity again. VoiceChannels automatically
                creates and manages voice channels based on demand.
            </p>

            { /* How It Works */ }
            <div className="mb-6">
                <h5 className="text-vc-cyan mb-4">How It Works</h5>
                <DiscordChannelWizard
                    steps={ autoScalingWizardSteps }
                    autoPlay={ true }
                    autoPlayInterval={ 4000 }
                    showStepIndicators={ true }
                    showNavigation={ true }
                    pauseOnHover={ true }
                />
            </div>

            { /* Setup Instructions */ }
            <div className="grid grid-cols-12 gap-6 mt-2">
                <div className="col-span-12 md:col-span-6">
                    <div className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                        <h5 className="text-vc-azure-soft mb-4">Create</h5>
                        <ol className="text-vc-ice-dim text-sm mb-0">
                            <li>Run <code>/setup</code> in any text channel</li>
                            <li>Click <code>📈 Create Scaling Channel</code></li>
                            <li>Configure prefix and max members</li>
                            <li>Done! Master channel is ready</li>
                        </ol>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-6">
                    <div className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                        <h5 className="text-vc-mint mb-4">Configure</h5>
                        <ul className="text-vc-ice-dim text-sm mb-0 list-none pl-0">
                            <li className="mb-2"><strong>Prefix:</strong> <code>{ AUTO_SCALING_CONFIG.prefix }</code></li>
                            <li className="mb-2"><strong>Max Members:</strong> <code>{ AUTO_SCALING_CONFIG.maxMembers }</code> per channel</li>
                            <li><strong>Min Available:</strong> <code>{ AUTO_SCALING_CONFIG.minAvailable }</code> buffer channel</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <a href="/features/auto-scaling" className="vc-btn vc-btn-azure">
                    Learn More
                </a>
            </div>
        </div>
    );
}
