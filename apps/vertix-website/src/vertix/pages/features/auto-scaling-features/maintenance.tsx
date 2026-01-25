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
                        <div className="fs-5 text-secondary">
                            <p>
                                Every <strong>5 minutes</strong>, the system automatically reindexes channel names
                                to maintain consistent numbering.
                            </p>
                            <pre className="bg-dark p-3 rounded text-light">
{`Before reindex (after channel #2 was deleted):
  - Room - 1
  - Room - 3
  - Room - 4

After reindex:
  - Room - 1
  - Room - 2
  - Room - 3`}
                            </pre>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Cleanup Process</h5>
                        <div className="fs-5 text-secondary">
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
                                        <td>10 per channel</td>
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
