import { DiscordChannelDisplay, DiscordCommandSuggestion, DiscordInput, DiscordModal } from "@vertix.gg/discord-ui";

import { varsReplaceIndexPlaceholder } from "@vertix.gg/base/src/utils/vars-utils";

import { BILLING_FREE_MAX_MASTER_CHANNELS } from "@vertix.gg/definitions/src/billing-definitions";
import {
    VAR_DYNAMIC_CHANNEL_INDEX,
    VAR_DYNAMIC_CHANNEL_USER
} from "@vertix.gg/definitions/src/dynamic-channel-vars-definitions";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";
import { AUTO_SCALING_CONFIG } from "@vertix.gg/website/src/vertix/shared/auto-scaling-data";

import type { DiscordChannelListItem, DiscordChannelUser } from "@vertix.gg/discord-ui";

const POOL = {
    PREFIX: `Room-${ VAR_DYNAMIC_CHANNEL_INDEX }`,
    CAP: 3
} as const;

const PREFIX_EXAMPLE_ROOMS = 3;

const PREFIX_EXAMPLES = [ POOL.PREFIX, `Squad ${ VAR_DYNAMIC_CHANNEL_INDEX }`, "Lobby" ];

const PREFIX_IDEAS = [
    `Duo ${ VAR_DYNAMIC_CHANNEL_INDEX }`,
    `Study Room ${ VAR_DYNAMIC_CHANNEL_INDEX }`,
    `Ranked ${ VAR_DYNAMIC_CHANNEL_INDEX }`
];

function namePrefixRooms( prefix: string ): string {
    return Array.from( { length: PREFIX_EXAMPLE_ROOMS }, ( _, offset ) => varsReplaceIndexPlaceholder( prefix, offset + 1 ) )
        .join( ", " );
}

