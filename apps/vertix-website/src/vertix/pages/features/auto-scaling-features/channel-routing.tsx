import { DiscordChannelDisplay } from "@vertix.gg/discord-ui";

export default function ChannelRouting() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">&#128268;</span>
                <h3 className="mb-0">Channel Routing</h3>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>
                                When a user joins the <strong>Master Channel</strong>, they are automatically
                                routed to an available scaled channel.
                            </p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Join Master Channel Flow</h5>
                        <div className="fs-5 text-secondary mb-3">
                            <p>
                                When a user joins the master channel, Vertix automatically finds or creates
                                an available scaled channel and moves them there instantly.
                            </p>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-primary mb-2">Step 1: User joins Master Channel</h6>
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
                            <h6 className="text-primary mb-2">Step 2: System finds available channel</h6>
                            <p className="text-secondary small mb-2">Vertix searches for an available scaled channel or creates one if needed.</p>
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
                            <h6 className="text-success mb-2">Step 3: User automatically moved</h6>
                            <p className="text-secondary small mb-2">User is seamlessly transferred to the available channel</p>
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
                                                username: "User123",
                                                avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
                                            }
                                        ]
                                    }
                                ] }
                                showMasterChannel={ true }
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Join Scaled Channel Flow</h5>
                        <div className="fs-5 text-secondary mb-3">
                            <p>
                                When users join scaled channels directly, the system evaluates available space
                                and creates new channels when needed.
                            </p>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-primary mb-2">Initial State: Available channels</h6>
                            <p className="text-secondary small mb-2">System has channels with available slots</p>
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
                                                username: "User1",
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
                        <div className="mb-3">
                            <h6 className="text-warning mb-2">Trigger Condition Met: New channel created</h6>
                            <p className="text-secondary small mb-2">When available channels ≤ minAvailable OR total slots ≤ 1, a new channel is created</p>
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
                                        active: true,
                                        userCount: 1,
                                        maxUsers: 2,
                                        users: [
                                            {
                                                id: "1",
                                                username: "User2",
                                                avatar: "https://cdn.discordapp.com/embed/avatars/1.png"
                                            }
                                        ]
                                    },
                                    {
                                        id: "3",
                                        name: "### Room - 3 ###",
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
                        <h5>Leave Scaled Channel Flow</h5>
                        <div className="fs-5 text-secondary mb-3">
                            <p>
                                When users leave, the system automatically cleans up excess empty channels,
                                keeping at least one empty channel available.
                            </p>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-warning mb-2">Before Cleanup: Multiple empty channels</h6>
                            <p className="text-secondary small mb-2">System has multiple empty channels that need cleanup</p>
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
                                                username: "User1",
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
                                    },
                                    {
                                        id: "3",
                                        name: "### Room - 3 ###",
                                        active: false,
                                        userCount: 0,
                                        maxUsers: 2
                                    }
                                ] }
                                showMasterChannel={ true }
                            />
                        </div>
                        <div className="mb-3">
                            <h6 className="text-success mb-2">After Cleanup: Excess channels removed</h6>
                            <p className="text-secondary small mb-2">System keeps only 1 empty channel, removes the rest</p>
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
                                                username: "User1",
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
                </div>
            </div>
        </div>
    );
}
