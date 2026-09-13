interface Contender {
    name: string;
    accent: string;
    servers: string;
    rating: string;
    price: string;
    priceNote: string;
    isUs: boolean;
}

const CONTENDERS: Contender[] = [
    {
        name: "VoiceChannels",
        accent: "var(--color-vc-mint)",
        servers: "—",
        rating: "—",
        price: "$1",
        priceNote: "per month, per generator past the first two",
        isUs: true,
    },
    {
        name: "VoiceMaster",
        accent: "var(--color-vc-ice-dim)",
        servers: "760K",
        rating: "4.0",
        price: "from £3.99",
        priceNote: "per month, 1 server",
        isUs: false,
    },
    {
        name: "TempVoice",
        accent: "var(--color-vc-ice-dim)",
        servers: "504K",
        rating: "4.8",
        price: "EUR 4",
        priceNote: "per month, 1 server",
        isUs: false,
    },
    {
        name: "Astro",
        accent: "var(--color-vc-ice-dim)",
        servers: "119K",
        rating: "4.4",
        price: "$3.99",
        priceNote: "per month, 1 server",
        isUs: false,
    },
];

const GATING = [
    {
        name: "VoiceChannels",
        isUs: true,
        body: "Every control works on every server, free. The only thing money buys is "
            + "quantity - $1 a month for each generator past the first two - and no command "
            + "has ever asked anybody to vote for it.",
    },
    {
        name: "VoiceMaster",
        isUs: false,
        body: "Their premium page is blunt about it: the free tier gets one generator, and Ghost, "
            + "Bitrate, Text, Invite, Status, Region, LFM, NSFW, Transfer and Request are listed "
            + "as premium commands. £3.99 a month for one server.",
    },
    {
        name: "TempVoice",
        isUs: false,
        body: "EUR 4 a month buys custom interfaces, moderation logging, unlimited creator "
            + "channels and, in their own words on the pricing page, “No Vote-locked Commands” - "
            + "so the free tier is the vote-locked one.",
    },
    {
        name: "Astro",
        isUs: false,
        body: "$3.99 a month. Free stops at two generators, one interface, one voice role and "
            + "three templates, and waiting rooms, per-room text chats and custom interfaces are "
            + "all Ultimate - as is bypassing the voting requirement.",
    },
];

const BOT_COLUMNS = [ "VoiceChannels", "VoiceMaster", "TempVoice", "Astro" ] as const;

/**
 * Each row is one capability, then one cell per bot in BOT_COLUMNS order. A cell is either what
 * that bot calls the feature, or null - meaning it appears nowhere in that bot's own documentation.
 */
const MATRIX: { capability: string, cells: ( string | null )[] }[] = [
    { capability: "Owner control panel", cells: [ "Buttons", "Interface", "Interface, /voice", "Interface" ] },
    { capability: "Rename the room", cells: [ "Rename", "Name", "name", "Rename" ] },
    { capability: "Cap how many can join", cells: [ "User Limit", "Limit", "limit", "Limit" ] },
    { capability: "Lock it", cells: [ "Privacy", "Lock", "privacy", "Lock" ] },
    { capability: "Hide it from the list", cells: [ "Privacy", "Paid", "privacy", "Hide" ] },
    { capability: "Allow or block individuals", cells: [ "Access", "Permit", "trust, block", "Permit, Ban" ] },
    { capability: "Kick somebody out", cells: [ "Access", "reject", "kick", "Ban" ] },
    { capability: "Take over an empty room", cells: [ "Claim", "Claim", "claim", "Claim" ] },
    { capability: "Hand it to someone else", cells: [ "Transfer", "Paid", "transfer", "Transfer" ] },
    { capability: "Ask to be let in", cells: [ "Knock", "Paid", "waiting", "Paid" ] },
    { capability: "Enter with a password", cells: [ null, null, "password", null ] },
    { capability: "Owner changes bitrate", cells: [ null, "Paid", "bitrate", "Bitrate" ] },
    { capability: "Bitrate from the generator", cells: [ "Inherited", null, "Setting", "Setting" ] },
    { capability: "Voice region", cells: [ "Region", "Paid", "region", "Region" ] },
    { capability: "Text chat for the room", cells: [ "In-voice chat", "Paid", "thread", "Paid" ] },
    { capability: "A text channel made for it", cells: [ null, "Paid", "thread", "Paid" ] },
    { capability: "Panel in voice chat, a text channel, or both", cells: [ "Both", "interface", "Both", "Both" ] },
    { capability: "Role while in a room", cells: [ "Voice role", "Paid", "Voice role", "One free" ] },
    { capability: "Name placeholders", cells: [ "Placeholders", "Paid", "Placeholders", "Variables" ] },
    { capability: "Activity in the name", cells: [ "{game}", null, "Paid", "Paid" ] },
    { capability: "Activity log", cells: [ "Logs channel", "logs", "Paid", null ] },
    { capability: "Turn controls off", cells: [ "Per generator", "Paid", "Toggle Features", "Paid" ] },
    { capability: "A different button set per role", cells: [ "Yes", "Paid", null, null ] },
    { capability: "Reword the bot, per language", cells: [ "Dashboard", null, null, null ] },
    { capability: "Generators on the free tier", cells: [ "2", "1", "Capped, not published", "2" ] },
    { capability: "What it costs to add more", cells: [ "$1 each", "£3.99 a month", "EUR 4 a month", "$3.99 a month" ] },
    { capability: "Every feature on the free tier", cells: [ "Yes", null, null, null ] },
    { capability: "No vote-gated commands", cells: [ "Yes", null, null, null ] },
];

