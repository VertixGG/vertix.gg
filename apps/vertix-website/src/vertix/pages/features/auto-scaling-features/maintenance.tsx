import { DiscordChannelDisplay } from "@vertix.gg/discord-ui";

export default function Maintenance() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">&#128295;</span>
                <h3 className="mb-0">Maintenance</h3>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div className="mb-4">
                        <h5>Reindex Process</h5>
                        <div className="fs-5 text-secondary mb-3">
                            <p>
                                Every <strong>5 minutes</strong>, the system automatically reindexes channel names
                                to maintain consistent numbering.
                            </p>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-warning mb-2">Before Reindex</h6>
                            <p className="text-secondary small mb-2">After channel #2 was deleted, numbering is inconsistent</p>
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
                                        id: "3",
                                        name: "### Room - 3 ###",
                                        active: true,
                                        userCount: 2,
                                        maxUsers: 2,
                                        users: [
                                            {
                                                id: "2",
                                                username: "User2",
                                                avatar: "https://cdn.discordapp.com/embed/avatars/1.png"
                                            }
                                        ]
                                    },
                                    {
                                        id: "4",
                                        name: "### Room - 4 ###",
                                        active: false,
                                        userCount: 0,
                                        maxUsers: 2
                                    }
                                ] }
                                showMasterChannel={ true }
                            />
                        </div>
                        <div className="mb-3">
                            <h6 className="text-success mb-2">After Reindex</h6>
                            <p className="text-secondary small mb-2">Channel names are renumbered to maintain consistent sequence</p>
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
                                        active: true,
                                        userCount: 2,
                                        maxUsers: 2,
                                        users: [
                                            {
                                                id: "2",
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
                        <h5>Cleanup Process</h5>
                        <div className="fs-5 text-secondary mb-3">
                            <p>
                                When a user leaves a scaled channel, the system evaluates if there are
                                excess empty channels and cleans them up.
                            </p>
                            <ul className="text-start">
                                <li>Triggered when a user leaves a scaled channel</li>
                                <li>Identifies all empty channels for the master</li>
                                <li>Keeps at least <strong>1 empty channel</strong> available</li>
                                <li>Deletes excess empty channels</li>
                            </ul>
                        </div>
                        <div className="mb-3">
                            <h6 className="text-warning mb-2">Before Cleanup: Multiple empty channels</h6>
                            <p className="text-secondary small mb-2">System has excess empty channels that need cleanup</p>
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
                                    },
                                    {
                                        id: "3",
                                        name: "### Room - 3 ###",
                                        active: false,
                                        userCount: 0,
                                        maxUsers: 2
                                    },
                                    {
                                        id: "4",
                                        name: "### Room - 4 ###",
                                        active: false,
                                        userCount: 0,
                                        maxUsers: 2
                                    }
                                ] }
                                showMasterChannel={ true }
                            />
                        </div>
                        <div className="mb-3">
                            <h6 className="text-success mb-2">After Cleanup: Only 1 empty channel kept</h6>
                            <p className="text-secondary small mb-2">System automatically removes excess empty channels, keeping one buffer</p>
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
                    </div>
                    <div className="mb-4">
                        <h5>System Statistics</h5>
                        <div className="table-responsive">
                            <table className="table table-dark table-bordered">
                                <thead>
                                    <tr>
                                        <th>Metric</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Reindex Interval</td>
                                        <td>5 minutes (300,000ms)</td>
                                    </tr>
                                    <tr>
                                        <td>Default Max Members</td>
                                        <td>2 per channel</td>
                                    </tr>
                                    <tr>
                                        <td>Default Min Available</td>
                                        <td>1 empty channel</td>
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
