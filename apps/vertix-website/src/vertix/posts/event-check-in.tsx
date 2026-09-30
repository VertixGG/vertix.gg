import { DiscordUIComponentMessage, DiscordCommandSuggestion } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import {
    EVENT_BOARD_CHECK_IN_VARIABLES,
    EVENTS_SCREEN_VARIABLES
} from "@vertix.gg/website/src/vertix/shared/events-data";

import { SETUP_EMPTY_VARIABLES } from "@vertix.gg/website/src/vertix/components/discord/preview-variables";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

export default function EventCheckIn() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">How to set up event check-in</h1>
            <br />
            <p className="text-h5">
                <b>Events</b> takes attendance for your server&apos;s scheduled events off voice: whoever marked themselves
                Interested checks in by joining the event&apos;s voice channel, the missing are marked, a post asks for
                subs, and the check-in board ends as the attendance. Setting it up takes two steps, and it is free.
                Everything it does is explained on the <RouterLink to="/features/events">Events</RouterLink> page.
            </p>

            <ol className="text-h5">
                <li>
                    Type <code>/setup</code> in any channel and press <b>📅 Events</b>.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
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
                    <br />
                    Or open it directly with <code>/manage events</code>:
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0 box-normalize">
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
                    <br />
                </li>
                <li>
                    Pick the channel the boards and posts go to, then press <b>Turn on</b>. The bot needs View Channel,
                    Send Messages and Embed Links there, and says which it is missing if it cannot post.
                    <br />
                    <br />
                    <div className="discord-chat-container vc-frame-box m-0">
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
                    <br />
                </li>
                <li>
                    Schedule events the way you always have - <b>Create Event</b> in Discord, with a voice or stage channel
                    as the location. Members press <b>Interested</b> to go on the roster, and nobody has to press
                    <b> Start</b>: the clock is the scheduled time.
                    <br />
                    <br />
                </li>
            </ol>

            <h2 className="text-h4">What happens next</h2>
            <ul className="text-h5">
                <li><b>15 minutes before</b> the start, the check-in board goes up in your Events channel.</li>
                <li><b>10 minutes after</b>, whoever has not come is marked, and a post asks for as many subs as are missing.</li>
                <li><b>When everyone has left</b>, the board turns into the attendance, with each member&apos;s time in voice.</li>
            </ul>

            <div className="discord-chat-container vc-frame-box m-0">
                <DiscordUIComponentMessage
                    author="VoiceChannels"
                    avatar={ VertixAvatar }
                    timestamp="Today at 8:45 PM"
                    componentName="VertixBot/UI-General/EventBoardComponent"
                    variables={ EVENT_BOARD_CHECK_IN_VARIABLES }
                />
            </div>
            <br />
            <p className="text-h5">
                The sub post, the attendance, events held at a generator, timings and troubleshooting are all on the{ " " }
                <RouterLink to="/features/events">Events</RouterLink> page.
            </p>
        </div>
    );
}