const ALEX = { id: "alex", username: "Alex", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" };
const JORDAN = { id: "jordan", username: "Jordan", avatar: "https://cdn.discordapp.com/embed/avatars/1.png" };
const SAM = { id: "sam", username: "Sam", avatar: "https://cdn.discordapp.com/embed/avatars/2.png" };
const MIA = { id: "mia", username: "Mia", avatar: "https://cdn.discordapp.com/embed/avatars/3.png" };
const NOA = { id: "noa", username: "Noa", avatar: "https://cdn.discordapp.com/embed/avatars/4.png" };
const KAI = { id: "kai", username: "Kai", avatar: "https://cdn.discordapp.com/embed/avatars/5.png" };
const LEO = { id: "leo", username: "Leo", avatar: "https://cdn.discordapp.com/embed/avatars/0.png" };

function poolRoom( index: number, users: DiscordChannelUser[] ): DiscordChannelListItem {
    return {
        id: `room-${ index }`,
        name: varsReplaceIndexPlaceholder( POOL.PREFIX, index ),
        active: users.length > 0,
        userCount: users.length,
        maxUsers: POOL.CAP,
        users
    };
}

const POOL_VIEWS = [
    {
        title: "Early evening",
        caption: "Alex is in, and Room-2 is already waiting for whoever comes next.",
        rooms: [ poolRoom( 1, [ ALEX ] ), poolRoom( 2, [] ) ]
    },
    {
        title: "Busy",
        caption: "Rooms filled in order, and there is still an empty one at the end.",
        rooms: [
            poolRoom( 1, [ ALEX, JORDAN, SAM ] ),
            poolRoom( 2, [ MIA, NOA, KAI ] ),
            poolRoom( 3, [ LEO ] ),
            poolRoom( 4, [] )
        ]
    }
];

const POOL_VS_JOIN_TO_CREATE = [
    {
        aspect: "Room names",
        joinToCreate: "From a template - usually the owner's name",
        pool: "Numbered from a prefix: Room-1, Room-2, Room-3"
    },
    {
        aspect: "Who runs a room",
        joinToCreate: "The member it was made for, from a button panel",
        pool: "Nobody - every room follows the pool's settings"
    },
    {
        aspect: "When a room opens",
        joinToCreate: "When somebody joins the generator",
        pool: "Before the free seats run out"
    },
    {
        aspect: "When a room closes",
        joinToCreate: "When its last member leaves",
        pool: "Spare empty rooms close, and one stays ready"
    },
    {
        aspect: "Member cap",
        joinToCreate: "Each owner sets their own",
        pool: "The same for every room"
    }
];

export default function NumberedVoiceChannels() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">Numbered voice channels that open and close themselves</h1>

            <p className="text-lg text-vc-ice-dim mt-4">
                Not every server wants a room per person. Sometimes what you want is a tidy row of numbered rooms
                - Room-1, Room-2, Room-3 - that is always exactly as long as the crowd. That is an auto-scaling
                pool: members join one entry channel, land in the first room with a free seat, and the bot opens
                the next room before the last one fills and closes the spares as people leave.
            </p>

            <div className="grid grid-cols-12 gap-6 my-8">
                { POOL_VIEWS.map( ( view ) => (
                    <div key={ view.title } className="col-span-12 md:col-span-6">
                        <p className="text-h6 text-vc-ice mb-1">{ view.title }</p>
                        <p className="text-fine text-vc-ice-dim mb-2">{ view.caption }</p>
                        <DiscordChannelDisplay
                            categoryName={ AUTO_SCALING_CONFIG.categoryName }
                            masterChannel={ { name: AUTO_SCALING_CONFIG.masterChannelName } }
                            scaledChannels={ view.rooms }
                        />
                    </div>
                ) ) }
            </div>

            <h2 className="text-h4 mt-12 mb-4">How a pool behaves</h2>

            <ul className="text-vc-ice-dim">
                <li className="mb-2">
                    <strong className="text-vc-ice">Joining.</strong> Somebody joins the entry channel and the bot
                    moves them into the oldest room that still has a free seat - Room-1 before Room-2 - so rooms
                    fill one at a time instead of everybody spreading thin. Members can also click straight into
                    any room with space; it is an ordinary voice channel.
                </li>
                <li className="mb-2">
                    <strong className="text-vc-ice">Growing.</strong> Every room has the same member cap. When rooms
                    with a free seat run short, the bot creates the next one, numbered from your prefix, so whoever
                    arrives next has somewhere to go.
                </li>
                <li className="mb-2">
                    <strong className="text-vc-ice">Shrinking.</strong> When people leave, spare empty rooms are
                    deleted - all but one, so the next arrival never waits for a channel to be made.
                </li>
                <li>
                    <strong className="text-vc-ice">Renumbering.</strong> A closed room would leave a gap, so within
                    five minutes the rooms are renamed in order: Room-1, Room-3 becomes Room-1, Room-2 again. That
                    takes <code>{ VAR_DYNAMIC_CHANNEL_INDEX }</code> in the prefix.
                </li>
            </ul>

            <h2 className="text-h4 mt-12 mb-4">Pool or Join to Create?</h2>

            <p className="text-vc-ice-dim">
                Both are generators - one channel that hands out the rest. They differ in who the rooms belong to:
            </p>

            <div className="overflow-x-auto mb-6">
                <table className="vc-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Join to Create</th>
                            <th>Auto-scaling pool</th>
                        </tr>
                    </thead>
                    <tbody>
                        { POOL_VS_JOIN_TO_CREATE.map( ( row ) => (
                            <tr key={ row.aspect }>
                                <td>{ row.aspect }</td>
                                <td>{ row.joinToCreate }</td>
                                <td>{ row.pool }</td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            <p className="text-vc-ice-dim">
                A pool suits shared spaces: public lobbies, study halls, squads of a fixed size, overflow for a busy
                night. When members should run their own room - lock it, hide it, pick who gets in - use{ " " }
                <RouterLink to="/posts/join-to-create">Join to Create</RouterLink> instead; the{ " " }
                <RouterLink to="/posts/private-voice-channels">private voice channels guide</RouterLink> shows
                everything an owner can do. Plenty of servers run one of each.
            </p>

            <h2 className="text-h4 mt-12 mb-4">Set up a pool</h2>

            <ol className="text-vc-ice-dim">
                <li className="mb-4">
                    Add the bot and run <code>/setup</code> in your server.

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
                    Open <strong>Create a master channel</strong> and pick <strong>📈 Auto-Scaling Channel</strong>,
                    the one that automatically scales based on member count.
                </li>
                <li className="mb-4">
                    Fill in the two fields and submit:

                    <ul className="mt-2">
                        <li>
                            <strong className="text-vc-ice">Channel Name Prefix</strong> - the room name, with{ " " }
                            <code>{ VAR_DYNAMIC_CHANNEL_INDEX }</code> where the number goes. Leave it out and the
                            number is added after a dash, but the rooms are then never renumbered.
                        </li>
                        <li>
                            <strong className="text-vc-ice">Max Members Per Channel</strong> - the cap every room
                            gets.
                        </li>
                    </ul>

                    <div className="overflow-x-auto mt-4">
                        <table className="vc-table">
                            <thead>
                                <tr>
                                    <th>Prefix</th>
                                    <th>Rooms it makes</th>
                                </tr>
                            </thead>
                            <tbody>
                                { PREFIX_EXAMPLES.map( ( prefix ) => (
                                    <tr key={ prefix }>
                                        <td><code>{ prefix }</code></td>
                                        <td>{ namePrefixRooms( prefix ) }</td>
                                    </tr>
                                ) ) }
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4">
                        <DiscordModal title="📈 Configure Scaling Channel" showNotice={ false } cancelLabel="Cancel">
                            <DiscordInput label="CHANNEL NAME PREFIX" value={ POOL.PREFIX }/>
                            <DiscordInput label="MAX MEMBERS PER CHANNEL" value={ String( POOL.CAP ) }/>
                        </DiscordModal>
                    </div>
                </li>
                <li>
                    That is the whole setup. The bot creates a <strong>{ AUTO_SCALING_CONFIG.categoryName }</strong>{ " " }
                    category holding the entry channel, <strong>{ AUTO_SCALING_CONFIG.masterChannelName }</strong>,
                    and the first room.
                </li>
            </ol>

            <h2 className="text-h4 mt-12 mb-4">Change a pool later</h2>

            <p className="text-vc-ice-dim">
                Run <code>/setup</code> again, pick the pool under <strong>Edit a master channel</strong> and press{ " " }
                <strong>⚙️ Edit Settings</strong> for the same two fields. Rooms that are already open are renamed
                and re-capped to match.
            </p>

            <p className="text-vc-ice-dim">
                The <a href={ DASHBOARD_URL } target="_blank" rel="noreferrer">dashboard</a> has both settings on
                its <strong>Generators</strong> page, plus a third that <code>/setup</code> does not:{ " " }
                <strong>Minimum available channels</strong>. Whenever somebody joins and no more than that many
                rooms still have a free seat, the pool opens another.
            </p>

            <h2 className="text-h4 mt-12 mb-4">Tips for a tidy pool</h2>

            <ul className="text-vc-ice-dim">
                <li className="mb-2">
                    <strong className="text-vc-ice">Match the cap to the activity.</strong> A team game played in
                    fives wants a cap of five; a duo queue wants two. A cap that is too high lets the first room
                    swallow everybody.
                </li>
                <li className="mb-2">
                    <strong className="text-vc-ice">Name rooms for what they are for.</strong>{ " " }
                    { PREFIX_IDEAS.map( ( prefix, index ) => (
                        <span key={ prefix }>{ index > 0 && ", " }<code>{ prefix }</code></span>
                    ) ) }. Only <code>{ VAR_DYNAMIC_CHANNEL_INDEX }</code> works in a prefix: a pool room has no
                    single owner, so a token like <code>{ VAR_DYNAMIC_CHANNEL_USER }</code> is printed as typed. What
                    works where is in <RouterLink to="/posts/channel-name-placeholders">channel name placeholders</RouterLink>.
                </li>
                <li className="mb-2">
                    <strong className="text-vc-ice">One pool per game or activity.</strong> Each pool has its own
                    prefix and cap, so a lobby of fives and a duo queue can sit side by side.
                </li>
                <li>
                    <strong className="text-vc-ice">Hold scheduled events there.</strong> Set an event&apos;s location
                    to the pool and every room it opens during the event counts toward the{ " " }
                    <RouterLink to="/posts/event-attendance">event&apos;s attendance</RouterLink>.
                </li>
            </ul>

            <h2 className="text-h4 mt-12 mb-4">What it costs</h2>

            <p className="text-vc-ice-dim mb-0">
                A pool counts as one generator, the same as a Join to Create channel. Every server gets{ " " }
                { BILLING_FREE_MAX_MASTER_CHANNELS } generators free, and <RouterLink to="/pricing">Pro</RouterLink>{ " " }
                takes the limit away.
            </p>

            <div className="p-6 mt-12 bg-vc-space rounded border border-vc-hairline-bright text-center">
                <h2 className="text-h5 mb-3">Set up your first pool</h2>
                <p className="text-vc-ice-dim mb-6">
                    One command, two fields, and the rooms take care of themselves.
                </p>
                <a href="/invite-vertix?src=site-post"
                    className="vc-btn vc-btn-primary vc-btn-lg vc-btn-effect">
                    Add to Discord
                </a>
            </div>
        </div>
    );
}
