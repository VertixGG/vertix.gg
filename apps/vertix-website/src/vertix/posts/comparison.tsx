import { Fragment } from "react";

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
 * How one cell reads, for both tables. Written once because the two say the same four things and
 * a second copy is how they come to disagree about which colour means absent.
 */
function renderCell( cell: string | null | undefined ) {
    if ( undefined === cell ) {
        return <span className="text-vc-violet">Not checked</span>;
    }

    if ( null === cell ) {
        return <span className="text-vc-crimson">Unavailable</span>;
    }

    if ( "Paid" === cell ) {
        return <span className="text-vc-azure-soft">Paid only</span>;
    }

    if ( "Vote" === cell ) {
        return <span className="text-vc-violet">Subscription</span>;
    }

    return cell;
}

/**
 * A cell in the audit table. A string is what that bot calls the feature, `null` is absent
 * entirely, and `undefined` is a row nobody has checked - which nothing is any more.
 *
 * The two gates are deliberately separate. `"Paid"` is a subscription and nothing else; `"Vote"`
 * is a subscription or a vote on top.gg, which the bot hands back as a link. They are not the
 * same offer - a vote costs nothing and wears off - and both bots that do it draw the line in the
 * same place: room commands can be voted open, server settings cannot.
 */
type AuditCell = string | null | undefined;

interface AuditRow {
    capability: string;
    cells: AuditCell[];
}

/**
 * The matrix below was written from their documentation inwards: three bots were read, and the
 * rows are the features those three chose to write about. This one is written the other way
 * round - one row per thing v2 or v3 actually carries - so it is a checklist of this bot rather
 * than an answer sheet to somebody else's.
 *
 * Rows the matrix had already been checked for keep their answers; the rest are unchecked, which
 * is most of what v3 added and all of what shipped since.
 */