const HONEST = [
    {
        name: "Pick VoiceMaster if",
        body: "you will pay, and want the most setup styles for it - five, from plain rooms to "
            + "numbered ones to a pool made before anyone joins. Most of what is listed above "
            + "against its name comes with the subscription rather than the bot, but it is on "
            + "the most servers of the four by some margin.",
    },
    {
        name: "Pick TempVoice if",
        body: "the rating matters to you. 4.8 across 528 reviews is the highest of the four, and "
            + "a happy user base is a real signal that no feature table captures.",
    },
    {
        name: "Pick Astro if",
        body: "you want the widest control panel of the four. Its default interface carries "
            + "sixteen buttons and the server owner can add or drop any of them, and it does "
            + "waiting rooms, per-room text chats and voice roles. Activity variables and "
            + "numbered names need Ultimate.",
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
                            borderColor: bot.isUs ? "var(--color-vc-mint)" : "var(--color-vc-hairline-bright)",
                            background: "var(--color-vc-space)",
                        } }>
                        <h2 className="text-h6 mb-3" style={ { color: bot.accent } }>{ bot.name }</h2>

                        <div className="text-fine text-vc-ice-dim mb-1">
                            Servers <span className="text-vc-ice">{ bot.servers }</span>
                        </div>
                        <div className="text-fine text-vc-ice-dim mb-3">
                            Rating <span className="text-vc-ice">{ bot.rating }</span>
                        </div>

                        <div className={ `text-h6 ${ bot.isUs ? "text-vc-mint" : "text-vc-ice" }` }>
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
                The useful question is not how much, but what for. Three of them charge to
                unlock features; here the features are all free and the charge is for volume -
                $1 a month for each generator past the first two, and nothing else.
            </p>

            <div className="grid gap-4 md:grid-cols-2 mb-12">
                { GATING.map( ( item ) => (
                    <div key={ item.name }
                        className="p-4 rounded border h-full"
                        style={ {
                            borderColor: item.isUs ? "var(--color-vc-mint)" : "var(--color-vc-hairline-bright)",
                            background: "var(--color-vc-space)",
                        } }>
                        <h3 className={ `text-h6 mb-2 ${ item.isUs ? "text-vc-mint" : "text-vc-ice" }` }>
                            { item.name }
                        </h3>
                        <p className="text-vc-ice-dim mb-0 text-sm">{ item.body }</p>
                    </div>
                ) ) }
            </div>

            <h2 className="text-h5 mb-3">Everything, side by side</h2>

            <p className="text-vc-ice-dim mb-6">
                One row per capability, one column per bot.{ " " }
                <span className="text-vc-crimson">Unavailable</span> means the feature appears
                nowhere in that bot&rsquo;s own documentation.{ " " }
                <span className="text-vc-azure-soft">Paid only</span> means it exists but their
                own pricing page puts it behind a subscription - which turned out to be the more
                interesting column by far.
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
                                        { null === cell
                                            ? <span className="text-vc-crimson">Unavailable</span>
                                            : "Paid" === cell
                                                ? <span className="text-vc-azure-soft">Paid only</span>
                                                : cell }
                                    </td>
                                ) ) }
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <p className="text-vc-ice-dim text-fine mb-12">
                Read in September 2026 from each bot&rsquo;s own documentation, not its landing
                page:{ " " }
                <a href="https://voicemaster.xyz/en/docs/commands" target="_blank" rel="noreferrer nofollow">voicemaster.xyz/docs</a>,{ " " }
                <a href="https://easy.tempvoice.xyz/" target="_blank" rel="noreferrer nofollow">easy.tempvoice.xyz</a>{ " " }
                and{ " " }
                <a href="https://astro-bot.space/guides" target="_blank" rel="noreferrer nofollow">astro-bot.space/guides</a>.
                Astro&rsquo;s row is read off the default interface pictured in its own Interfaces
                guide - Lock, Unlock, Hide, Unhide, Limit, Invite, Ban, Permit, Rename, Bitrate,
                Region, Template, Chat, Waiting, Claim, Transfer - and the server owner can add or
                remove any of them per interface. &ldquo;Not published&rdquo; marks a number none
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
