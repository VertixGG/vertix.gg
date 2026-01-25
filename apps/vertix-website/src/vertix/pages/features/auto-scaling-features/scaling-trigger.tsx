export default function ScalingTrigger() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">&#9889;</span>
                <h3 className="mb-0">Scaling Trigger</h3>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>
                                New channels are automatically created when <strong>either</strong> of these conditions is met:
                            </p>
                            <div className="alert alert-secondary">
                                <code>availableChannelsCount &lt;= minAvailableChannels</code>
                                <br />
                                <strong>OR</strong>
                                <br />
                                <code>totalAvailableSlots &lt;= 1</code>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Example Scenario</h5>
                        <div className="fs-5 text-secondary">
                            <pre className="bg-dark p-3 rounded text-light">
{`Configuration:
  - Prefix: "gaming-{index}"
  - Max Members: 15 per channel
  - Min Available: 1

Initial State:
  Master Channel (entry point)
  gaming-1 (0/15 members)

After users join:
  Master Channel
  gaming-1 (15/15 members) <- FULL
  gaming-2 (0/15 members)  <- auto-created

More users join:
  Master Channel
  gaming-1 (15/15 members)
  gaming-2 (8/15 members)
  gaming-3 (0/15 members)  <- buffer channel`}
                            </pre>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Configuration Modes</h5>
                        <div className="table-responsive">
                            <table className="table table-dark table-bordered">
                                <thead>
                                    <tr>
                                        <th>Mode</th>
                                        <th>Condition</th>
                                        <th>Behavior</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Limited</strong></td>
                                        <td><code>maxMembers &gt; 0</code></td>
                                        <td>Each channel is limited to the specified member count</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Unlimited</strong></td>
                                        <td><code>maxMembers = 0</code></td>
                                        <td>All channels accept unlimited members</td>
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
