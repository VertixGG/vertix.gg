import { DiscordChannelList, DiscordCommandSuggestion } from "@vertix.gg/discord-ui";

import { BILLING_FREE_MAX_MASTER_CHANNELS } from "@vertix.gg/definitions/src/billing-definitions";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";

import {
    DEMO_CHANNEL_NAME,
    DEMO_MEMBERS,
    DEMO_OWNER
} from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

import type { DiscordChannelListItem } from "@vertix.gg/discord-ui";

const GENERATOR: DiscordChannelListItem = { id: "generator", name: "＋ New Channel" };

const ROOM: DiscordChannelListItem = {
    id: "room",
    name: DEMO_CHANNEL_NAME,
    userCount: 2,
    maxUsers: 5,
    users: [ DEMO_MEMBERS.owner, DEMO_MEMBERS.alex ]
};

const PRIVACY_VIEWS: { state: string, caption: string, channels: DiscordChannelListItem[] }[] = [
    {
        state: "🌐 Public",
        caption: "Listed, and anyone can walk in.",
        channels: [ GENERATOR, ROOM ]
    },
    {
        state: "🚫 Private",
        caption: "Still listed, behind a padlock. Only trusted members get in.",
        channels: [ GENERATOR, { ...ROOM, locked: true } ]
    },
    {
        state: "🙈 Hidden",
        caption: "Gone from the list for everyone who is not trusted.",
        channels: [ GENERATOR ]
    }
];

const PRIVACY_STATES = [
    { state: "🌐 Public", sees: "Everyone", joins: "Everyone" },
    { state: "🚫 Private", sees: "Everyone", joins: "Trusted members only" },
    { state: "🙈 Hidden", sees: "Trusted members only", joins: "Trusted members only" }
];

const PANEL_CONTROLS = [
    {
        group: "Who gets in",
        controls: [
            {
                name: "Privacy",
                body: "Public, private or hidden, as above."
            },
            {
                name: "Access",
                body: "Trust members so they can get past the lock, block members so they never can, or kick "
                    + "somebody who is already inside."
            },
            {
                name: "Invite",
                body: "Let one member in, whatever the room is set to. They are told where to find it, so a "
                    + "private room needs no explaining."
            },
            {
                name: "User limit",
                body: "Cap how many people fit, so a room for four stays a room for four."
            },
            {
                name: "Knock",
                body: "The other side of the door. Somebody outside asks to be let in, the owner answers yes "
                    + "or no, and a request nobody answers expires on its own."
            }
        ]
    },
    {
        group: "The room itself",
        controls: [
            { name: "Rename", body: "Call the room whatever the evening is about." },
            { name: "Region and bitrate", body: "Pick the voice region and the audio quality." },
            { name: "Templates", body: "Save the room's setup and apply it again another night." },
            { name: "Clear chat", body: "Wipe the room's text chat." },
            { name: "Reset", body: "Put the room back the way the generator made it." },
            { name: "LFM", body: "Post a looking-for-members note while the room still has seats." }
        ]
    },
    {
        group: "When the owner leaves",
        controls: [
            { name: "Transfer", body: "Hand the room to another member before walking out." },
            {
                name: "Claim",
                body: "Take over a room whose owner has left. When several people want it, a short vote decides."
            }
        ]
    }
];

