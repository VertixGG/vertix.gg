export default function DashboardFeatures() {
    return (
        <div className="mb-5">
            <h4 id="dashboard-features" className="mb-4">Dashboard</h4>
            <p className="fs-5 text-secondary mb-4">
                Manage your Vertix setup from a web-based dashboard. No commands needed — configure
                everything visually from your browser.
            </p>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="p-3 bg-dark rounded border border-secondary h-100">
                        <h5 className="text-primary mb-3">🎨 Visual Editor</h5>
                        <ul className="text-secondary small mb-0 list-unstyled">
                            <li className="mb-2">Flow-based editor for customizing bot UI components</li>
                            <li className="mb-2">Customize embeds, elements, and modals per guild</li>
                            <li className="mb-2">Per-language translations with live preview</li>
                            <li>Save and apply changes in real-time</li>
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="p-3 bg-dark rounded border border-secondary h-100">
                        <h5 className="text-success mb-3">⚙️ Bot Management</h5>
                        <ul className="text-secondary small mb-0 list-unstyled">
                            <li className="mb-2">Create and configure auto-scaling channel setups</li>
                            <li className="mb-2">Create and configure dynamic channel setups</li>
                            <li className="mb-2">Edit master channel settings from the browser</li>
                            <li>Delete setups with safe confirmation</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-center">
                <a href="https://dashboard.vertix.gg" className="btn btn-outline-primary" target="_blank" rel="noopener noreferrer">
                    Open Dashboard
                </a>
            </div>
        </div>
    );
}
