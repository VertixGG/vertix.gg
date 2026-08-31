export default function SetupFeatures() {
    return (
        <div className="mb-12">
            <h4 id="setup-features" className="mb-6">Flexible Setup at Every Level</h4>
            <div className="text-h5 text-vc-ice-dim">
                <p className="mb-6">
                    VoiceChannels gives you control exactly where you need it, from server-wide rules to individual channel preferences.
                </p>
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-6">
                        <div className="h-full p-6 rounded-2xl bg-vc-space border border-vc-hairline-bright shadow-sm">
                            <h5 className="mb-4 text-vc-cyan"><strong>Server Level</strong></h5>
                            <ul className="list-none pl-0">
                                <li className="mb-2">🌐 <strong>Language Select</strong> - Speak your language.</li>
                                <li className="mb-2">🚫 <strong>Bad-Words Filter</strong> - Keep your channel names clean.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <div className="h-full p-6 rounded-2xl bg-vc-space border border-vc-hairline-bright shadow-sm">
                            <h5 className="mb-4 text-vc-magenta"><strong>Master Channel Level</strong></h5>
                            <ul className="list-none pl-0">
                                <li className="mb-2">🏷️ <strong>Naming Templates</strong> - Automate how channels look.</li>
                                <li className="mb-2">🎚️ <strong>Interface Control</strong> - Customize button visibility.</li>
                                <li className="mb-2">🛡️ <strong>Verified Roles</strong> - Define who can manage their space.</li>
                                <li className="mb-2">📝 <strong>Detailed Logs</strong> - Keep track of server activity.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

