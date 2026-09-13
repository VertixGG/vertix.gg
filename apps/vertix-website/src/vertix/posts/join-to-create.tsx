import { DiscordChannelList, DiscordCommandSuggestion } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.png";

import DiscordDynamicChannelV3 from "@vertix.gg/website/src/vertix/components/discord/discord-dynamic-channel-v3";

import type { DiscordChannelListItem } from "@vertix.gg/discord-ui";

const GENERATOR_ONLY: DiscordChannelListItem[] = [
    { id: "gen", name: "➕ New Channel" },
];

const AFTER_JOINING: DiscordChannelListItem[] = [
    { id: "gen", name: "➕ New Channel" },
    {
        id: "leo",
        name: "🟢 Leo's Channel",
        active: true,
        userCount: 2,
        maxUsers: 5,
        users: [
            { id: "1", username: "Leo", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" },
            { id: "2", username: "Jordan", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" },
        ],
    },
    {
        id: "sam",
        name: "🔴 Sam's Channel",
        locked: true,
        userCount: 1,
        maxUsers: 2,
        users: [
            { id: "3", username: "Sam", avatar: "https://cdn.discordapp.com/embed/avatars/2.png" },
        ],
    },
];

export default function JoinToCreate() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-h4">Join to Create voice channels in Discord</h1>

            <p className="text-vc-ice-dim mt-4">
                One channel hands out the rest. Somebody joins it, gets a room of their own, and
                the room disappears when they leave.
            </p>

            <h2 className="text-h5 mt-10 mb-3">You keep one channel</h2>

            <p className="text-vc-ice-dim mb-6">
                Call it whatever you like. Nobody talks in it - joining is the whole point.
            </p>

            <DiscordChannelList
                title="Voice Channels"
                channels={ GENERATOR_ONLY }
            />

            <h2 className="text-h5 mt-12 mb-3">Joining it makes a room</h2>

            <p className="text-vc-ice-dim mb-6">
                Leo joined and was moved straight into a channel named after him. Sam did the same
                and locked hers. Neither asked a moderator, and the generator is still sitting
                there waiting for the next person.
            </p>

            <DiscordChannelList
                title="Voice Channels"
                channels={ AFTER_JOINING }
            />

            <p className="text-vc-ice-dim mt-6">
                When the last person leaves a room, it is deleted. The list only ever shows
                channels somebody is actually in.
            </p>

            <h2 className="text-h5 mt-12 mb-3">Whoever made it, controls it</h2>

            <p className="text-vc-ice-dim mb-6">
                The owner gets this panel inside their own channel. No role, no commands.
            </p>

            <div className="vc-landing-chat mb-6 hidden justify-center lg:flex">
                <DiscordDynamicChannelV3/>
            </div>

            <p className="text-vc-ice-dim">
                Rename it, cap how many can join, allow or block individual members, switch it
                between public, private and hidden, move it to another voice region, or hand it to
                somebody else. Every button can be{ " " }
                <a href="/posts/enable-features">switched off per server</a> if you would rather
                members did not have it.
            </p>

            <h2 className="text-h5 mt-12 mb-3">Setting it up</h2>

            <p className="text-vc-ice-dim mb-6">
                Add the bot and run <code>/setup</code>. Pick the channel that should do the
                handing out, and that is it.
            </p>

            <DiscordCommandSuggestion
                searchTerm="/setup"
                items={ [ {
                    command: "/setup",
                    description: "Displaying VoiceChannels setup wizard in ephemeral mode.",
                    botName: "VoiceChannels",
                    botAvatar: VertixAvatar,
                } ] }
            />

            <p className="text-vc-ice-dim mt-6 mb-0">
                The step-by-step version is in the{ " " }
                <a href="/posts/how-to-setup">setup guide</a>. Afterwards, name the generated
                channels with{ " " }
                <a href="/posts/channel-name-placeholders">placeholders</a>, and if people start
                waiting for a free room, turn on{ " " }
                <a href="/features/auto-scaling">auto-scaling</a>.
            </p>
        </div>
    );
}
