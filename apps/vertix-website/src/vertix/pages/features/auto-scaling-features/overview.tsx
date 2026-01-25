import { DiscordChannelDisplay } from "@vertix.gg/discord-ui";

export default function Overview() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">📈</span>
                <h3 className="mb-0">Overview</h3>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>
                                The <strong>Auto-Scaling System</strong> is an automated voice channel management system
                                that dynamically creates and manages multiple voice channels based on user demand.
                            </p>
                            <ul className="text-start d-inline-block">
                                <li><strong>Automatic channel creation</strong> when existing ones reach capacity</li>
                                <li><strong>User routing</strong> to available channels when joining the master channel</li>
                                <li><strong>Automatic cleanup</strong> of empty channels to maintain optimal resources</li>
                                <li><strong>Consistent naming</strong> across scaled channels using templates</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Channel Types</h5>
                        <div className="table-responsive mb-3">
                            <table className="table table-dark table-bordered">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>Master Channel</code></td>
                                        <td>Entry point channel that users join. Used for routing only - users are automatically moved.</td>
                                    </tr>
                                    <tr>
                                        <td><code>Scaled Channel</code></td>
                                        <td>Individual voice channels where users actually communicate. Linked to the master channel.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
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
                                    status: {
                                        text: "Gaming session",
                                        editable: true
                                    },
                                    users: [
                                        {
                                            id: "1",
                                            username: "Player1",
                                            avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
                                        },
                                        {
                                            id: "2",
                                            username: "Player2",
                                            avatar: "https://cdn.discordapp.com/embed/avatars/1.png"
                                        }
                                    ],
                                    showInvite: true
                                },
                                {
                                    id: "2",
                                    name: "### Room - 2 ###",
                                    active: true,
                                    userCount: 1,
                                    maxUsers: 2,
                                    users: [
                                        {
                                            id: "4",
                                            username: "Player4",
                                            avatar: "https://cdn.discordapp.com/embed/avatars/3.png"
                                        }
                                    ],
                                    showInvite: true
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
                            channelListProps={ {
                                collapsible: true,
                                showAddButton: true
                            } }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
