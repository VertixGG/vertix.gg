interface Contender {
    name: string;
    accent: string;
    servers: string;
    rating: string;
    price: string;
    priceNote: string;
    free: boolean;
}

const CONTENDERS: Contender[] = [
    {
        name: "VoiceChannels",
        accent: "var(--color-vc-mint)",
        servers: "—",
        rating: "—",
        price: "Free",
        priceNote: "No paid tier exists",
        free: true,
    },
    {
        name: "VoiceMaster",
        accent: "var(--color-vc-ice-dim)",
        servers: "760K",
        rating: "4.0",
        price: "from £3.99",
        priceNote: "per month, 1 server",
        free: false,
    },
    {
        name: "TempVoice",
        accent: "var(--color-vc-ice-dim)",
        servers: "504K",
        rating: "4.8",
        price: "Premium",
        priceNote: "Some commands need a vote",
        free: false,
    },
    {
        name: "Astro",
        accent: "var(--color-vc-ice-dim)",
        servers: "119K",
        rating: "4.4",
        price: "$3.99",
        priceNote: "per month, 1 server",
        free: false,
    },
    {
        name: "ChannelBot",
        accent: "var(--color-vc-ice-dim)",
        servers: "28.6K",
        rating: "3.8",
        price: "Utility bot",
        priceNote: "Temp channels is one feature",
        free: false,
    },
];

const GATING = [
    {
        name: "VoiceChannels",
        good: true,
        body: "Every control works on every server. There is no premium tier to buy and no "
            + "command that asks you to vote first, because neither exists.",
    },
    {
        name: "VoiceMaster",
        good: false,
        body: "A free tier, then VoiceMaster+ at £3.99 a month for one server, £7.99 for three "
            + "and £15.99 for ten. Annual and lifetime options per tier.",
    },
    {
        name: "TempVoice",
        good: false,
        body: "Free to use, with a premium tier. In their own reply to a review on top.gg: "
            + "“The other commands need a vote which is also free.”",
    },
    {
        name: "Astro",
        good: false,
        body: "Ultimate is $3.99 a month for one server. Their pricing page lists "
            + "“Bypass voting requirements in any server” as a premium feature.",
    },
];

const ASTRO_CAPS = [
    { label: "Voice channel generators", astro: "2", vc: "2" },
    { label: "Interfaces", astro: "1", vc: "No limit" },
    { label: "Voice roles", astro: "1", vc: "Not available" },
    { label: "Saved templates", astro: "3", vc: "No limit" },
];

const CONTROLS = [
    { capability: "Rename the room", vc: "Rename", vm: "Name" },
    { capability: "Cap how many can join", vc: "User Limit", vm: "Limit" },
    { capability: "Make it private or hidden", vc: "Privacy", vm: "Lock, Ghost" },
    { capability: "Allow or block individuals", vc: "Access", vm: "Permit" },
    { capability: "Send somebody straight in", vc: "Invite", vm: "Invite" },
    { capability: "Take over an abandoned room", vc: "Claim", vm: "Claim" },
    { capability: "Say what is happening", vc: "Status", vm: "Status" },
    { capability: "Ask to enter a private room", vc: "Knock", vm: null },
    { capability: "Choose the voice region", vc: "Region", vm: null },
    { capability: "Wipe the channel's messages", vc: "Clear Chat", vm: null },
    { capability: "Put every setting back", vc: "Reset", vm: null },
    { capability: "Save a setup and reuse it", vc: "Templates", vm: "Clone Setup" },
    { capability: "Change the bitrate", vc: null, vm: "Bitrate" },
    { capability: "Paired temporary text channel", vc: null, vm: "Text" },
    { capability: "Reword the bot, per language", vc: "Dashboard", vm: null },
];

const HONEST = [
    {
        name: "Pick VoiceMaster if",
        body: "you want the room owner to control bitrate, or you want every voice room to come "
            + "with a text channel of its own. VoiceChannels does neither, and both are things "
            + "people genuinely build servers around.",
    },
    {
        name: "Pick TempVoice if",
        body: "the rating matters to you. 4.8 across 528 reviews is the highest of the five, and "
            + "a happy user base is a real signal that no feature table captures.",
    },
    {
        name: "Pick Astro if",
        body: "you need voice roles - a role handed out when somebody joins a channel - or you "
            + "need more than two generators and are willing to pay to lift the cap.",
    },
    {
        name: "Pick ChannelBot if",
        body: "temporary channels are a side dish. It also does server backups, reaction roles, "
            + "welcome messages and sticky messages, and replacing four bots with one has value.",
    },
];