const AUDIT: { group: string, rows: AuditRow[] }[] = [
    {
        group: "What the owner of a room can do",
        rows: [
            { capability: "The room's control panel", cells: [ "Buttons, both places", "Interface", "Interface, /voice", "Interface" ] },
            { capability: "Rename the room", cells: [ "Rename", "Name", "name", "Rename" ] },
            { capability: "Cap how many can join", cells: [ "User Limit", "Limit", "limit", "Limit" ] },
            { capability: "Lock it", cells: [ "Privacy", "Lock", "privacy", "Lock" ] },
            { capability: "Hide it from the channel list", cells: [ "Privacy", "Vote", "privacy", "Hide" ] },
            { capability: "Allow or block individuals", cells: [ "Access", "Permit", "trust, block", "Permit, Ban" ] },
            { capability: "Kick somebody out", cells: [ "Access", "reject", "kick", "Ban" ] },
            { capability: "Enter with a password", cells: [ null, null, "password", null ] },
            { capability: "Wipe the room's chat", cells: [ "Clear Chat", null, null, null ] },
            { capability: "Put it back the way the generator made it", cells: [ "Reset", null, "reset", null ] },
            { capability: "Take over an empty room", cells: [ "Claim", "Claim", "claim", "Claim" ] },
            { capability: "Hand it to someone else", cells: [ "Transfer", "Vote", "Vote", "Transfer" ] },
            { capability: "Write the room's status line", cells: [ "Status", "Status", "Vote", null ] },
            { capability: "Advertise the room for members", cells: [ "LFM", "Vote", null, null ] },
            { capability: "Knock to be let in", cells: [ "Knock", "Vote", "Vote", "Paid" ] },
            { capability: "Send an invite to the room", cells: [ "Invite", "Vote", "Vote", "Paid" ] },
            { capability: "Change the voice region", cells: [ "Region", "Vote", "region", "Region" ] },
            { capability: "Owner changes the bitrate", cells: [ null, "Vote", "bitrate", "Bitrate" ] },
            { capability: "Text chat for the room", cells: [ "In-voice chat", "Vote", "Vote", "Paid" ] },
            { capability: "Save the room as a template", cells: [ "Templates", null, null, "Template" ] },
            { capability: "Reword the room's own panel", cells: [ "Edit Primary Message", "Paid", null, "Edit message" ] },
        ],
    },
    {
        group: "What you can configure on generator level",
        rows: [
            { capability: "Name new rooms from a pattern", cells: [ "Placeholders", "Paid", "Placeholders", "Variables" ] },
            { capability: "Put what they are playing in the name", cells: [ "{game}", "Vote", "Paid", "Paid" ] },
            { capability: "Choose which buttons a room carries", cells: [ "Per generator", "Paid", "Toggle Features", "Paid" ] },
            { capability: "Arrange those buttons into rows", cells: [ "Interface editor", "Paid", "Drag to reorder", "Button order" ] },
            { capability: "A different button set per role", cells: [ "Yes", "Paid", null, null ] },
            { capability: "Start rooms public, private or hidden", cells: [ "Default privacy", "Lock by default", "Privacy mode", "Default state" ] },
            { capability: "Start rooms at a set limit", cells: [ "Default limit", null, "User limit", "User limit" ] },
            { capability: "Bitrate set by the generator", cells: [ "Inherited", null, "Setting", "Setting" ] },
            { capability: "Roles that get in past the lock (per generator)", cells: [ "Verified roles", null, "Access roles", "Moderator role" ] },
            { capability: "Roles that can act on any room (per generator)", cells: [ "Staff roles", null, null, "Moderator role" ] },
            { capability: "A role while somebody is in a room (per generator)", cells: [ "Voice role", null, "Paid", null ] },
            { capability: "Remember each owner's settings", cells: [ "Auto save", "Global profile", "Recover settings", null ] },
            { capability: "Let the bot write the status itself", cells: [ "Auto status", null, null, null ] },
            { capability: "Mention the owner on the panel", cells: [ "Setting", "Paid", null, null ] },
            { capability: "Panel in voice chat, a control-panel channel, or both", cells: [ "Both", "interface", "Both", "Both" ] },
            { capability: "A text channel made for each room", cells: [ null, "Paid", "thread", "Paid" ] },
            { capability: "Log what happens to a room", cells: [ "Logs channel", "logs", "Paid", null ] },
            { capability: "Keep chosen words out of room names (per generator)", cells: [ null, null, "Censor names", "Paid" ] },
            { capability: "Where the ads go, and who they may ping", cells: [ "Per generator", "LFM channel", null, null ] },
            { capability: "How long a generator waits between ads", cells: [ "Four timings", null, null, null ] },
        ],
    },
    {
        group: "What you can configure on guild level",
        rows: [
            { capability: "Roles that get in past the lock (server-wide)", cells: [ "Verified roles", "Paid", null, null ] },
            { capability: "Roles that can act on any room (server-wide)", cells: [ "Staff roles", "Staff role", null, null ] },
            { capability: "A role while somebody is in a room (server-wide)", cells: [ "Voice role", "Paid", null, "One free" ] },
            { capability: "Keep chosen words out of room names (server-wide)", cells: [ "Badwords", "Blacklisted Words", null, null ] },
            { capability: "Speak the member's own language", cells: [ "Seven languages", "Per server", "17 languages", null ] },
            { capability: "Reword every message it sends", cells: [ "Dashboard", "Paid", null, null ] },
            { capability: "How long a claim vote runs", cells: [ "Five timings", null, null, null ] },
        ],
    },
    {
        group: "How the bot itself behaves",
        rows: [
            { capability: "Vote for a new owner when one walks out", cells: [ "Claim vote", null, null, null ] },
            { capability: "Rooms that scale with the crowd", cells: [ "Scaling channels", "Paid", null, null ] },
        ],
    },
    {
        group: "What it costs",
        rows: [
            { capability: "Generators on the free tier", cells: [ "2", "1", "Capped, not published", "2" ] },
            { capability: "What it costs to add more", cells: [ "$1 each", "\u00A33.99 a month", "EUR 4 a month", "$3.99 a month" ] },
            { capability: "Every feature on the free tier", cells: [ "Yes", null, null, null ] },
            { capability: "No vote-gated commands", cells: [ "Yes", null, null, null ] },
        ],
    },
];

