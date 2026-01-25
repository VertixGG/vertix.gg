import { DiscordChannelDisplay } from "@vertix.gg/discord-ui";

export default function ScalingTrigger() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">&#9889;</span>
                <h3 className="mb-0">Scaling Trigger</h3>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>
                                New channels are automatically created when <strong>either</strong> of these conditions is met:
                            </p>
                            <div className="alert alert-secondary">
                                <code>availableChannelsCount &lt;= minAvailableChannels</code>
                                <br />
                                <strong>OR</strong>
                                <br />
                                <code>totalAvailableSlots &lt;= 1</code>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Example Scenario</h5>
                        <div className="fs-5 text-secondary mb-3">
                            <p>
                                <strong>Configuration:</strong> Prefix: <code>{ "gaming-{index}" }</code>, Max Members: 2 per channel, Min Available: 1
                            </p>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-primary mb-2">Initial State</h6>
                            <p className="text-secondary small mb-2">Starting with master channel and one empty scaled channel</p>
                            <DiscordChannelDisplay
                                masterChannel={ {
                                    name: "⤢⤡ Join free channels",
                                    active: false,
                                    userCount: 0
                                } }
                                scaledChannels={ [
                                    {
                                        id: "1",
                                        name: "gaming-1",
                                        active: false,
                                        userCount: 0,
                                        maxUsers: 2
                                    }
                                ] }
                                showMasterChannel={ true }
                            />
                        </div>
                        <div className="mb-3">
                            <h6 className="text-warning mb-2">After users join: Channel full, new one created</h6>
                            <p className="text-secondary small mb-2">When gaming-1 reaches capacity (2/2), gaming-2 is automatically created</p>
                            <DiscordChannelDisplay
                                masterChannel={ {
                                    name: "⤢⤡ Join free channels",
                                    active: false,
                                    userCount: 0
                                } }
                                scaledChannels={ [
                                    {
                                        id: "1",
                                        name: "gaming-1",
                                        active: true,
                                        userCount: 2,
                                        maxUsers: 2
                                    },
                                    {
                                        id: "2",
                                        name: "gaming-2",
                                        active: false,
                                        userCount: 0,
                                        maxUsers: 2
                                    }
                                ] }
                                showMasterChannel={ true }
                            />
                        </div>
                        <div className="mb-3">
                            <h6 className="text-success mb-2">More users join: Buffer channel created</h6>
                            <p className="text-secondary small mb-2">System maintains buffer channels to ensure availability</p>
                            <DiscordChannelDisplay
                                masterChannel={ {
                                    name: "⤢⤡ Join free channels",
                                    active: false,
                                    userCount: 0
                                } }
                                scaledChannels={ [
                                    {
                                        id: "1",
                                        name: "gaming-1",
                                        active: true,
                                        userCount: 2,
                                        maxUsers: 2
                                    },
                                    {
                                        id: "2",
                                        name: "gaming-2",
                                        active: true,
                                        userCount: 1,
                                        maxUsers: 2,
                                        users: [
                                            {
                                                id: "1",
                                                username: "Gamer1",
                                                avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
                                            }
                                        ]
                                    },
                                    {
                                        id: "3",
                                        name: "gaming-3",
                                        active: false,
                                        userCount: 0,
                                        maxUsers: 2
                                    }
                                ] }
                                showMasterChannel={ true }
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Configuration Modes</h5>
                        <div className="table-responsive">
                            <table className="table table-dark table-bordered">
                                <thead>
                                    <tr>
                                        <th>Mode</th>
                                        <th>Condition</th>
                                        <th>Behavior</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Limited</strong></td>
                                        <td><code>maxMembers &gt; 0</code></td>
                                        <td>Each channel is limited to the specified member count</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Unlimited</strong></td>
                                        <td><code>maxMembers = 0</code></td>
                                        <td>All channels accept unlimited members</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
