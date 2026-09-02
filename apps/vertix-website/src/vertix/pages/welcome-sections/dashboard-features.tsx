export default function DashboardFeatures() {
    return (
        <div className="mb-12">
            <h4 id="dashboard-features" className="mb-6">Dashboard</h4>
            <p className="text-h5 text-vc-ice-dim mb-6">
                Manage your VoiceChannels setup from a web-based dashboard. No commands needed — configure
                everything visually from your browser.
            </p>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-6">
                    <div className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                        <h5 className="text-vc-azure-soft mb-4">🎨 Visual Editor</h5>
                        <ul className="text-vc-ice-dim text-sm mb-0 list-none pl-0">
                            <li className="mb-2">Flow-based editor for customizing bot UI components</li>
                            <li className="mb-2">Customize embeds, elements, and modals per guild</li>
                            <li className="mb-2">Per-language translations with live preview</li>
                            <li>Save and apply changes in real-time</li>
                        </ul>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-6">
                    <div className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                        <h5 className="text-vc-mint mb-4">⚙️ Bot Management</h5>
                        <ul className="text-vc-ice-dim text-sm mb-0 list-none pl-0">
                            <li className="mb-2">Create and configure auto-scaling channel setups</li>
                            <li className="mb-2">Create and configure dynamic channel setups</li>
                            <li className="mb-2">Edit master channel settings from the browser</li>
                            <li>Delete setups with safe confirmation</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <a href="https://dashboard.voicechannels.xyz" className="vc-btn vc-btn-azure" target="_blank" rel="noopener noreferrer">
                    Open Dashboard
                </a>
            </div>
        </div>
    );
}
