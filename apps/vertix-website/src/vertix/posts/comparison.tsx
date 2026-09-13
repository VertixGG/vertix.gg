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

const BOT_COLUMNS = [ "VoiceChannels", "VoiceMaster", "TempVoice", "Astro" ] as const;

/**
 * Each row is one capability, then one cell per bot in BOT_COLUMNS order. A cell is either what
 * that bot calls the feature, or null - meaning it appears nowhere in that bot's own documentation.
 */
const MATRIX: { capability: string, cells: ( string | null )[] }[] = [
    { capability: "Owner control panel", cells: [ "Buttons", "Interface", "Interface, /voice", "Interface" ] },
    { capability: "Rename the room", cells: [ "Rename", "Name", "name", "Button" ] },
    { capability: "Cap how many can join", cells: [ "User Limit", "Limit", "limit", "Button" ] },
    { capability: "Lock or hide it", cells: [ "Privacy", "Lock, Ghost", "privacy", "Button" ] },
    { capability: "Allow or block individuals", cells: [ "Access", "Permit", "trust, block", "Button" ] },
    { capability: "Kick somebody out", cells: [ "Access", null, "kick", null ] },
    { capability: "Take over an empty room", cells: [ "Claim", "Claim", "claim", null ] },
    { capability: "Hand it to someone else", cells: [ "Transfer", null, "transfer", null ] },
    { capability: "Ask to be let in", cells: [ "Knock", null, "waiting", "Waiting rooms" ] },
    { capability: "Enter with a password", cells: [ null, null, "password", null ] },
    { capability: "Owner changes bitrate", cells: [ null, "Bitrate", "bitrate", null ] },
    { capability: "Bitrate from the generator", cells: [ "Inherited", null, "Setting", null ] },
    { capability: "Voice region", cells: [ "Region", null, "region", null ] },
    { capability: "Text chat for the room", cells: [ null, "Text", "thread", "Private text chats" ] },
    { capability: "Role while in a room", cells: [ "Voice role", null, "Voice role", "Voice roles" ] },
    { capability: "Name placeholders", cells: [ "Placeholders", "Predefined setup", "Placeholders", "Variables" ] },
    { capability: "Activity in the name", cells: [ "{game}", null, "{ACTIVITY_NAME}", "Activity variables" ] },
    { capability: "Activity log", cells: [ "Logs channel", null, "Moderation Log", null ] },
    { capability: "Turn controls off per server", cells: [ "Enable features", null, "Toggle Features", null ] },
    { capability: "Reword the bot, per language", cells: [ "Dashboard", null, null, null ] },
    { capability: "Free tier generator cap", cells: [ "2", "Not published", "Not published", "2" ] },
    { capability: "Costs nothing, ever", cells: [ "Yes", null, null, null ] },
    { capability: "No vote-gated commands", cells: [ "Yes", "Not published", null, null ] },
];

const HONEST = [
    {
        name: "Pick VoiceMaster if",
        body: "you want the room owner deciding bitrate themselves, or every voice room to come "
            + "with a text channel of its own. Here the bitrate is whatever the generator is set "
            + "to, and there is no paired text channel at all.",
    },
    {
        name: "Pick TempVoice if",
        body: "the rating matters to you. 4.8 across 528 reviews is the highest of the four, and "
            + "a happy user base is a real signal that no feature table captures.",
    },
    {
        name: "Pick Astro if",
        body: "you need more than two generators, or more than one interface, and will pay to "
            + "lift those caps. Both bots stop at two generators free; only Astro sells a way "
            + "past it.",
    },
];

export default function Comparison() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-h4">Discord temporary voice channel bots, compared</h1>

            <p className="text-vc-ice-dim mt-4 mb-10">
                The three bots whose whole product is temporary voice channels, against this
                one. Every number below is read off their own public pages, and the rows that go
                against us are here too.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
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

            <h2 className="text-h5 mb-3">Everything, side by side</h2>

            <p className="text-vc-ice-dim mb-6">
                One row per capability, one column per bot. A cell in{ " " }
                <span className="text-vc-crimson">red</span> means the feature appears nowhere in
                that bot&rsquo;s own documentation - which is the closest thing to proof it is not
                there, since a feature nobody documents is one nobody can find.
            </p>

            <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-vc-hairline-bright text-left">
                            <th className="py-3 pr-4 font-semibold">Capability</th>
                            { BOT_COLUMNS.map( ( bot, index ) => (
                                <th key={ bot }
                                    className={ `py-3 pr-4 font-semibold whitespace-nowrap ${
                                        0 === index ? "text-vc-mint" : "text-vc-ice-dim" }` }>
                                    { bot }
                                </th>
                            ) ) }
                        </tr>
                    </thead>
                    <tbody>
                        { MATRIX.map( ( row ) => (
                            <tr key={ row.capability } className="border-b border-vc-hairline">
                                <td className="py-3 pr-4 text-vc-ice whitespace-nowrap">{ row.capability }</td>
                                { row.cells.map( ( cell, index ) => (
                                    <td key={ BOT_COLUMNS[ index ] } className="py-3 pr-4 text-vc-ice-dim">
                                        { cell ?? <span className="text-vc-crimson">Unavailable</span> }
                                    </td>
                                ) ) }
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <p className="text-vc-ice-dim text-fine mb-12">
                Read in September 2026 from{ " " }
                <a href="https://voicemaster.xyz/" target="_blank" rel="noreferrer nofollow">voicemaster.xyz</a>,{ " " }
                <a href="https://easy.tempvoice.xyz/" target="_blank" rel="noreferrer nofollow">easy.tempvoice.xyz</a>,{ " " }
                and{ " " }
                <a href="https://astro-bot.space/" target="_blank" rel="noreferrer nofollow">astro-bot.space</a>.
                One caveat worth stating: Astro&rsquo;s interface buttons are added and removed by
                the server owner with <code>/interface add button</code>, and its guides do not
                list which buttons exist - so its control rows say only that an interface does the
                job, not which of these it can do. &ldquo;Not published&rdquo; marks a number none
                of them state anywhere.
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
