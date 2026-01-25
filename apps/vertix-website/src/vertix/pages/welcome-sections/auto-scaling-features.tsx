import { DiscordChannelWizard } from "@vertix.gg/discord-ui";

import { autoScalingWizardSteps, AUTO_SCALING_CONFIG } from "../../shared/auto-scaling-data";

export default function AutoScalingFeatures() {
    return (
        <div className="mb-5">
            <h4 id="auto-scaling-features" className="mb-4">Auto-Scaling Channels</h4>
            <p className="fs-5 text-secondary mb-4">
                Never worry about running out of voice channel capacity again. Vertix automatically
                creates and manages voice channels based on demand.
            </p>

            {/* How It Works */}
            <div className="mb-4">
                <h5 className="text-info mb-3">How It Works</h5>
                <DiscordChannelWizard
                    steps={ autoScalingWizardSteps }
                    autoPlay={ true }
                    autoPlayInterval={ 4000 }
                    showStepIndicators={ true }
                    showNavigation={ true }
                    pauseOnHover={ true }
                />
            </div>

            {/* Setup Instructions */}
            <div className="row g-4 mt-2">
                <div className="col-md-6">
                    <div className="p-3 bg-dark rounded border border-secondary h-100">
                        <h5 className="text-primary mb-3">Create</h5>
                        <ol className="text-secondary small mb-0">
                            <li>Run <code>/setup</code> in any text channel</li>
                            <li>Click <code>📈 Create Scaling Channel</code></li>
                            <li>Configure prefix and max members</li>
                            <li>Done! Master channel is ready</li>
                        </ol>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="p-3 bg-dark rounded border border-secondary h-100">
                        <h5 className="text-success mb-3">Configure</h5>
                        <ul className="text-secondary small mb-0 list-unstyled">
                            <li className="mb-2"><strong>Prefix:</strong> <code>{ AUTO_SCALING_CONFIG.prefix }</code></li>
                            <li className="mb-2"><strong>Max Members:</strong> <code>{ AUTO_SCALING_CONFIG.maxMembers }</code> per channel</li>
                            <li><strong>Min Available:</strong> <code>{ AUTO_SCALING_CONFIG.minAvailable }</code> buffer channel</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-center">
                <a href="/features/auto-scaling" className="btn btn-outline-primary">
                    Learn More
                </a>
            </div>
        </div>
    );
}
