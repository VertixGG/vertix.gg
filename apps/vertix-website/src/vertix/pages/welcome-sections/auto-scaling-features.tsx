import { DiscordChannelDisplay } from "@vertix.gg/discord-ui";

export default function AutoScalingFeatures() {
    return (
        <div className="mb-5">
            <h4 id="auto-scaling-features" className="mb-4">Auto-Scaling Channels</h4>
            <div className="fs-5 text-secondary">
                <p className="mb-4">
                    Never worry about running out of voice channel capacity again. Vertix's Auto-Scaling system
                    automatically creates and manages voice channels based on demand.
                </p>
                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="h-100 p-4 rounded-4 bg-dark border border-secondary shadow-sm">
                            <h5 className="mb-3 text-primary"><strong>How It Works</strong></h5>
                            <ul className="list-unstyled">
                                <li className="mb-2">📈 <strong>Dynamic Creation</strong> - New channels spawn when capacity is reached.</li>
                                <li className="mb-2">🔀 <strong>Smart Routing</strong> - Users are automatically moved to available channels.</li>
                                <li className="mb-2">🧹 <strong>Auto Cleanup</strong> - Empty channels are removed to keep things tidy.</li>
                                <li className="mb-2">🔢 <strong>Auto Reindex</strong> - Channel numbers stay consistent and organized.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="h-100 p-4 rounded-4 bg-dark border border-secondary shadow-sm">
                            <h5 className="mb-3 text-success"><strong>Configuration</strong></h5>
                            <ul className="list-unstyled">
                                <li className="mb-2">🏷️ <strong>Custom Prefix</strong> - Name your channels with templates like <code>Room-{ "{index}" }</code>.</li>
                                <li className="mb-2">👥 <strong>Max Members</strong> - Set capacity per channel (or unlimited).</li>
                                <li className="mb-2">📊 <strong>Min Available</strong> - Always keep buffer channels ready.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <h5 className="mb-3 text-info"><strong>Example Flow</strong></h5>
                    <div className="mb-3">
                        <h6 className="text-info mb-2">Step 1: User joins Master Channel</h6>
                        <p className="text-secondary small mb-2">User enters the master channel. This is a separate entry point channel used for routing only - users never stay here.</p>
                        <DiscordChannelDisplay
                            masterChannel={ {
                                name: "⤢⤡ Join free channels",
                                active: false,
                                userCount: 0
                            } }
                            showMasterChannel={ true }
                        />
                    </div>
                    <div className="mb-3">
                        <h6 className="text-info mb-2">Step 2: System finds available scaled channel</h6>
                        <p className="text-secondary small mb-2">Vertix automatically searches for an available room or creates one if needed.</p>
                        <DiscordChannelDisplay
                            masterChannel={ {
                                name: "⤢⤡ Join free channels",
                                active: false,
                                userCount: 0
                            } }
                            scaledChannels={ [
                                {
                                    id: "1",
                                    name: "### Room - 1 ###",
                                    active: false,
                                    userCount: 0,
                                    maxUsers: 2
                                }
                            ] }
                            showMasterChannel={ true }
                        />
                    </div>
                    <div className="mb-3">
                        <h6 className="text-success mb-2">Step 3: User automatically moved to "Room-1"</h6>
                        <p className="text-secondary small mb-2">User is seamlessly transferred to the first available channel</p>
                        <DiscordChannelDisplay
                            masterChannel={ {
                                name: "⤢⤡ Join free channels",
                                active: false,
                                userCount: 0
                            } }
                            scaledChannels={ [
                                {
                                    id: "1",
                                    name: "### Room - 1 ###",
                                    active: true,
                                    userCount: 1,
                                    maxUsers: 2,
                                    users: [
                                        {
                                            id: "1",
                                            username: "iNewLegend",
                                            avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
                                        }
                                    ]
                                }
                            ] }
                            showMasterChannel={ true }
                        />
                    </div>
                    <div className="mb-3">
                        <h6 className="text-warning mb-2">Step 4: When Room-1 is full → "Room-2" is created</h6>
                        <p className="text-secondary small mb-2">New channels are automatically created when capacity is reached</p>
                        <DiscordChannelDisplay
                            masterChannel={ {
                                name: "⤢⤡ Join free channels",
                                active: false,
                                userCount: 0
                            } }
                            scaledChannels={ [
                                {
                                    id: "1",
                                    name: "### Room - 1 ###",
                                    active: true,
                                    userCount: 2,
                                    maxUsers: 2
                                },
                                {
                                    id: "2",
                                    name: "### Room - 2 ###",
                                    active: false,
                                    userCount: 0,
                                    maxUsers: 2
                                }
                            ] }
                            showMasterChannel={ true }
                        />
                    </div>
                    <div className="mb-3">
                        <h6 className="text-success mb-2">Step 5: When users leave → excess empty channels are cleaned up</h6>
                        <p className="text-secondary small mb-2">Empty channels are automatically removed to keep your server organized</p>
                        <DiscordChannelDisplay
                            masterChannel={ {
                                name: "⤢⤡ Join free channels",
                                active: false,
                                userCount: 0
                            } }
                            scaledChannels={ [
                                {
                                    id: "1",
                                    name: "### Room - 1 ###",
                                    active: true,
                                    userCount: 2,
                                    maxUsers: 2,
                                    users: [
                                        {
                                            id: "1",
                                            username: "iNewLegend",
                                            avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
                                        }
                                    ]
                                },
                                {
                                    id: "2",
                                    name: "### Room - 2 ###",
                                    active: false,
                                    userCount: 0,
                                    maxUsers: 2
                                }
                            ] }
                            showMasterChannel={ true }
                        />
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <a href="/features/auto-scaling" className="btn btn-outline-primary btn-lg">
                        Learn More About Auto-Scaling
                    </a>
                </div>
            </div>
        </div>
    );
}
