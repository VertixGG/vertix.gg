import { DiscordChannelWizard, DiscordCommandSuggestion, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";

import {
    EVENT_ATTENDANCE_VARIABLES,
    EVENT_BOARD_CHECK_IN_VARIABLES,
    EVENT_NEED_SUB_VARIABLES,
    EVENTS_SCREEN_VARIABLES,
    EVENTS_WIZARD_STEPS
} from "@vertix.gg/website/src/vertix/shared/events-data";

import { SETUP_EMPTY_VARIABLES } from "@vertix.gg/website/src/vertix/components/discord/preview-variables";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

const CARD = "p-4 bg-vc-space rounded border border-vc-hairline-bright h-full";

export default function EventsPage() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">Events</h1>

            { /* Overview */ }
            <section className="mb-12">
                <p className="text-lg text-vc-ice-dim">
                    Discord lets members mark themselves <strong>Interested</strong> in a scheduled event, but never tells
                    you who actually came. Events takes attendance off voice: a check-in board goes up before the event,
                    joining its voice channel is the check-in, whoever said they would come and did not is marked, a post
                    asks for somebody to take their place, and the board ends as the attendance. It is free.
                </p>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-azure-soft">Check-in board</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Who is here and who is not yet, from 15 minutes before.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-cyan">No-shows</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Marked 10 minutes after the start, and cleared if they come late.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-mint">Need a sub</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">A post asking for as many as are missing, counting down.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-starlight">Attendance</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Who came, who was late, who walked in - with their time in voice.</p>
                        </div>
                    </div>
                </div>
            </section>

            { /* How It Works */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">How It Works</h2>
                <p className="text-vc-ice-dim">
                    One evening of a four-person event: Maya, Leo, Sam and Noa marked themselves Interested.
                </p>
                <DiscordChannelWizard
                    steps={ EVENTS_WIZARD_STEPS }
                    autoPlay={ true }
                    autoPlayInterval={ 4000 }
                    showStepIndicators={ true }
                    showNavigation={ true }
                    pauseOnHover={ true }
                />
            </section>

            <hr />

            { /* Setup */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Setup</h2>
                <p className="text-vc-ice-dim mb-6">
                    Events is set up by a server admin once, and then runs on every scheduled event held in a voice or
                    stage channel. For a click-by-click version, see{ " " }
                    <RouterLink to="/posts/event-check-in">How to set up event check-in</RouterLink>.
                </p>

                <h3 className="text-h5 text-vc-cyan mb-4">Step 1: Open the Events screen</h3>
                <p className="text-vc-ice-dim mb-4">
                    Run <code>/setup</code> and press <strong>📅 Events</strong> - or go straight there with{ " " }
                    <code>/manage events</code>.
                </p>
                <div className="discord-chat-container m-0 mb-6">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 8:30 PM"
                        componentName="VertixBot/UI-General/SetupComponent"
                        variables={ SETUP_EMPTY_VARIABLES }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-General/EventsChooseButton": { highlighted: true }
                        } }
                    />
                </div>
                <div className="discord-chat-container m-0 mb-6 box-normalize">
                    <DiscordCommandSuggestion
                        searchTerm="/manage events"
                        items={ [
                            {
                                command: "/manage events",
                                description: "Check-ins, no-shows and attendance for this server's scheduled events.",
                                botName: "VoiceChannels",
                                botAvatar: VertixAvatar
                            }
                        ] }
                    />
                </div>

                <h3 className="text-h5 text-vc-cyan mb-4">Step 2: Pick a channel, then turn it on</h3>
                <p className="text-vc-ice-dim mb-4">
                    Pick the text channel the boards and posts go to. <strong>Turn on</strong> stays greyed out until a
                    channel is picked, and a channel the bot cannot post in is refused with the permissions it is missing.
                    <strong> Stop sub posts</strong> keeps the board and the attendance but never asks for subs.
                </p>
                <div className="discord-chat-container m-0 mb-6">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 8:31 PM"
                        componentName="VertixBot/UI-General/EventsComponent"
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/manage events"
                        variables={ EVENTS_SCREEN_VARIABLES }
                        elementOverrides={ {
                            "VertixBot/UI-General/EventsEnableButton": { label: "Turn off" },
                            "VertixBot/UI-General/EventsSubPostsButton": { label: "Stop sub posts" }
                        } }
                    />
                </div>

                <h3 className="text-h5 text-vc-cyan mb-4">Step 3: Schedule an event as usual</h3>
                <p className="text-vc-ice-dim mb-0">
                    Create the event in Discord the way you always would - <strong>Create Event</strong>, location a voice
                    or stage channel, a start time. Nothing about the event has to change, and nobody has to press
                    <strong> Start</strong> on it: the clock is the time it was scheduled for.
                </p>
            </section>

            <hr />

            { /* Members */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">What Members Do</h2>
                <ol className="text-vc-ice-dim">
                    <li>Press <strong>Interested</strong> on the event - that puts them on the roster.</li>
                    <li>Join the event&apos;s voice channel when it is time - that is the check-in. There is no command to type.</li>
                </ol>
                <p className="text-vc-ice-dim mb-0">
                    Anybody can come without pressing Interested; they are counted as having walked in.
                </p>
            </section>

            <hr />

            { /* The Board */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">The Check-in Board</h2>
                <p className="text-vc-ice-dim mb-4">
                    Fifteen minutes before the start - or at once, if someone starts the event early - the board goes up in
                    your Events channel. It follows the Interested list until the start, and moves members to{ " " }
                    <strong>Here</strong> within seconds of them joining. Names on it are never pinged.
                </p>
                <div className="discord-chat-container m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 8:45 PM"
                        componentName="VertixBot/UI-General/EventBoardComponent"
                        variables={ EVENT_BOARD_CHECK_IN_VARIABLES }
                    />
                </div>
            </section>

            { /* Subs */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">No-shows and the &quot;Need a Sub&quot; Post</h2>
                <p className="text-vc-ice-dim mb-4">
                    Ten minutes after the start the roster closes. Everybody on it who has not come is marked, and the bot
                    posts for as many people as are missing - never more than a voice channel with a user limit still has
                    room for. Each arrival counts it down, it says so when every place is taken, and it comes down when the
                    event ends. Its button opens the voice channel.
                </p>
                <div className="discord-chat-container m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:10 PM"
                        componentName="VertixBot/UI-General/EventNeedSubComponent"
                        variables={ EVENT_NEED_SUB_VARIABLES }
                    />
                </div>
            </section>

            { /* Attendance */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">The Attendance</h2>
                <p className="text-vc-ice-dim mb-4">
                    When the event is over, the board is edited into the attendance, longest time first:
                </p>
                <ul className="text-vc-ice-dim mb-4">
                    <li><strong>Came</strong> - on the roster, and here by the time it closed.</li>
                    <li><strong>Late</strong> - on the roster, and came only after it closed.</li>
                    <li><strong>Didn&apos;t come</strong> - on the roster, and never came.</li>
                    <li><strong>Walked in</strong> - came without pressing Interested.</li>
                </ul>
                <p className="text-vc-ice-dim mb-4">
                    Times are hours:minutes spent in the event&apos;s voice channels, over every visit.
                </p>
                <div className="discord-chat-container m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 11:15 PM"
                        componentName="VertixBot/UI-General/EventBoardComponent"
                        variables={ EVENT_ATTENDANCE_VARIABLES }
                        elementOverrides={ { "VertixBot/UI-General/EventJoinVoiceButton": { disabled: true } } }
                    />
                </div>
            </section>

            <hr />

            { /* Generators */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Events at a Generator or a Pool</h2>
                <p className="text-vc-ice-dim mb-4">
                    Set the event&apos;s location to a VoiceChannels generator and every room it opens during the event
                    counts as the event&apos;s: joining the generator is the check-in, and time in any of its rooms is
                    added up. The same goes for an <RouterLink to="/features/auto-scaling">auto-scaling</RouterLink> pool.
                </p>
                <p className="text-vc-ice-dim mb-0">
                    The board&apos;s <strong>Join voice</strong> button then points at the fullest room that still has a
                    free seat - joining the generator itself would open an empty room of your own.
                </p>
            </section>

            <hr />

            { /* Dashboard */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">On the Dashboard</h2>
                <p className="text-vc-ice-dim mb-4">
                    The same settings are on the <a href={ `${ DASHBOARD_URL }/events` } target="_blank" rel="noreferrer">dashboard</a>{ " " }
                    under <strong>Events</strong>. Picking a channel there asks the bot first, so a channel it cannot
                    post in is refused with the permissions it is missing.
                </p>
                <p className="text-vc-ice-dim mb-0">
                    Next to them is the history: every event from the moment its check-in opened, with how many came,
                    were late, did not come or walked in. Open one to see each member by name, with their time in voice.
                </p>
            </section>

            <hr />

            { /* Timings */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Timings</h2>
                <div className="overflow-x-auto">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>When</th>
                                <th>What happens</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>15 minutes before the start</td>
                                <td>The check-in board goes up. Starting the event earlier puts it up at once.</td>
                            </tr>
                            <tr>
                                <td>10 minutes after the start</td>
                                <td>The roster closes, the missing are marked and the sub post goes up.</td>
                            </tr>
                            <tr>
                                <td>After that</td>
                                <td>
                                    It ends once its voice channels are empty and Discord has ended the event, or the scheduled
                                    end has passed, or they have stayed empty for 10 minutes.
                                </td>
                            </tr>
                            <tr>
                                <td>12 hours after the start</td>
                                <td>It ends, whoever is still in voice.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-vc-ice-dim mt-4 mb-0">
                    Canceled or deleted before its start, the board says so and no attendance is kept. Moved to another time,
                    the board says where it went and a new one goes up before then. A recurring event gets a board for
                    each occurrence.
                </p>
            </section>

            { /* Permissions */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Permissions</h2>
                <div className="overflow-x-auto">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Where</th>
                                <th>The bot needs</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>The Events channel</td>
                                <td>View Channel, Send Messages, Embed Links</td>
                            </tr>
                            <tr>
                                <td>The event&apos;s voice channel</td>
                                <td>View Channel - to read the roster and see who is in it</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <hr />

            { /* Troubleshooting */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Troubleshooting</h2>
                <p className="text-vc-ice-dim">
                    When something stops Events, the Events screen says what, under the settings:
                </p>
                <ul className="text-vc-ice-dim">
                    <li><strong>The channel it posts in is gone</strong> - pick another channel.</li>
                    <li>
                        <strong>The bot cannot post in that channel</strong> - give it View Channel, Send Messages and
                        Embed Links there.
                    </li>
                    <li>
                        <strong>The bot could not see an event&apos;s voice channel</strong> - give it View Channel on
                        that channel. It skips such an event rather than saying nobody came.
                    </li>
                </ul>
                <p className="text-vc-ice-dim">No board at all? Check that:</p>
                <ul className="text-vc-ice-dim mb-0">
                    <li>Events is on, with a channel picked.</li>
                    <li>The event&apos;s location is a voice or stage channel - an event somewhere else has nothing to check in to.</li>
                    <li>It is within 15 minutes of the start. Events turned on more than 10 minutes into an event skips that one.</li>
                    <li>A board somebody deleted is not posted again.</li>
                </ul>
            </section>

            { /* FAQ */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Questions</h2>

                <h3 className="text-h5">Does it ping anyone?</h3>
                <p className="text-vc-ice-dim">No. Names on the board and the sub post are shown, never pinged.</p>

                <h3 className="text-h5">Does it cost anything?</h3>
                <p className="text-vc-ice-dim">No - Events is free on every server.</p>

                <h3 className="text-h5">What is kept?</h3>
                <p className="text-vc-ice-dim mb-0">
                    Who marked themselves Interested in each event, when they joined its voice channels and for how long -
                    what the attendance is made of. See the <RouterLink to="/privacy-policy">privacy policy</RouterLink>.
                </p>
            </section>
        </div>
    );
}
