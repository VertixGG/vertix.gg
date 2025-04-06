export default function HowToSetupLogsChannel() {
    return (
        <div className="container box-1">
            <h5>Enabling Dynamic Channel - Logs</h5>
            <br />
            <p className="fs-5">Since <b>Version</b> <code>0.0.5</code> we added <b>Logs Channel</b> is available for each <b>Master Channel</b>.</p>
            <p className="fs-5">The logs disabled by <code>default</code> and can be enabled using <code>/setup</code> command:</p>

            <ol className="fs-5">
                <li>
                    Enter your discord server and type <code>/setup</code> in any channel.
                    <br />
                    <img className="normalize" src="https://i.ibb.co/LYkTJyh/e1.png" alt="e1" />
                </li>
                <br />
                <li>
                    Please select the Master Channel from which you would like to receive logs for the associated dynamic channels.
                    <br />
                    <img className="normalize" src="https://i.ibb.co/cDJzXX7/1.png" alt="e2" />
                </li>
                <br />
                <li>
                    Click on <svg aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.59 8.59003L12 13.17L7.41 8.59003L6 10L12 16L18 10L16.59 8.59003Z"></path></svg> down arrow.
                    <br />
                    <img className="normalize" src="https://i.ibb.co/Th6t7LS/2.png" alt="e3" />
                </li>
                <br />
                <li>
                    Please choose the channel where you would like to display the logs.
                    <br />
                    <img className="normalize" src="https://i.ibb.co/CKvmq3P/3.png" alt="e4" />
                </li>
                <br />
                <li>
                    Verify that <b>"</b><small>▹ ✎ ∙ Send logs to custom channel</small><b>"</b> is <code>🟢 On</code>.
                    <br />
                    <img className="normalize" src="https://i.ibb.co/Qr2wDpz/4.png" alt="e5" />
                    <br />
                    <ul>
                        <h5>Note:</h5>
                        <li>You can always turn it off "<small>⌘ ∙ Configuration</small>" menu.</li>
                        <li>For better security alignment, it is recommended to ensure that the role and permissions of the logs channel match your security requirements.</li>
                        <li>To ensure optimal organization and clarity, it is advisable to utilize a separate log channel for each master channel.</li>
                    </ul>
                </li>
                <br />
                <li>
                    At this point, the logs channel is ready to receive logs from the associated dynamic channels.
                    <br />
                    <img className="normalize" src="https://i.ibb.co/pzwpdMF/5.png" alt="e6" />
                </li>
            </ol>

            <br />
            <p>Updated at: 24/06/2023</p>
        </div>
    )
}
