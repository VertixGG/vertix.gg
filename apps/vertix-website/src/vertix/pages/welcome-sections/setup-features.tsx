export default function SetupFeatures() {
    return (
        <div className="mb-12">
            <h2 id="setup-features" className="text-h4 mb-6">Flexible Setup at Every Level</h2>
            <div className="text-h5 text-vc-ice-dim">
                <p className="mb-6">
                    VoiceChannels gives you control exactly where you need it, from server-wide rules to individual channel preferences.
                </p>
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-6">
                        <div className="h-full p-6 rounded-2xl bg-vc-space border border-vc-hairline-bright shadow-sm">
                            <h3 className="text-h5 mb-4 text-vc-cyan"><strong>Server Level</strong></h3>
                            <ul className="list-none pl-0">
                                <li className="mb-2">🌐 <strong>Language Select</strong> - Speak your language.</li>
                                <li className="mb-2">🚫 <strong>Bad-Words Filter</strong> - Keep your channel names clean.</li>
                                <li className="mb-2">🛡️ <strong>Verified Roles</strong> - Decide who the channels are for.</li>
                                <li className="mb-2">👮 <strong>Staff Roles</strong> - Who may act on a channel they don't own.</li>
                                <li className="mb-2">🎧 <strong>Voice Role</strong> - Handed out while a member sits in voice.</li>
                                <li className="mb-2">⏱️ <strong>Claim Timings</strong> - How long an abandoned channel waits, and how long the vote runs.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <div className="h-full p-6 rounded-2xl bg-vc-space border border-vc-hairline-bright shadow-sm">
                            <h3 className="text-h5 mb-4 text-vc-magenta"><strong>Master Channel Level</strong></h3>
                            <ul className="list-none pl-0">
                                <li className="mb-2">🏷️ <strong>Naming Templates</strong> - Automate how channels look.</li>
                                <li className="mb-2">🎚️ <strong>Interface Control</strong> - Pick the buttons, their order and where the rows break.</li>
                                <li className="mb-2">🆕 <strong>Channel Defaults</strong> - What a new channel starts as, and the limit it starts with.</li>
                                <li className="mb-2">📣 <strong>LFM Channel</strong> - Where a Looking For Members post goes.</li>
                                <li className="mb-2">🛡️ <strong>Roles Of Its Own</strong> - Verified, staff and voice roles, overriding the server's.</li>
                                <li className="mb-2">📝 <strong>Detailed Logs</strong> - Keep track of server activity.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