/**
 * The dashboards, which are a different product from the bots and worth their own table: two of
 * the four put settings there that exist nowhere in discord, and one of them puts a whole feature
 * there and nothing in discord at all.
 *
 * Read by opening each one against the same test server. A `null` here is a section the dashboard
 * does not have, not a feature the bot lacks - Astro edits interfaces perfectly well, just never
 * from its dashboard, which says so itself.
 */
const DASHBOARDS: { capability: string, cells: AuditCell[] }[] = [
    { capability: "A dashboard outside discord", cells: [ "Yes", "Yes", "Yes", "Yes" ] },
    { capability: "Set a generator up inside discord instead", cells: [ "Yes", "Yes", "Yes", null ] },
    { capability: "Create a generator from the dashboard", cells: [ "Yes", "Yes", "Yes", "Yes" ] },
    { capability: "Edit a generator's settings there", cells: [ "Yes", "Yes", "Yes", "Yes" ] },
    { capability: "Add, remove and reorder rows there", cells: [ "Yes", "Paid", "Reorder only", null ] },
    { capability: "Rewrite what the bot says", cells: [ "Yes", "Paid", null, null ] },
    { capability: "Rewrite it per language", cells: [ "Yes", null, null, null ] },
    { capability: "Rewrite it for one generator only", cells: [ "Yes", null, null, null ] },
    { capability: "See the rooms that are open right now", cells: [ "Yes", null, null, null ] },
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
                One row per capability, one column per bot. The rows are this bot&rsquo;s own
                feature list, taken from both interface versions rather than from anybody&rsquo;s
                marketing, so the table reads as a checklist of what exists rather than an answer
                sheet to somebody else&rsquo;s.{ " " }
                <span className="text-vc-crimson">Unavailable</span> means the capability appears
                nowhere in that bot&rsquo;s commands, panel or documentation.{ " " }
                <span className="text-vc-azure-soft">Paid only</span> means it exists and a
                subscription is the only way to it.{ " " }
                <span className="text-vc-violet">Subscription</span> means the same gate with a
                second door: the bot offers a vote on top.gg as an alternative, which unlocks the
                feature for a while and then closes again. Every cell was read from the bot or its
                dashboard rather than from its marketing, and none are left unanswered.
            </p>

            <div className="overflow-x-auto xl:overflow-x-visible mb-4">
                <table className="w-full text-sm table-fixed" style={ { minWidth: "64rem" } }>
                    <colgroup>
                        <col style={ { width: "36%" } } />
                        { BOT_COLUMNS.map( ( bot ) => (
                            <col key={ bot } style={ { width: "16%" } } />
                        ) ) }
                    </colgroup>
                    <thead>
                        <tr className="text-left">
                            <th className="vc-table-head-cell py-3 pr-4 pl-[5px] text-base font-bold">Capability</th>
                            { BOT_COLUMNS.map( ( bot, index ) => (
                                <th key={ bot }
                                    className={ `vc-table-head-cell py-3 pr-4 pl-[5px] text-base font-bold whitespace-nowrap ${
                                        0 === index ? "text-vc-mint" : "text-vc-ice-dim" }` }>
                                    { bot }
                                </th>
                            ) ) }
                        </tr>
                    </thead>
                    <tbody>
                        { AUDIT.map( ( section ) => (
                            <Fragment key={ section.group }>
                                <tr>
                                    <th colSpan={ 1 + BOT_COLUMNS.length }
                                        className="pt-8 pb-2 pr-2 pl-[5px] text-left text-fine uppercase tracking-wide text-vc-cyan">
                                        { section.group }
                                    </th>
                                </tr>

                                { section.rows.map( ( row ) => (
                                    <tr key={ row.capability } className="border-b border-vc-hairline">
                                        <td className="py-3 pr-2 pl-[5px] text-vc-ice whitespace-nowrap">{ row.capability }</td>
                                        { row.cells.map( ( cell, index ) => (
                                            <td key={ BOT_COLUMNS[ index ] } className="py-3 pr-2 pl-[5px] text-vc-starlight">
                                                { renderCell( cell ) }
                                            </td>
                                        ) ) }
                                    </tr>
                                ) ) }
                            </Fragment>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <p className="text-vc-ice-dim text-fine mb-12">
                Read in September 2026 against one test server running all four. Anything nobody
                could press comes from each bot&rsquo;s own documentation:{ " " }
                <a href="https://voicemaster.xyz/en/docs/commands" target="_blank" rel="noreferrer nofollow">voicemaster.xyz/docs</a>,{ " " }
                <a href="https://easy.tempvoice.xyz/" target="_blank" rel="noreferrer nofollow">easy.tempvoice.xyz</a>{ " " }
                and{ " " }
                <a href="https://astro-bot.space/guides" target="_blank" rel="noreferrer nofollow">astro-bot.space/guides</a>.
                &ldquo;Not published&rdquo; marks a number none of them state.
            </p>

            <h2 className="text-h5 mb-3">The dashboards, side by side</h2>

            <p className="text-vc-ice-dim mb-6">
                Three of the four have a website you configure the bot from, and they are not the
                same product as the bot. Astro puts generator settings there that exist nowhere in
                discord - its <code>/generator</code> command does nothing but link to the site -
                while its interface editor is the other way round, live in discord and
                &ldquo;still under development&rdquo; on the dashboard. A row marked{ " " }
                <span className="text-vc-crimson">Unavailable</span> here means the dashboard has
                no such section, which is not the same as the bot lacking the feature.
            </p>

            <div className="overflow-x-auto xl:overflow-x-visible mb-4">
                <table className="w-full text-sm table-fixed" style={ { minWidth: "64rem" } }>
                    <colgroup>
                        <col style={ { width: "36%" } } />
                        { BOT_COLUMNS.map( ( bot ) => (
                            <col key={ bot } style={ { width: "16%" } } />
                        ) ) }
                    </colgroup>
                    <thead>
                        <tr className="text-left">
                            <th className="vc-table-head-cell py-3 pr-4 pl-[5px] text-base font-bold">On the dashboard</th>
                            { BOT_COLUMNS.map( ( bot, index ) => (
                                <th key={ bot }
                                    className={ `vc-table-head-cell py-3 pr-4 pl-[5px] text-base font-bold whitespace-nowrap ${
                                        0 === index ? "text-vc-mint" : "text-vc-ice-dim" }` }>
                                    { bot }
                                </th>
                            ) ) }
                        </tr>
                    </thead>
                    <tbody>
                        { DASHBOARDS.map( ( row ) => (
                            <tr key={ row.capability } className="border-b border-vc-hairline">
                                <td className="py-3 pr-2 pl-[5px] text-vc-ice whitespace-nowrap">{ row.capability }</td>
                                { row.cells.map( ( cell, index ) => (
                                    <td key={ BOT_COLUMNS[ index ] } className="py-3 pr-2 pl-[5px] text-vc-starlight">
                                        { renderCell( cell ) }
                                    </td>
                                ) ) }
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <p className="text-vc-ice-dim text-fine mb-12">
                Astro&rsquo;s dashboard was opened against this same test server in September 2026
                and carries six sections - Overview, Errors, Generators, Interfaces, Voice role and
                Templates - so the rows it does not answer are absences rather than pages nobody
                looked for. TempVoice and VoiceMaster were opened the same way. VoiceMaster&rsquo;s
                own pages are the reason two of its rows read as paid: its Interface section is a
                &ldquo;Custom Interface Creator&rdquo; behind VoiceMaster+, and so is its Bot
                Profile. The VoiceChannels column is read off this project&rsquo;s own dashboard.
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
                <a href="/invite-vertix"
                    className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                    Add to Discord
                </a>
            </div>
        </div>
    );
}
