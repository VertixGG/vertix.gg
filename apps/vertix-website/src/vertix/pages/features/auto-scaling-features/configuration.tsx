import { DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";

import { AUTO_SCALING_CONFIG_MODAL_VARIABLES } from "@vertix.gg/website/src/vertix/pages/features/auto-scaling-features/auto-scaling-constants";

export default function Configuration() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">&#9881;&#65039;</span>
                <h3 className="mb-0">Configuration</h3>
            </div>
            <div className="row g-5">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="d-flex justify-content-start">
                            <DiscordModal
                                title="Configure Scaling Channel #1"
                                cancelLabel="Cancel"
                                showNotice={ true }
                            >
                                <DiscordInput
                                    label="CHANNEL NAME PREFIX"
                                    value={ AUTO_SCALING_CONFIG_MODAL_VARIABLES.scalingPrefix }
                                    style="short"
                                />
                                <DiscordInput
                                    label="MAX MEMBERS PER CHANNEL"
                                    value={ AUTO_SCALING_CONFIG_MODAL_VARIABLES.scalingMaxMembers }
                                    style="short"
                                />
                            </DiscordModal>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <h5>Configuration Options</h5>
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
                                            <td><code>Channel Name Prefix</code></td>
                                            <td>Template for channel names. Supports placeholders like <code>{"{index}"}</code></td>
                                            <td><code>### Room - {"{index}"} ###</code></td>
                                        </tr>
                                        <tr>
                                            <td><code>Max Members Per Channel</code></td>
                                            <td>Maximum number of users per scaled channel. Set to 0 for unlimited.</td>
                                            <td><code>10</code></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <h5>Supported Placeholders</h5>
                            <ul className="text-start">
                                <li><code>{"{index}"}</code> - Channel index number (1, 2, 3...)</li>
                                <li><code>{"{{index}}"}</code> - Alternative syntax</li>
                                <li><code>{"{auto-scale}"}</code> - Human-readable alias</li>
                                <li><code>{"{autoscale}"}</code> - Compact alias</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
