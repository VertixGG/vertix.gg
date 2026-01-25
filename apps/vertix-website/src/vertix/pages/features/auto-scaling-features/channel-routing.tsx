export default function ChannelRouting() {
    return (
        <div className="mb-5">
            <div className="d-flex align-items-center mb-3">
                <span className="fs-2 me-3">&#128268;</span>
                <h3 className="mb-0">Channel Routing</h3>
            </div>
            <div className="row g-5 align-items-center">
                <div className="col-12">
                    <div className="mb-4">
                        <div className="fs-5 text-secondary">
                            <p>
                                When a user joins the <strong>Master Channel</strong>, they are automatically
                                routed to an available scaled channel.
                            </p>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Join Master Channel Flow</h5>
                        <div className="fs-5 text-secondary">
                            <pre className="bg-dark p-3 rounded text-light">
{`User joins Master Channel
        |
        v
Find or create available scaled channel
        |
        v
Automatically move user to scaled channel
        |
        v
User never stays in master channel (routing only)`}
                            </pre>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Join Scaled Channel Flow</h5>
                        <div className="fs-5 text-secondary">
                            <pre className="bg-dark p-3 rounded text-light">
{`User joins a scaled channel
        |
        v
Evaluate available space:
  - Count channels with available slots
  - Calculate total available slots
        |
        v
Check trigger condition:
  availableChannelsCount <= minAvailableChannels
  OR totalAvailableSlots <= 1
        |
        v
If triggered:
  Create new scaled channel with next index`}
                            </pre>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5>Leave Scaled Channel Flow</h5>
                        <div className="fs-5 text-secondary">
                            <pre className="bg-dark p-3 rounded text-light">
{`User leaves scaled channel
        |
        v
Find all scaled channels for that master
        |
        v
Call cleanup process
        |
        v
If > 1 empty channels:
  Delete all but 1 empty channel`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
