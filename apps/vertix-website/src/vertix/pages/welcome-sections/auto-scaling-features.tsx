export default function AutoScalingFeatures() {
    return (
        <div className="mb-5">
            <h4 id="auto-scaling-features" className="mb-4">Auto-Scaling Channels</h4>
            <div className="fs-5 text-secondary">
                <p className="mb-4">
                    Never worry about running out of voice channel capacity again. Vertix's Auto-Scaling system
                    automatically creates and manages voice channels based on demand.
                </p>
                <div className="row g-4">
                    <div className="col-lg-6">
                        <div className="h-100 p-4 rounded-4 bg-dark border border-secondary shadow-sm">
                            <h5 className="mb-3 text-primary"><strong>How It Works</strong></h5>
                            <ul className="list-unstyled">
                                <li className="mb-2">📈 <strong>Dynamic Creation</strong> - New channels spawn when capacity is reached.</li>
                                <li className="mb-2">🔀 <strong>Smart Routing</strong> - Users are automatically moved to available channels.</li>
                                <li className="mb-2">🧹 <strong>Auto Cleanup</strong> - Empty channels are removed to keep things tidy.</li>
                                <li className="mb-2">🔢 <strong>Auto Reindex</strong> - Channel numbers stay consistent and organized.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="h-100 p-4 rounded-4 bg-dark border border-secondary shadow-sm">
                            <h5 className="mb-3 text-success"><strong>Configuration</strong></h5>
                            <ul className="list-unstyled">
                                <li className="mb-2">🏷️ <strong>Custom Prefix</strong> - Name your channels with templates like <code>Room-{"{index}"}</code>.</li>
                                <li className="mb-2">👥 <strong>Max Members</strong> - Set capacity per channel (or unlimited).</li>
                                <li className="mb-2">📊 <strong>Min Available</strong> - Always keep buffer channels ready.</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-4 p-4 rounded-4 bg-dark border border-info shadow-sm">
                    <h5 className="mb-3 text-info"><strong>Example Flow</strong></h5>
                    <pre className="bg-black p-3 rounded text-light mb-0" style={ { fontSize: "0.9rem" } }>
{`User joins Master Channel
      ↓
System finds available scaled channel
      ↓
User automatically moved to "Room-1"
      ↓
When Room-1 is full → "Room-2" is created
      ↓
When users leave → excess empty channels are cleaned up`}
                    </pre>
                </div>
                <div className="mt-4 text-center">
                    <a href="/features/auto-scaling" className="btn btn-outline-primary btn-lg">
                        Learn More About Auto-Scaling
                    </a>
                </div>
            </div>
        </div>
    );
}
