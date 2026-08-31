import { DiscordChannelWizard, DiscordChannelDisplay, DiscordUIComponentMessage, DiscordSelectMenuDropdown, DiscordModal, DiscordInput } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc.png";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.png";

import { AUTO_SCALING_CONFIG, autoScalingWizardSteps, reindexWizardSteps } from "../../shared/auto-scaling-data";

import "../../components/discord/discord-chat-container.css";

export default function AutoScalingPage() {
    return (
        <div className="vc-container py-12">
            <div className="flex justify-center">
                <div className="w-full xl:w-10/12">
                    <h1 className="text-center mb-6">Auto-Scaling Channels</h1>

                    { /* Overview */ }
                    <section className="mb-12">
                        <p className="text-h5 text-vc-ice-dim text-center">
                            Automated voice channel management that dynamically creates and manages
                            channels based on user demand. Never run out of voice channel capacity again.
                        </p>
                    </section>

                    { /* Channel Types */ }
                    <section className="mb-12">
                        <h3 className="mb-4">Channel Types</h3>
                        <div className="grid grid-cols-12 gap-4 mb-6">
                            <div className="col-span-12 md:col-span-6">
                                <div className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                                    <h5 className="text-vc-azure-soft">Master Channel</h5>
                                    <p className="text-vc-ice-dim mb-0 text-sm">
                                        Entry point for routing. Users join here and are instantly moved to an available scaled channel.
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-6">
                                <div className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                                    <h5 className="text-vc-mint">Scaled Channels</h5>
                                    <p className="text-vc-ice-dim mb-0 text-sm">
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

                    { /* How It Works */ }
                    <section className="mb-12">
                        <h3 className="mb-4">How It Works</h3>
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

                    { /* Setup */ }
                    <section className="mb-12">
                        <h3 className="mb-4">Setup</h3>
                        <p className="text-vc-ice-dim mb-6">
                            Create auto-scaling channels using the <code>/setup</code> command.
                        </p>

                        <h5 className="text-vc-cyan mb-4">Step 1: Run /setup and select Auto-Scaling</h5>
                        <div className="discord-chat-container m-0 mb-6">
                            <DiscordUIComponentMessage
                                author="VoiceChannels"
                                avatar={ VertixAvatar }
                                timestamp="Today at 9:13 AM"
                                componentName="VertixBot/UI-General/SetupComponent"
                                ephemeral={ true }
                                interactionUser="iNewLegend"
                                interactionUserAvatar={ UserAvatar }
                                interactionCommand="/setup"
                                elementOverrides={ {
                                    "VertixBot/UI-General/SetupMasterCreateSelectMenu": { highlighted: true }
                                } }
                            />
                        </div>

                        <p className="text-vc-ice-dim mb-4">Select <strong>Auto-Scaling Channel</strong> from the menu:</p>
                        <div style={ { maxWidth: "450px" } } className="mb-6">
                            <DiscordSelectMenuDropdown
                                options={ [
                                    {
                                        iconEmoji: "➕",
                                        label: "Dynamic Channel (V2)",
                                        description: "Classic dynamic voice channels",
                                    },
                                    {
                                        iconEmoji: "✨",
                                        label: "Dynamic Channel (V3)",
                                        description: "Enhanced dynamic channels with more features",
                                    },
                                    {
                                        iconEmoji: "📈",
                                        label: "Auto-Scaling Channel",
                                        description: "Automatically scales based on member count",
                                        highlighted: true,
                                    },
                                ] }
                            />
                        </div>

                        <h5 className="text-vc-cyan mb-4">Step 2: Configure scaling options</h5>
                        <p className="text-vc-ice-dim mb-4">Set the channel name prefix and max members per channel:</p>
                        <DiscordModal title="📈 Configure Scaling Channel" showNotice={ false } cancelLabel="Cancel">
                            <DiscordInput
                                label="CHANNEL NAME PREFIX"
                                value={ AUTO_SCALING_CONFIG.prefix }
                            />
                            <DiscordInput
                                label="MAX MEMBERS PER CHANNEL"
                                value={ String( AUTO_SCALING_CONFIG.maxMembers ) }
                            />
                        </DiscordModal>
                    </section>

                    <hr />

                    { /* Scaling Trigger */ }
                    <section className="mb-12">
                        <h3 className="mb-4">Scaling Trigger</h3>
                        <p className="text-vc-ice-dim">
                            New channels are created when <strong>either</strong> condition is met:
                        </p>
                        <div className="rounded-xl border border-vc-hairline-bright bg-vc-space/70 p-4">
                            <code>availableChannelsCount &lt;= minAvailableChannels</code>
                            <span className="mx-2">OR</span>
                            <code>totalAvailableSlots &lt;= 1</code>
                        </div>
                    </section>

                    <hr />

                    { /* Configuration */ }
                    <section className="mb-12">
                        <h3 className="mb-4">Configuration</h3>
                        <div className="overflow-x-auto">
                            <table className="vc-table">
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
                                        <td>Channel name template with <code>{ "{index}" }</code> placeholder</td>
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

                    { /* Maintenance */ }
                    <section className="mb-12">
                        <h3 className="mb-4">Maintenance</h3>
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 lg:col-span-6">
                                <h5>Auto Reindex</h5>
                                <p className="text-vc-ice-dim text-sm">
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
                            <div className="col-span-12 lg:col-span-6">
                                <h5>Auto Cleanup</h5>
                                <p className="text-vc-ice-dim text-sm">
                                    When users leave, excess empty channels are removed. At least one empty channel is always kept as a buffer.
                                </p>
                                <ul className="text-vc-ice-dim text-sm">
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
