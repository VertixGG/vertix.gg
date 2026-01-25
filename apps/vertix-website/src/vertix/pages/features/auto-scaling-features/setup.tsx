export default function Setup() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">&#128736;&#65039;</span>
                <h3 className="mb-0">Setup</h3>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>
                                Setting up auto-scaling channels is simple and can be done through the <code>/setup</code> command.
                            </p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Setup Steps</h5>
                        <div className="fs-5 text-secondary">
                            <ol className="text-start">
                                <li>
                                    <strong>Run the setup command</strong>
                                    <p>Use <code>/setup</code> in any text channel where Vertix has permissions.</p>
                                </li>
                                <li>
                                    <strong>Create a new Auto-Scaling Master Channel</strong>
                                    <p>Click on the "Create Scaling Channel" button to create a new master channel.</p>
                                </li>
                                <li>
                                    <strong>Configure the settings</strong>
                                    <p>Set your preferred channel name prefix and maximum members per channel.</p>
                                </li>
                                <li>
                                    <strong>Done!</strong>
                                    <p>Users can now join the master channel and will be automatically routed to available scaled channels.</p>
                                </li>
                            </ol>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Managing Existing Channels</h5>
                        <div className="fs-5 text-secondary">
                            <ul className="text-start">
                                <li>Use <code>/setup</code> to view and edit existing auto-scaling configurations</li>
                                <li>Click on an existing scaling channel to modify its settings</li>
                                <li>You can delete a scaling master channel and all its scaled channels from the setup menu</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
