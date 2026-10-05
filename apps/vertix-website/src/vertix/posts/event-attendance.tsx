import { DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import { resolveGuildEventsSettings } from "@vertix.gg/definitions/src/guild-events-definitions";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";
import { EVENT_ATTENDANCE_VARIABLES } from "@vertix.gg/website/src/vertix/shared/events-data";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

const EVENTS_DEFAULTS = resolveGuildEventsSettings( null );

const ATTENDANCE_KINDS = [
    {
        label: "✅ Came",
        meaning: "On the Interested list, and in voice by the time check-in closed."
    },
    {
        label: "🕒 Late",
        meaning: "On the list, but arrived after check-in closed."
    },
    {
        label: "❌ Didn't come",
        meaning: "On the list, and never joined - or not for long enough, if you set a least time in voice."
    },
    {
        label: "👋 Walked in",
        meaning: "Came without pressing Interested."
    }
];

const SETTINGS = [
    {
        setting: "When check-in opens",
        byDefault: `${ EVENTS_DEFAULTS.checkInLeadMinutes } minutes before the start`,
        change: "Earlier for events that form up beforehand, so people check in while they gather."
    },
    {
        setting: "When check-in closes",
        byDefault: `${ EVENTS_DEFAULTS.lateAfterMinutes } minutes after the start`,
        change: "Right at the start for a strict start time, later for a relaxed one."
    },
    {
        setting: "Least time in voice that counts",
        byDefault: 0 === EVENTS_DEFAULTS.minVoiceMinutes
            ? "None - any time counts"
            : `${ EVENTS_DEFAULTS.minVoiceMinutes } minutes`,
        change: "Raise it so somebody who looks in for a minute is not counted as having come."
    },
    {
        setting: "How long an empty channel waits",
        byDefault: `${ EVENTS_DEFAULTS.endAfterEmptyMinutes } minutes`,
        change: "Longer if people step out between rounds and come back."
    },
    {
        setting: "Longest an event runs",
        byDefault: `${ EVENTS_DEFAULTS.maxDurationHours } hours`,
        change: "Shorter if your events never run that long."
    },
    {
        setting: "“Need a sub” post",
        byDefault: EVENTS_DEFAULTS.subPostsEnabled
            ? `On, when ${ EVENTS_DEFAULTS.subMinMissing } or more are missing`
            : "Off",
        change: "Off if you never take substitutes, or wait until more places are empty."
    },
    {
        setting: "Pings",
        byDefault: "None",
        change: "A role as check-in opens, the listed members not in voice yet, and a role for the sub post."
    },
    {
        setting: "Which events",
        byDefault: "Every voice and stage event",
        change: "Only the events held in channels you pick."
    },
    {
        setting: "Attendance copy",
        byDefault: "None",
        change: "A second channel - a staff log, say - that gets a copy of every finished attendance."
    }
];

export default function EventAttendance() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">How to track who actually showed up to a Discord event</h1>

            <p className="text-lg text-vc-ice-dim mt-4">
                Discord&apos;s scheduled events have an <strong>Interested</strong> button and nothing after it.
                You can see who said they would come. You cannot see who joined the voice channel, who turned up
                half an hour late, or who never came at all - and for raids, scrims, classes, rehearsals and
                community nights, that is the list that matters. <strong>Events</strong>, a free part of
                VoiceChannels, takes that attendance for you, from voice, without anybody typing a command.
            </p>

            <h2 className="text-h4 mt-12 mb-4">Interested is a promise, not attendance</h2>

            <p className="text-vc-ice-dim">
                The bot reads each event&apos;s Interested list as the roster - the people you are expecting - and
                treats joining the event&apos;s voice channel as checking in. There is no reaction to press and no
                command to remember: being in voice is being there. Anybody can still come without pressing
                Interested, and they are counted too.
            </p>

            <h2 className="text-h4 mt-12 mb-4">What the attendance says</h2>

            <div className="overflow-x-auto mb-6">
                <table className="vc-table">
                    <thead>
                        <tr>
                            <th>On the attendance</th>
                            <th>Means</th>
                        </tr>
                    </thead>
                    <tbody>
                        { ATTENDANCE_KINDS.map( ( row ) => (
                            <tr key={ row.label }>
                                <td className="whitespace-nowrap">{ row.label }</td>
                                <td>{ row.meaning }</td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <p className="text-vc-ice-dim">
                Beside each name is the time spent in the event&apos;s voice channel, in hours and minutes, added up
                over every visit - somebody whose connection dropped twice is counted once, with the total.
            </p>

            <div className="discord-chat-container m-0 mb-6">
                <DiscordUIComponentMessage
                    author="VoiceChannels"
                    avatar={ VertixAvatar }
                    timestamp="Today at 11:15 PM"
                    componentName="VertixBot/UI-General/EventBoardComponent"
                    variables={ EVENT_ATTENDANCE_VARIABLES }
                    elementOverrides={ { "VertixBot/UI-General/EventJoinVoiceButton": { disabled: true } } }
                />
            </div>

            <h2 className="text-h4 mt-12 mb-4">Set it up in two steps</h2>

            <ol className="text-vc-ice-dim">
                <li className="mb-2">
                    Run <code>/setup</code> in your server and press <strong>📅 Events</strong> - or open{ " " }
                    <strong>Events</strong> on the{ " " }
                    <a href={ `${ DASHBOARD_URL }/events` } target="_blank" rel="noreferrer">dashboard</a>.
                </li>
                <li>
                    Pick the text channel the boards go to, then press <strong>Turn on</strong>. The bot needs View
                    Channel, Send Messages and Embed Links there, and View Channel on each event&apos;s voice channel
                    so it can see who is in it.
                </li>
            </ol>

            <p className="text-vc-ice-dim">
                Then schedule events the way you already do: <strong>Create Event</strong>, with a voice or stage
                channel as the location. Nobody has to press Start - the bot goes by the scheduled time. The{ " " }
                <RouterLink to="/posts/event-check-in">event check-in guide</RouterLink> shows each screen.
            </p>

            <h2 className="text-h4 mt-12 mb-4">What happens on the night</h2>

            <ol className="text-vc-ice-dim">
                <li className="mb-2">
                    <strong className="text-vc-ice">
                        { EVENTS_DEFAULTS.checkInLeadMinutes } minutes before the start
                    </strong> - or at once, if somebody starts the event early - the check-in board goes up in your
                    Events channel, listing everybody on the Interested list as not here yet. As each of them joins
                    the voice channel, the board moves them to <em>Here</em>.
                </li>
                <li className="mb-2">
                    <strong className="text-vc-ice">
                        { EVENTS_DEFAULTS.lateAfterMinutes } minutes after the start
                    </strong>, check-in closes. Everybody on the list who has not come is marked, and a &ldquo;need a
                    sub&rdquo; post asks for as many people as are missing.
                </li>
                <li className="mb-2">
                    <strong className="text-vc-ice">Anyone from the list who turns up after that</strong> is marked
                    late, not missing.
                </li>
                <li>
                    <strong className="text-vc-ice">Once everybody has left</strong> and the channel has stayed empty
                    for { EVENTS_DEFAULTS.endAfterEmptyMinutes } minutes - sooner, if Discord has ended the event or
                    its scheduled end has passed - the board is edited into the attendance. An event that never
                    empties is closed { EVENTS_DEFAULTS.maxDurationHours } hours after its start.
                </li>
            </ol>

            <p className="text-vc-ice-dim">
                Every one of those times is a setting; the numbers above are what a server gets until it changes
                them.
            </p>

            <h2 className="text-h4 mt-12 mb-4">Keep a record you can look back on</h2>

            <ul className="text-vc-ice-dim">
                <li className="mb-2">
                    The board itself becomes the attendance - one message per event, edited in place rather than a
                    stream of posts.
                </li>
                <li className="mb-2">
                    Pick a channel for an attendance copy on the dashboard - a staff-only channel, say - and every
                    finished attendance is posted there as well.
                </li>
                <li className="mb-2">
                    The dashboard&apos;s Events page keeps the history: each event with how many came, were late,
                    did not come or walked in. Open one to see every member by name, with their time in voice.
                </li>
                <li>A recurring event gets its own board and its own attendance every time it comes round.</li>
            </ul>

            <h2 className="text-h4 mt-12 mb-4">Tune it to how your server runs events</h2>

            <p className="text-vc-ice-dim">
                <code>/setup</code> keeps to the essentials: the channel, on or off, and whether to post for subs.
                Everything below is on the dashboard&apos;s Events page, which also walks through an evening in
                your own timing.
            </p>

            <div className="overflow-x-auto mb-6">
                <table className="vc-table">
                    <thead>
                        <tr>
                            <th>Setting</th>
                            <th>Default</th>
                            <th>When to change it</th>
                        </tr>
                    </thead>
                    <tbody>
                        { SETTINGS.map( ( row ) => (
                            <tr key={ row.setting }>
                                <td>{ row.setting }</td>
                                <td>{ row.byDefault }</td>
                                <td>{ row.change }</td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <h2 className="text-h4 mt-12 mb-4">Big events: hold it at a generator or a pool</h2>

            <p className="text-vc-ice-dim">
                Set an event&apos;s location to a VoiceChannels{ " " }
                <RouterLink to="/posts/join-to-create">Join to Create generator</RouterLink>, or to an{ " " }
                <RouterLink to="/posts/numbered-voice-channels">auto-scaling pool</RouterLink>, and every room it opens
                during the event counts as the event&apos;s. Joining is the check-in, and time in any of those rooms
                adds up - so a raid can split into squads, each in a room of its own, without anybody falling off
                the attendance.
            </p>

            <h2 className="text-h4 mt-12 mb-4">No board? Check these</h2>

            <ul className="text-vc-ice-dim">
                <li>Events is turned on, with a channel picked.</li>
                <li>
                    The event&apos;s location is a voice or stage channel - an event held anywhere else has nothing to
                    check in to.
                </li>
                <li>The bot can see that voice channel.</li>
                <li>If you limited Events to some channels, the event is held in one of them.</li>
                <li>
                    Its check-in had not closed when Events was turned on - an event already past that point is
                    skipped.
                </li>
            </ul>

            <p className="text-vc-ice-dim mb-0">
                When something stops Events, the Events screen says what. Every timing, permission and message in
                full is on the <RouterLink to="/features/events">Events feature page</RouterLink>.
            </p>

            <div className="p-6 mt-12 bg-vc-space rounded border border-vc-hairline-bright text-center">
                <h2 className="text-h5 mb-3">Take attendance at your next event</h2>
                <p className="text-vc-ice-dim mb-6">
                    Events is free on every server, and it takes two steps to set up.
                </p>
                <a href="/invite-vertix?src=site-post"
                    className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                    Add to Discord
                </a>
            </div>
        </div>
    );
}
