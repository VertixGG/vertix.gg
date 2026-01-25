import { DiscordChannelWizard, DiscordChannelDisplay } from "@vertix.gg/discord-ui";

import { AUTO_SCALING_CONFIG, autoScalingWizardSteps, reindexWizardSteps } from "../../shared/auto-scaling-data";

export default function AutoScalingPage() {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-xl-10">
                    <h1 className="text-center mb-4">Auto-Scaling Channels</h1>

                    {/* Overview */}
                    <section className="mb-5">
                        <p className="fs-5 text-secondary text-center">
                            Automated voice channel management that dynamically creates and manages
                            channels based on user demand. Never run out of voice channel capacity again.
                        </p>
                    </section>

                    {/* Channel Types */}
                    <section className="mb-5">
                        <h3 className="mb-3">Channel Types</h3>
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="p-3 bg-dark rounded border border-secondary h-100">
                                    <h5 className="text-primary">Master Channel</h5>
                                    <p className="text-secondary mb-0 small">
                                        Entry point for routing. Users join here and are instantly moved to an available scaled channel.
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-3 bg-dark rounded border border-secondary h-100">
                                    <h5 className="text-success">Scaled Channels</h5>
                                    <p className="text-secondary mb-0 small">
                                        Voice channels where users communicate. Created automatically based on demand.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DiscordChannelDisplay
                            masterChannel={ { name: AUTO_SCALING_CONFIG.masterChannelName, active: false, userCount: 0 } }
                            scaledChannels={ [
                                {
                                    id: "1", name: "Room-1", active: true, userCount: 2, maxUsers: 2,
                                    users: [
                                        { id: "1", username: "Alex", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" },
                                        { id: "2", username: "Jordan", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" }
                                    ]
                                },
                                {
                                    id: "2", name: "Room-2", active: true, userCount: 1, maxUsers: 2,
                                    users: [
                                        { id: "3", username: "Sam", avatar: "https://cdn.discordapp.com/embed/avatars/2.png" }
                                    ]
                                },
                                { id: "3", name: "Room-3", active: false, userCount: 0, maxUsers: 2 }
                            ] }
                            showMasterChannel={ true }
                        />
                    </section>

                    <hr />

                    {/* How It Works */}
                    <section className="mb-5">
                        <h3 className="mb-3">How It Works</h3>
                        <DiscordChannelWizard
                            steps={ autoScalingWizardSteps }
                            autoPlay={ true }
                            autoPlayInterval={ 4000 }
                            showStepIndicators={ true }
                            showNavigation={ true }
                            pauseOnHover={ true }
                        />
                    </section>

                    <hr />

                    {/* Scaling Trigger */}
                    <section className="mb-5">
                        <h3 className="mb-3">Scaling Trigger</h3>
                        <p className="text-secondary">
                            New channels are created when <strong>either</strong> condition is met:
                        </p>
                        <div className="alert alert-secondary">
                            <code>availableChannelsCount &lt;= minAvailableChannels</code>
                            <span className="mx-2">OR</span>
                            <code>totalAvailableSlots &lt;= 1</code>
                        </div>
                    </section>

                    <hr />

                    {/* Configuration */}
                    <section className="mb-5">
                        <h3 className="mb-3">Configuration</h3>
                        <div className="table-responsive">
                            <table className="table table-dark table-bordered">
                                <thead>
                                    <tr>
                                        <th>Option</th>
                                        <th>Description</th>
                                        <th>Default</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>categoryName</code></td>
                                        <td>Discord category for scaled channels</td>
                                        <td><code>{ AUTO_SCALING_CONFIG.categoryName }</code></td>
                                    </tr>
                                    <tr>
                                        <td><code>masterChannelName</code></td>
                                        <td>Entry point channel name</td>
                                        <td><code>{ AUTO_SCALING_CONFIG.masterChannelName }</code></td>
                                    </tr>
                                    <tr>
                                        <td><code>prefix</code></td>
                                        <td>Channel name template with <code>{"{index}"}</code> placeholder</td>
                                        <td><code>{ AUTO_SCALING_CONFIG.prefix }</code></td>
                                    </tr>
                                    <tr>
                                        <td><code>maxMembers</code></td>
                                        <td>Max users per channel (0 = unlimited)</td>
                                        <td><code>{ AUTO_SCALING_CONFIG.maxMembers }</code></td>
                                    </tr>
                                    <tr>
                                        <td><code>minAvailable</code></td>
                                        <td>Minimum empty channels to maintain</td>
                                        <td><code>{ AUTO_SCALING_CONFIG.minAvailable }</code></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <hr />

                    {/* Maintenance */}
                    <section className="mb-5">
                        <h3 className="mb-3">Maintenance</h3>
                        <div className="row g-4">
                            <div className="col-lg-6">
                                <h5>Auto Reindex</h5>
                                <p className="text-secondary small">
                                    Every 5 minutes, channels are renumbered to maintain consistent naming.
                                </p>
                                <DiscordChannelWizard
                                    steps={ reindexWizardSteps }
                                    autoPlay={ true }
                                    autoPlayInterval={ 3000 }
                                    showStepIndicators={ true }
                                    showNavigation={ true }
                                    pauseOnHover={ true }
                                />
                            </div>
                            <div className="col-lg-6">
                                <h5>Auto Cleanup</h5>
                                <p className="text-secondary small">
                                    When users leave, excess empty channels are removed. At least one empty channel is always kept as a buffer.
                                </p>
                                <ul className="text-secondary small">
                                    <li>Triggered on user leave</li>
                                    <li>Keeps 1 empty channel minimum</li>
                                    <li>Removes excess empty channels</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
