import { DiscordCommandSuggestion } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.png";

import JoinToCreateWalkthrough from "@vertix.gg/website/src/vertix/posts/join-to-create-walkthrough";

export default function JoinToCreate() {
    return (
        <div className="vc-container vc-page-panel">
            <h1 className="text-h4">Join to Create voice channels in Discord</h1>

            <p className="text-vc-ice-dim mt-4">
                One channel hands out the rest. Somebody joins it, gets a room of their own, and
                the room disappears when they leave.
            </p>

            <h2 className="text-h5 mt-10 mb-3">Walk it yourself</h2>

            <p className="text-vc-ice-dim mb-6">
                One channel is the whole setup. Press it below and watch the list answer &mdash;
                the room it hands back is yours, and it is gone again the moment you leave.
            </p>

            <JoinToCreateWalkthrough/>

            <p className="text-vc-ice-dim">
                The panel that appears is the real one, and every button on it goes somewhere
                &mdash; press one to read what it does. Any of them can be{ " " }
                <a href="/posts/enable-features">switched off per server</a>, and the set can
                differ by role, so members get the controls you want them to have and nothing else.
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

            <div className="p-6 mt-10 bg-vc-space rounded border border-vc-hairline-bright text-center">
                <h2 className="text-h5 mb-3">Try it on your server</h2>
                <p className="text-vc-ice-dim mb-6">
                    Two generators free, and set up with one command.
                </p>
                <a href="/invite-vertix"
                    className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                    Add to Discord
                </a>
            </div>
        </div>
    );
}