export default function PrivateVoiceChannels() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">Private voice channels your members lock, hide and limit themselves</h1>

            <p className="text-lg text-vc-ice-dim mt-4">
                A permanent private channel costs you a role, a stack of permission overwrites and a moderator
                who answers every &ldquo;can I come in?&rdquo;. A temporary one costs nothing: whoever opens the
                room owns it, decides who gets in, and the room - permissions and all - is gone when the last
                person leaves.
            </p>

            <h2 className="text-h4 mt-12 mb-4">How a member gets a room of their own</h2>

            <p className="text-vc-ice-dim">
                VoiceChannels works on Join to Create. Your server keeps one generator channel. When a member
                joins it, the bot creates a voice channel for them, moves them in, and puts a button panel for
                its owner in the room&apos;s text chat. When the last person leaves, the room is removed. The{ " " }
                <RouterLink to="/posts/join-to-create">Join to Create walkthrough</RouterLink> lets you try it on
                the page.
            </p>

            <p className="text-vc-ice-dim">
                Privacy is where this earns its keep. Nobody has to ask a moderator to lock a door, because the
                person who opened the room already holds the key.
            </p>

            <h2 className="text-h4 mt-12 mb-4">The three privacy states</h2>

            <p className="text-vc-ice-dim">
                The <strong>Privacy</strong> button is one menu with three answers. Each one decides what everybody
                else sees in the channel list, and whether they can get in:
            </p>

            <div className="overflow-x-auto mb-6">
                <table className="vc-table">
                    <thead>
                        <tr>
                            <th>State</th>
                            <th>Who sees the room</th>
                            <th>Who can join</th>
                        </tr>
                    </thead>
                    <tbody>
                        { PRIVACY_STATES.map( ( row ) => (
                            <tr key={ row.state }>
                                <td>{ row.state }</td>
                                <td>{ row.sees }</td>
                                <td>{ row.joins }</td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
                { PRIVACY_VIEWS.map( ( view ) => (
                    <div key={ view.state } className="col-span-12 md:col-span-4">
                        <p className="text-h6 text-vc-ice mb-1">{ view.state }</p>
                        <p className="text-fine text-vc-ice-dim mb-2">{ view.caption }</p>
                        <DiscordChannelList title="༄ Dynamic Channels" channels={ view.channels }/>
                    </div>
                ) ) }
            </div>

            <p className="text-vc-ice-dim">
                Trusted members are the ones the owner lets in - from <strong>Access</strong>, with{ " " }
                <strong>Invite</strong>, or by answering a knock. Blocked members cannot join in any state, not
                even a public one.
            </p>

            <h2 className="text-h4 mt-12 mb-4">Everything on the room&apos;s panel</h2>

            <p className="text-vc-ice-dim">
                Privacy is one button among several. All of them sit on the room&apos;s panel, and every one of
                them is free:
            </p>

            { PANEL_CONTROLS.map( ( section ) => (
                <section key={ section.group } className="mb-6">
                    <h3 className="text-h5 text-vc-cyan mb-3">{ section.group }</h3>

                    <ul className="text-vc-ice-dim mb-0">
                        { section.controls.map( ( control ) => (
                            <li key={ control.name }>
                                <strong className="text-vc-ice">{ control.name }</strong> - { control.body }
                            </li>
                        ) ) }
                    </ul>
                </section>
            ) ) }

            <h2 className="text-h4 mt-12 mb-4">Set it up for your server</h2>

            <ol className="text-vc-ice-dim">
                <li className="mb-4">
                    <strong className="text-vc-ice">Create a generator.</strong> Add the bot, run{ " " }
                    <code>/setup</code> and create a <strong>Dynamic Channel (V3)</strong> - the current
                    interface. The <RouterLink to="/posts/how-to-setup">setup guide</RouterLink> walks through
                    each screen.

                    <div className="mt-4">
                        <DiscordCommandSuggestion
                            searchTerm="/setup"
                            items={ [ {
                                command: "/setup",
                                description: "Set up and configure VoiceChannels for this server.",
                                botName: "VoiceChannels",
                                botAvatar: VertixAvatar
                            } ] }
                        />
                    </div>
                </li>
                <li className="mb-4">
                    <strong className="text-vc-ice">Choose the buttons.</strong> Any control above can be switched
                    off for a generator, and a role can be given a set of its own - so privacy can be something
                    only some members get. <RouterLink to="/posts/enable-features">How to enable features</RouterLink>{ " " }
                    shows the screen.
                </li>
                <li className="mb-4">
                    <strong className="text-vc-ice">Decide how new rooms start.</strong> On the{ " " }
                    <a href={ DASHBOARD_URL } target="_blank" rel="noreferrer">dashboard</a>, open{ " " }
                    <strong>Generators</strong>, pick the generator and press <strong>Edit</strong> beside{ " " }
                    <strong>Configuration</strong>. <strong>New channel privacy</strong> makes every room start
                    public, private or hidden, and <strong>New channel user limit</strong> gives it a starting cap.
                    Owners change either from the panel as usual.
                </li>
                <li className="mb-4">
                    <strong className="text-vc-ice">Keep your moderators in.</strong> <strong>Staff roles</strong>,
                    on the same screen, are roles a private or hidden room can never shut out - and an owner
                    cannot block or kick a member who holds one.
                </li>
                <li>
                    <strong className="text-vc-ice">Remember each owner&apos;s choices.</strong> Switch on{ " " }
                    <strong>Auto-save settings</strong> and a returning owner&apos;s room comes back the way they
                    left it: its name, limit, privacy, region and bitrate, and who was trusted or blocked.
                </li>
            </ol>

            <p className="text-vc-ice-dim">
                The dashboard&apos;s interface editor rewords every screen the bot shows - the room&apos;s panel
                included - in any of its seven languages, if the defaults do not sound like your server.
            </p>

            <h2 className="text-h4 mt-12 mb-4">A private room, start to finish</h2>

            <ol className="text-vc-ice-dim">
                <li>
                    { DEMO_OWNER } joins the generator and lands in <strong>{ DEMO_CHANNEL_NAME }</strong>, with
                    the panel waiting in its chat.
                </li>
                <li>
                    They set <strong>Privacy</strong> to Private and trust { DEMO_MEMBERS.alex.username } and{ " " }
                    { DEMO_MEMBERS.jordan.username } from <strong>Access</strong>. Everybody can still see the room;
                    only those two can join.
                </li>
                <li>
                    { DEMO_MEMBERS.mia.username } knocks. { DEMO_OWNER } presses yes, which lets her in the same way
                    Access would, and the bot tells { DEMO_MEMBERS.mia.username } the answer either way.
                </li>
                <li>
                    Somebody trusted earlier turns out to be trouble: <strong>Kick</strong> takes them out of the
                    room and <strong>Block</strong> keeps them out.
                </li>
                <li>
                    { DEMO_OWNER } has to go, and <strong>Transfers</strong> the room to{ " " }
                    { DEMO_MEMBERS.alex.username }. Had they simply left, the room would not be stuck: once its
                    owner has been gone a while, the people still inside can <strong>Claim</strong> it.
                </li>
                <li>
                    The last person leaves, and the room is deleted along with every permission it carried.
                    Nothing is left for a moderator to tidy.
                </li>
            </ol>

            <h2 className="text-h4 mt-12 mb-4">Moderation without micromanaging</h2>

            <ul className="text-vc-ice-dim">
                <li>Staff roles are never locked out, so a moderator can always step in.</li>
                <li>A rename that contains a word from your server&apos;s bad-word list is refused.</li>
                <li>
                    A <RouterLink to="/posts/how-to-setup-logs-channel">logs channel</RouterLink> per generator
                    writes down rooms being created, renamed and claimed.
                </li>
                <li>Rooms disappear when they empty, so there are no stale overwrites to clean up next week.</li>
            </ul>

            <p className="text-vc-ice-dim mb-0">
                Would shared rooms that nobody owns suit you better? Then you want{ " " }
                <RouterLink to="/posts/numbered-voice-channels">numbered voice channels</RouterLink> from an
                auto-scaling pool instead. And if the room is for a scheduled event, Events can{ " " }
                <RouterLink to="/posts/event-attendance">take attendance</RouterLink> while you play.
            </p>

            <div className="p-6 mt-12 bg-vc-space rounded border border-vc-hairline-bright text-center">
                <h2 className="text-h5 mb-3">Give your members rooms of their own</h2>
                <p className="text-vc-ice-dim mb-6">
                    Every room control is free, with { BILLING_FREE_MAX_MASTER_CHANNELS } generators.
                </p>
                <a href="/invite-vertix?src=site-post"
                    className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                    Add to Discord
                </a>
            </div>
        </div>
    );
}
