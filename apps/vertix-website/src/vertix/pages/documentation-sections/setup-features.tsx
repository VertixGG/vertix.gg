export default function SetupFeatures() {
    return (
        <div className="mb-5">
            <h4 id="setup-features" className="mb-4">Flexible Setup at Every Level</h4>
            <div className="fs-5 text-secondary">
                <p className="mb-4">
                    Vertix gives you control exactly where you need it, from server-wide rules to individual channel preferences.
                </p>
                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="h-100 p-4 rounded-4 bg-dark border border-secondary shadow-sm">
                            <h5 className="mb-3 text-info"><strong>Server Level</strong></h5>
                            <ul className="list-unstyled">
                                <li className="mb-2">🌐 <strong>Language Select</strong> - Speak your language.</li>
                                <li className="mb-2">🚫 <strong>Bad-Words Filter</strong> - Keep your channel names clean.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="h-100 p-4 rounded-4 bg-dark border border-secondary shadow-sm">
                            <h5 className="mb-3 text-warning"><strong>Master Channel Level</strong></h5>
                            <ul className="list-unstyled">
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