export default function Comparison() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-h4">Discord temporary voice channel bots, compared</h1>

            <p className="text-vc-ice-dim mt-4 mb-10">
                The four most-used bots in top.gg&rsquo;s temporary-voice-channels category,
                against this one. Every number below is read off their own public pages, and the
                rows that go against us are here too.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-4">
                { CONTENDERS.map( ( bot ) => (
                    <div key={ bot.name }
                        className="p-4 rounded border h-full"
                        style={ {
                            borderColor: bot.free ? "var(--color-vc-mint)" : "var(--color-vc-hairline-bright)",
                            background: "var(--color-vc-space)",
                        } }>
                        <h2 className="text-h6 mb-3" style={ { color: bot.accent } }>{ bot.name }</h2>

                        <div className="text-fine text-vc-ice-dim mb-1">
                            Servers <span className="text-vc-ice">{ bot.servers }</span>
                        </div>
                        <div className="text-fine text-vc-ice-dim mb-3">
                            Rating <span className="text-vc-ice">{ bot.rating }</span>
                        </div>

                        <div className={ `text-h6 ${ bot.free ? "text-vc-mint" : "text-vc-ice" }` }>
                            { bot.price }
                        </div>
                        <div className="text-fine text-vc-ice-dim">{ bot.priceNote }</div>
                    </div>
                ) ) }
            </div>

            <p className="text-vc-ice-dim text-fine mb-12">
                Server counts and ratings as top.gg published them in September 2026. VoiceChannels
                does not claim a count here, because there is nothing on this site to check one
                against.
            </p>

            <h2 className="text-h5 mb-3">What each of them costs</h2>

            <p className="text-vc-ice-dim mb-6">
                This is the sharpest difference between them, and it is not really about money -
                it is about which parts of the bot your members can reach.
            </p>

            <div className="grid gap-4 md:grid-cols-2 mb-12">
                { GATING.map( ( item ) => (
                    <div key={ item.name }
                        className="p-4 rounded border h-full"
                        style={ {
                            borderColor: item.good ? "var(--color-vc-mint)" : "var(--color-vc-hairline-bright)",
                            background: "var(--color-vc-space)",
                        } }>
                        <h3 className={ `text-h6 mb-2 ${ item.good ? "text-vc-mint" : "text-vc-ice" }` }>
                            { item.name }
                        </h3>
                        <p className="text-vc-ice-dim mb-0 text-sm">{ item.body }</p>
                    </div>
                ) ) }
            </div>

            <h2 className="text-h5 mb-3">Where the free tier stops</h2>

            <p className="text-vc-ice-dim mb-6">
                Astro is the only one of the four that publishes its free limits outright, so it is
                the only one that can be compared honestly on this. We hit the same wall it does on
                generators - two - and unlike Astro there is no tier to buy that lifts it.
            </p>

            <div className="overflow-x-auto mb-12">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-vc-hairline-bright text-left">
                            <th className="py-3 pr-4 font-semibold"></th>
                            <th className="py-3 pr-4 font-semibold text-vc-mint">VoiceChannels</th>
                            <th className="py-3 font-semibold text-vc-ice-dim">Astro, free</th>
                        </tr>
                    </thead>
                    <tbody>
                        { ASTRO_CAPS.map( ( row ) => (
                            <tr key={ row.label } className="border-b border-vc-hairline">
                                <td className="py-3 pr-4 text-vc-ice">{ row.label }</td>
                                <td className="py-3 pr-4 text-vc-ice-dim">{ row.vc }</td>
                                <td className="py-3 text-vc-ice-dim">{ row.astro }</td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <h2 className="text-h5 mb-3">Control by control</h2>

            <p className="text-vc-ice-dim mb-6">
                VoiceMaster is the only other one publishing a full control list, so it is the only
                column that can be filled in without guessing.
            </p>

            <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-vc-hairline-bright text-left">
                            <th className="py-3 pr-4 font-semibold">Capability</th>
                            <th className="py-3 pr-4 font-semibold text-vc-mint">VoiceChannels</th>
                            <th className="py-3 font-semibold text-vc-ice-dim">VoiceMaster</th>
                        </tr>
                    </thead>
                    <tbody>
                        { CONTROLS.map( ( row ) => (
                            <tr key={ row.capability } className="border-b border-vc-hairline">
                                <td className="py-3 pr-4 text-vc-ice">{ row.capability }</td>
                                <td className="py-3 pr-4 text-vc-ice-dim">
                                    { row.vc ?? <span className="text-vc-crimson">Not available</span> }
                                </td>
                                <td className="py-3 text-vc-ice-dim">
                                    { row.vm ?? "Not advertised" }
                                </td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <p className="text-vc-ice-dim text-fine mb-12">
                &ldquo;Not advertised&rdquo; means it is not claimed on their site, not that it
                cannot be done. Read from{ " " }
                <a href="https://voicemaster.xyz/" target="_blank" rel="noreferrer nofollow">voicemaster.xyz</a>,{ " " }
                <a href="https://tempvoice.xyz/" target="_blank" rel="noreferrer nofollow">tempvoice.xyz</a>,{ " " }
                <a href="https://astro-bot.space/" target="_blank" rel="noreferrer nofollow">astro-bot.space</a>{ " " }
                and their top.gg listings, September 2026.
            </p>

            <h2 className="text-h5 mb-3">When not to pick this one</h2>

            <div className="grid gap-4 md:grid-cols-2 mb-12">
                { HONEST.map( ( item ) => (
                    <div key={ item.name }
                        className="p-4 bg-vc-space rounded border border-vc-hairline-bright h-full">
                        <h3 className="text-h6 text-vc-cyan mb-2">{ item.name }</h3>
                        <p className="text-vc-ice-dim mb-0 text-sm">{ item.body }</p>
                    </div>
                ) ) }
            </div>

            <div className="p-6 bg-vc-space rounded border border-vc-hairline-bright text-center">
                <h2 className="text-h5 mb-3">Two of them can run at once</h2>
                <p className="text-vc-ice-dim mb-6">
                    Nothing stops you setting up a generator here while another bot keeps doing what
                    it does, and removing whichever you like less.
                </p>
                <button onClick={ () => { window.location.href = "/invite-vertix"; } }
                    className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                    Add to Discord
                </button>
            </div>
        </div>
    );
}
