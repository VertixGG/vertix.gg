export default function V3DataModels() {
    return (
        <div className="mb-4">
            <h5 className="mb-3">The Power of UI V3</h5>

            <div className="fs-5 text-secondary">
                <p className="mb-3">
                    UI V3 ships the full dynamic-channel toolset in one pipeline with stable hashed component IDs and export-aware definitions, so the bot and website stay in sync.
                </p>

                <div className="mb-4">
                    <h6><strong>What's New?</strong></h6>
                    <ul className="text-start">
                        <li className="mb-2">
                            <strong>Complete Dynamic Control</strong><br/>
                            Rename, user limit, clear chat, reset, region, permissions, privacy, primary message edit, templates, transfer owner, plus the baseline Dynamic Channel flow all run in V3.
                        </li>
                        <li className="mb-2">
                            <strong>Claim Automation</strong><br/>
                            Claim start, vote, and result flows are wired through the claim manager with the primary message claim button, keeping channel takeover consistent.
                        </li>
                        <li className="mb-2">
                            <strong>Definition-Aware UI</strong><br/>
                            Setup edit and every V3 flow can load exported UI definitions, so rendered components match the bot’s runtime without manual rewrites.
                        </li>
                    </ul>
                </div>

                <h6><strong>Why Upgrade?</strong></h6>
                <ul className="text-start">
                    <li className="mb-2">
                        <strong>Reliability</strong> - V3 isolates module definitions and respects exports, preventing cross-version conflicts.
                    </li>
                    <li className="mb-2">
                        <strong>Control</strong> - Deeper dynamic-channel controls, permissions/privacy flows, and editable primary messages give precise server tuning.
                    </li>
                    <li className="mb-2">
                        <strong>Velocity</strong> - Hashed IDs and definition loading reduce churn, so new features ship faster and stay consistent across surfaces.
                    </li>
                </ul>

                <h6><strong>Key Differences vs V2</strong></h6>
                <ul className="text-start">
                    <li className="mb-2">
                        <strong>Scope</strong> - V2 ships adapters only; V3 ships full flows (rename, limit, clear, reset, region, permissions, privacy, templates, primary edit, transfer, claim, setup edit) plus the baseline Dynamic Channel flow.
                    </li>
                    <li className="mb-2">
                        <strong>Claims</strong> - V2 claim manager maps V3 claim transitions to V2 embeds/buttons; V3 runs native claim flows with its own buttons and embeds.
                    </li>
                    <li className="mb-2">
                        <strong>Definitions</strong> - V2 has no export-aware loading; V3 auto-loads exported adapters/flows/components so site and bot stay aligned.
                    </li>
                </ul>
            </div>
        </div>
    );
}

