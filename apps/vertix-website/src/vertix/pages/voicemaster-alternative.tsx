const COMPARISON = [
    { capability: "Rename the room", vc: "Rename", vm: "Name" },
    { capability: "Cap how many can join", vc: "User Limit", vm: "Limit" },
    { capability: "Make it private or hidden", vc: "Privacy - public, private, hidden", vm: "Lock, Ghost" },
    { capability: "Allow or block individual members", vc: "Access", vm: "Permit" },
    { capability: "Send somebody straight in", vc: "Invite", vm: "Invite" },
    { capability: "Take over an abandoned room", vc: "Claim", vm: "Claim" },
    { capability: "Say what is happening in the room", vc: "Status", vm: "Status" },
    { capability: "Ask to be let into a private room", vc: "Knock", vm: null },
    { capability: "Choose the voice region", vc: "Region", vm: null },
    { capability: "Change the bitrate", vc: null, vm: "Bitrate" },
    { capability: "Paired temporary text channel", vc: null, vm: "Text" },
    { capability: "Wipe the channel's messages", vc: "Clear Chat", vm: null },
    { capability: "Put every setting back", vc: "Reset", vm: null },
    { capability: "Save a setup and reuse it", vc: "Templates", vm: "Clone Setup, set up server-side" },
    { capability: "Rooms made before anyone asks", vc: "Auto-scaling", vm: "Dynamic Setup" },
    { capability: "Reword what the bot says, per language", vc: "Web dashboard", vm: null },
    { capability: "Activity log per generator", vc: "Logs channel", vm: null },
] as const;

const DIFFERENCES = [
    {
        title: "Everything is free",
        body: "VoiceMaster keeps a free tier and sells VoiceMaster+ from GBP 3.99 a month for one "
            + "server, rising with the number of servers you want it on. VoiceChannels has no paid "
            + "tier and nothing held back behind one - every control on this page works on every "
            + "server it is added to.",
    },
    {
        title: "The wording is yours",
        body: "Every embed, button label and message the bot sends can be rewritten from a web "
            + "dashboard, per language. Most bots let you rename channels; this lets you rename the "
            + "bot's own vocabulary so it reads like part of your server.",
    },
    {
        title: "Controls can be switched off",
        body: "Each button is opt-out per server. If you do not want members renaming rooms or "
            + "clearing chat, turn those off and they stop appearing for everyone.",
    },
] as const;

const goToInvite = () => {
    window.location.href = "/invite-vertix";
};

export default function VoiceMasterAlternative() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-center mb-6">A free VoiceMaster alternative</h1>

            <section className="mb-12">
                <p className="text-h5 text-vc-ice-dim text-center">
                    VoiceChannels, VoiceMaster and TempVoice all do the same core job: somebody
                    joins one channel, gets a room of their own, and the room disappears when it
                    empties. What follows is where they actually differ.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4">Side by side</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-vc-hairline-bright text-left">
                                <th className="py-3 pr-4 font-semibold">Capability</th>
                                <th className="py-3 pr-4 font-semibold text-vc-mint">VoiceChannels</th>
                                <th className="py-3 font-semibold text-vc-ice-dim">VoiceMaster</th>
                            </tr>
                        </thead>
                        <tbody>
                            { COMPARISON.map( ( row ) => (
                                <tr key={ row.capability } className="border-b border-vc-hairline">
                                    <td className="py-3 pr-4 text-vc-ice">{ row.capability }</td>
                                    <td className="py-3 pr-4 text-vc-ice-dim">
                                        { row.vc ?? <span className="text-vc-crimson">Not available</span> }
                                    </td>
                                    <td className="py-3 text-vc-ice-dim">
                                        { row.vm ?? <span className="text-vc-ice-dim">Not advertised</span> }
                                    </td>
                                </tr>
                            ) ) }
                        </tbody>
                    </table>
                </div>

                <p className="text-vc-ice-dim mt-6 mb-0 text-fine">
                    The VoiceMaster column lists what{ " " }
                    <a href="https://voicemaster.xyz/" target="_blank" rel="noreferrer nofollow">
                        voicemaster.xyz
                    </a>{ " " }
                    advertises publicly, checked September 2026. &ldquo;Not advertised&rdquo; means
                    it is not claimed on their site - not that it cannot be done. Their pages are
                    the place to confirm anything here before you decide.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4">Where VoiceMaster is ahead</h2>

                <p className="text-vc-ice-dim mb-0">
                    Two things it offers that VoiceChannels does not: the room owner can change the
                    channel&rsquo;s <strong>bitrate</strong>, and each voice room can come with a
                    paired <strong>text channel</strong> of its own. If either is central to how
                    your server runs, that is a real reason to pick VoiceMaster, and no comparison
                    table should talk you out of it.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="mb-4">Where VoiceChannels is different</h2>

                <div className="grid gap-4 md:grid-cols-3">
                    { DIFFERENCES.map( ( item ) => (
                        <div key={ item.title }
                            className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                            <h3 className="text-h5 text-vc-cyan mb-2">{ item.title }</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">{ item.body }</p>
                        </div>
                    ) ) }
                </div>
            </section>

            <section className="mb-12">
                <h2 className="mb-4">What about TempVoice?</h2>

                <p className="text-vc-ice-dim mb-0">
                    TempVoice covers the same ground - a creator channel, rooms that delete
                    themselves, and members moderating their own room. Its site does not publish a
                    control-by-control list, so it is not in the table above rather than being
                    guessed at. If you are weighing it up,{ " " }
                    <a href="https://tempvoice.xyz/" target="_blank" rel="noreferrer nofollow">
                        tempvoice.xyz
                    </a>{ " " }
                    is the place to look.
                </p>
            </section>

            <section className="mb-4">
                <div className="p-6 bg-vc-space rounded border border-vc-hairline-bright text-center">
                    <h2 className="mb-3">Try it alongside what you have</h2>
                    <p className="text-vc-ice-dim mb-6">
                        Nothing stops two of these running on one server while you decide. Set up a
                        generator, see how it behaves, and remove whichever you like less.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <button onClick={ goToInvite }
                            className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                            Add to Discord
                        </button>
                        <a href="/join-to-create" className="vc-btn vc-btn-lg">
                            How Join to Create works
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
