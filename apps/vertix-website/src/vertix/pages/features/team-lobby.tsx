import { DiscordRoleSelectDropdown, DiscordSelectMenuDropdown, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import { BILLING_FREE_MAX_MASTER_CHANNELS } from "@vertix.gg/definitions/src/billing-definitions";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { RoleWalkthrough } from "@vertix.gg/website/src/vertix/pages/features/server-roles/role-walkthrough";

import {
    TEAM_LOBBY_CATEGORY_NAME,
    TEAM_LOBBY_HOST_ROLE,
    TEAM_LOBBY_NAME,
    TEAM_LOBBY_PANEL_NAME,
    TEAM_LOBBY_WALKTHROUGH
} from "@vertix.gg/website/src/vertix/pages/features/team-lobby/team-lobby-walkthrough";

import { SETUP_EMPTY_VARIABLES } from "@vertix.gg/website/src/vertix/components/discord/preview-variables";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

const CARD = "p-4 bg-vc-space rounded border border-vc-hairline-bright h-full";

/**
 * What the panel says while the lobby is not split and names no hosts - the bot's own two sentences
 * for it, handed to the preview in place of what the bot would work out - and the lobby it tells
 * members to join, by name, since a preview has no channel to mention.
 */
const PANEL_IDLE_VARIABLES = {
    lobbyId: TEAM_LOBBY_NAME,
    splitMessage: "**Not split** - everyone is in the lobby.",
    hostsMessage: "**Hosts:** anyone in the lobby"
};

export default function TeamLobbyPage() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">Team Lobby</h1>

            { /* Overview */ }
            <section className="mb-12">
                <p className="text-lg text-vc-ice-dim">
                    One voice channel your members gather in. A host splits everyone in it into team rooms or small
                    groups, and one press brings them all back. Use it for in-house matches, raid groups, classes and
                    workshops, or study groups that work apart for a while. It is free, and counts as one of the
                    server&apos;s generators.
                </p>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-azure-soft">🎲 Random teams</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Everyone shuffled evenly into 2 to 8 teams, and moved.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-cyan">🙋 Pick teams</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Team rooms open, and everyone joins the one they want.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-mint">👥 Groups</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Breakout rooms of 2 to 10, everyone dealt in.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-starlight">↩️ Recall</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Everyone back in the lobby, and the rooms close.</p>
                        </div>
                    </div>
                </div>
            </section>

            { /* How It Works */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">How It Works</h2>
                <p className="text-vc-ice-dim">
                    A lobby is a voice channel members join and <strong>stay in</strong> - unlike a generator, it
                    sends nobody to a room of their own. Its panel is in two places: a read-only panel channel
                    beside it, <strong>{ TEAM_LOBBY_PANEL_NAME }</strong>, as a generator has, and the lobby&apos;s own
                    chat, where whoever is in the lobby already is. From either, a host does one of two things:
                </p>
                <ol className="text-vc-ice-dim mb-6">
                    <li>
                        <strong>Splits it.</strong> The bot opens team or group rooms in a category of the
                        split&apos;s own, right below the lobby&apos;s, and - for random teams and groups - moves
                        everyone into theirs.
                    </li>
                    <li>
                        <strong>Calls it back.</strong> Everyone in the rooms is moved back to the lobby, and the
                        rooms are deleted with their category. A bot cannot mix voice between two channels, so this
                        is also how two teams talk to each other.
                    </li>
                </ol>

                <h3 className="text-h5 text-vc-cyan mb-4">Who can use it</h3>
                <p className="text-vc-ice-dim">
                    Every server can have a team lobby - it is free, and takes one of the server&apos;s generator
                    slots. Making one, naming its hosts and deleting it is for whoever can run <code>/setup</code>:
                    the server&apos;s owner, and members with <strong>Administrator</strong>, or with{ " " }
                    <strong>Manage Server</strong>, <strong>Manage Channels</strong> and <strong>Manage Roles</strong>{ " " }
                    together. A lobby can also be made and deleted from the dashboard&apos;s Generators page.
                </p>
                <p className="text-vc-ice-dim mb-4">
                    The panel&apos;s buttons - every split, and <strong>↩️ Recall</strong> - follow one rule, and it
                    depends on whether the lobby names host roles:
                </p>
                <div className="overflow-x-auto mb-4">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Who</th>
                                <th>Can split and call back</th>
                                <th>Has to be in voice</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>The server&apos;s owner, and anybody who can run <code>/setup</code></td>
                                <td>Always</td>
                                <td>No</td>
                            </tr>
                            <tr>
                                <td>Members holding one of the lobby&apos;s host roles - a teacher, an organizer, a raid lead</td>
                                <td>When the lobby names host roles</td>
                                <td>No</td>
                            </tr>
                            <tr>
                                <td>Anybody in the lobby, or in one of the rooms it split into</td>
                                <td>When the lobby names none - how every lobby starts</td>
                                <td>Yes - in the lobby or one of its rooms</td>
                            </tr>
                            <tr>
                                <td>Everybody else</td>
                                <td>Never - a press answers with a note saying who runs the lobby</td>
                                <td>-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-vc-ice-dim mb-6">
                    Naming a host role takes the panel away from everyone else: once a lobby names one, members
                    without it cannot press, even while they sit in the lobby. Who may join the lobby and its rooms is
                    a different question, answered below.
                </p>

                <h3 className="text-h5 text-vc-cyan mb-4">Every team keeps to its own room</h3>
                <p className="text-vc-ice-dim mb-4">
                    Nobody can walk into the other side&apos;s room - or read its chat - and take what they hear back
                    to their own team:
                </p>
                <ul className="text-vc-ice-dim mb-4">
                    <li>
                        <strong>Random teams and Groups:</strong> each room is shut to everyone but the members dealt
                        into it. Nobody else can see it or join it.
                    </li>
                    <li>
                        <strong>Pick teams:</strong> the rooms are open to everyone who can see the lobby until they
                        choose. The moment a member walks into one, the other teams&apos; rooms close to them until the
                        split ends.
                    </li>
                    <li>
                        <strong>Hosts can go anywhere.</strong> Members with one of the lobby&apos;s host roles - and the
                        server&apos;s owner and administrators - can enter every room, the way a teacher visits breakout
                        groups.
                    </li>
                </ul>
                <p className="text-vc-ice-dim mb-6">
                    Otherwise the rooms copy the lobby&apos;s permissions, bitrate and region. To keep a lobby to some
                    of your members, set that on the lobby itself with Discord&apos;s own channel permissions - its rooms
                    follow.
                </p>

                <h3 className="text-h5 text-vc-cyan mb-4">Through the host&apos;s eyes</h3>
                <p className="text-vc-ice-dim">
                    Six players on a server whose lobby names <strong>@{ TEAM_LOBBY_HOST_ROLE }</strong> as its host.
                    Press <strong>Next</strong> to follow their evening.
                </p>
                <RoleWalkthrough steps={ TEAM_LOBBY_WALKTHROUGH }/>
            </section>

            <hr />

            { /* Setup */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Setup</h2>
                <p className="text-vc-ice-dim mb-6">
                    A lobby needs nothing to work - it is made in one pick, and its hosts can be named afterwards.
                </p>

                <h3 className="text-h5 text-vc-cyan mb-4">Step 1: Run /setup and pick Team Lobby</h3>
                <div className="discord-chat-container m-0 mb-6">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 8:58 PM"
                        componentName="VertixBot/UI-General/SetupComponent"
                        variables={ SETUP_EMPTY_VARIABLES }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-General/SetupMasterCreateSelectMenu": { highlighted: true }
                        } }
                    />
                </div>
                <div style={ { maxWidth: "450px" } } className="mb-6">
                    <DiscordSelectMenuDropdown
                        options={ [
                            { iconEmoji: "➕", label: "Dynamic Channel (V2)", description: "Classic dynamic voice channels" },
                            { iconEmoji: "✨", label: "Dynamic Channel (V3)", description: "Enhanced dynamic channels with more features" },
                            { iconEmoji: "📈", label: "Auto-Scaling Channel", description: "Automatically scales based on member count" },
                            {
                                iconEmoji: "🎮",
                                label: "Team Lobby",
                                description: "Split one channel into team rooms or groups",
                                highlighted: true
                            }
                        ] }
                    />
                </div>

                <h3 className="text-h5 text-vc-cyan mb-4">Step 2: The lobby and its panel</h3>
                <p className="text-vc-ice-dim mb-4">
                    The bot makes a <strong>{ TEAM_LOBBY_CATEGORY_NAME }</strong> category with a{ " " }
                    <strong>{ TEAM_LOBBY_NAME }</strong> voice channel in it, and beside it a{ " " }
                    <strong>{ TEAM_LOBBY_PANEL_NAME }</strong> text channel - the way a generator gets its control
                    panel. Everyone who can see the lobby can read it and press its buttons, and nobody can write
                    in it. The bot posts this panel there, and the same panel in the lobby&apos;s own chat:
                </p>
                <div className="discord-chat-container m-0 mb-6">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 8:58 PM"
                        componentName="VertixBot/UI-V3/TeamLobbyComponent"
                        preferredEmbedsGroup="VertixBot/UI-V3/TeamLobbyEmbedGroup"
                        preferredElementsGroup="VertixBot/UI-V3/TeamLobbyElementsGroup"
                        variables={ PANEL_IDLE_VARIABLES }
                    />
                </div>
                <p className="text-vc-ice-dim mb-6">
                    Rename the lobby or move it to another category whenever you like - the bot keeps track of it.
                    A server that has used all its generators is told so instead, and nothing is made.
                </p>

                <h3 className="text-h5 text-vc-cyan mb-4">Step 3: Name its hosts (optional)</h3>
                <p className="text-vc-ice-dim mb-4">
                    Run <code>/setup</code> again and pick the lobby under <strong>Edit a master channel</strong>. Its
                    own screen has one menu - the roles that run it - and a <strong>Delete</strong> button that takes
                    the lobby down with its rooms, and its category once nothing else is left in it. Picking no role
                    at all hands it to whoever is in it.
                </p>
                <div style={ { maxWidth: "450px" } } className="mb-6">
                    <DiscordRoleSelectDropdown
                        roles={ [
                            { name: "Moderator", memberCount: 4, color: "#e67e22" },
                            { name: TEAM_LOBBY_HOST_ROLE, memberCount: 3, color: "#f1c40f", selected: true },
                            { name: "Member", memberCount: 212, color: "#2ecc71" }
                        ] }
                    />
                </div>
            </section>

            <hr />

            { /* Using it */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Splitting and Calling Back</h2>
                <p className="text-vc-ice-dim mb-4">
                    Press a mode on the panel. Only you see the screen that asks how many - teams, or members to a
                    group. Pick the number, then press <strong>✅ Apply</strong> to split. Not everyone in the lobby
                    playing? Pick who is in the <strong>👥 Only these members</strong> menu too:
                </p>
                <div className="discord-chat-container m-0 mb-6">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:02 PM"
                        componentName="VertixBot/UI-V3/TeamLobbyComponent"
                        preferredEmbedsGroup="VertixBot/UI-V3/TeamLobbyRandomTeamsEmbedGroup"
                        preferredElementsGroup="VertixBot/UI-V3/TeamLobbyRandomTeamsMenuGroup"
                        ephemeral={ true }
                    />
                </div>
                <p className="text-vc-ice-dim mb-4">
                    That screen then says what was done, and the panel lists the rooms as links - one click takes a
                    member to a team:
                </p>
                <div className="discord-chat-container m-0 mb-6">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:02 PM"
                        componentName="VertixBot/UI-V3/TeamLobbyComponent"
                        preferredEmbedsGroup="VertixBot/UI-V3/TeamLobbyEmbedGroup"
                        preferredElementsGroup="VertixBot/UI-V3/TeamLobbyElementsGroup"
                        variables={ {
                            lobbyId: TEAM_LOBBY_NAME,
                            splitMessage: "**Split into:** <#🔴 Team 1> · <#🔵 Team 2>",
                            hostsMessage: `**Hosts:** <@&${ TEAM_LOBBY_HOST_ROLE }>`
                        } }
                    />
                </div>

                <div className="overflow-x-auto mb-6">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Mode</th>
                                <th>You pick</th>
                                <th>What happens</th>
                                <th>Each room holds</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>🎲 Random teams</td>
                                <td>2 to 8 teams</td>
                                <td>Everyone in the lobby is shuffled evenly into 🔴 Team 1, 🔵 Team 2 and so on, and moved</td>
                                <td>Anybody - no limit</td>
                            </tr>
                            <tr>
                                <td>🙋 Pick teams</td>
                                <td>2 to 8 teams</td>
                                <td>The team rooms open empty, and members walk into the one they want</td>
                                <td>Its share of the lobby - 10 people and 2 teams make 5 each</td>
                            </tr>
                            <tr>
                                <td>👥 Groups</td>
                                <td>2 to 10 to a group</td>
                                <td>Everyone in the lobby is dealt into 👥 Group rooms of that size, and moved</td>
                                <td>The group size, so every group stays the one it was dealt</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p className="text-vc-ice-dim">
                    <strong>Picking members is optional, in every mode.</strong> Pick nobody and the whole lobby is
                    split. Pick some, and random teams and groups deal only them - whoever else is in the lobby stays
                    there - while picked teams open their rooms to them alone, each room held to its share of them.
                    The screen lists everyone picked, ✅ in the lobby or ❌ not yet (or a bot), and keeps the list
                    up to date as they come and go. <strong>Apply</strong> waits until everyone picked is in the
                    lobby - and stays off for a split the lobby cannot make, such as more teams than people or a
                    group bigger than the lobby, saying which.
                </p>

                <p className="text-vc-ice-dim mb-0">
                    <strong>↩️ Recall</strong> moves everybody in the rooms back to the lobby and deletes the rooms
                    and their category, and the panel goes back to <em>Not split</em>. Anything that stops a press - you are not a host,
                    the lobby is split already, there are fewer people than teams - is answered with a note only you
                    see, saying which.
                </p>
            </section>

            <hr />

            { /* Permissions */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Permissions</h2>
                <p className="text-vc-ice-dim">
                    A split checks the first four on the lobby and says which one is missing. The bot gives itself
                    what it needs on the lobby when it makes it; Manage Roles comes with the invite.
                </p>
                <div className="overflow-x-auto">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>The bot needs</th>
                                <th>Why</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>View Channel and Connect</td>
                                <td>To see the lobby and its rooms</td>
                            </tr>
                            <tr>
                                <td>Move Members</td>
                                <td>To move everyone into their rooms, and back</td>
                            </tr>
                            <tr>
                                <td>Manage Channels</td>
                                <td>To open each split&apos;s category and rooms, and to close them</td>
                            </tr>
                            <tr>
                                <td>Manage Roles</td>
                                <td>To keep each team out of the other teams&apos; rooms</td>
                            </tr>
                            <tr>
                                <td>Send Messages and Embed Links</td>
                                <td>To post the panel in the panel channel and in the lobby&apos;s own chat</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            { /* Things to Know */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Things to Know</h2>
                <ul className="text-vc-ice-dim mb-0">
                    <li>
                        <strong>Rooms stay while the split goes on.</strong> A team that steps out to the lobby comes
                        back to its room. The rooms close on <strong>↩️ Recall</strong>, or once nobody is left in the
                        lobby or any of its rooms.
                    </li>
                    <li>
                        <strong>Bots are not split.</strong> A music bot in the lobby stays where it is.
                    </li>
                    <li>
                        <strong>Late arrivals wait in the lobby.</strong> After random teams or groups, each room is
                        only for the members dealt into it - someone who joins the lobby afterwards stays there until
                        the next split.
                    </li>
                    <li>
                        <strong>Every split has its own category.</strong> Discord cannot put a category inside
                        another, so it opens right below the lobby&apos;s - <strong>↳ { TEAM_LOBBY_NAME }</strong> -
                        and goes when the split ends. A channel you move into it yourself keeps it standing.
                    </li>
                    <li>
                        <strong>Up to 20 rooms at once.</strong> That is the most one split opens - give a big group a
                        bigger group size.
                    </li>
                    <li>
                        <strong>It takes a generator slot.</strong> A lobby counts against the same allowance as
                        generators and auto-scaling channels - { BILLING_FREE_MAX_MASTER_CHANNELS } on the free plan,
                        unlimited with <RouterLink to="/pricing">Pro</RouterLink>. A server with more than its plan
                        allows keeps the ones it set up first; a lobby past them does not split.
                    </li>
                    <li>
                        <strong>Recall always works.</strong> If a lobby falls past the plan while it is split, nobody
                        is left in a team room: <strong>↩️ Recall</strong> still brings them back.
                    </li>
                </ul>
            </section>

            { /* Troubleshooting */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Troubleshooting</h2>
                <p className="text-vc-ice-dim">A press only answers with a note? It says why - most often:</p>
                <ul className="text-vc-ice-dim mb-0">
                    <li>The lobby names host roles, and you hold none of them.</li>
                    <li>It names none, and you are not in the lobby or one of its rooms.</li>
                    <li>The lobby is split already - press <strong>↩️ Recall</strong> first.</li>
                    <li>
                        The panel channel was deleted? The bot makes it again the next time it starts - or right
                        away, if you open the lobby in <code>/setup</code> and pick its host roles again.
                    </li>
                    <li>
                        <strong>Apply</strong> stays off: someone you picked is not in the lobby yet, or there are not
                        enough people for the teams or group size you chose - the screen says which.
                    </li>
                    <li>The server has more generators than its plan allows, and this lobby is one of the extra ones.</li>
                </ul>
            </section>

            { /* FAQ */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Questions</h2>

                <h3 className="text-h5">Can two teams hear each other?</h3>
                <p className="text-vc-ice-dim">
                    Not while they are split - Discord carries voice inside one channel. Press{ " " }
                    <strong>↩️ Recall</strong> to bring everyone together, and split again afterwards.
                </p>

                <h3 className="text-h5">Is the split the same every time?</h3>
                <p className="text-vc-ice-dim">
                    No. Random teams and groups shuffle the lobby anew on every split; the teams always come out
                    within one player of each other.
                </p>

                <h3 className="text-h5">Does it cost anything?</h3>
                <p className="text-vc-ice-dim mb-0">
                    No - team lobbies are free. A lobby takes one of the server&apos;s generator slots, so a free
                    server has { BILLING_FREE_MAX_MASTER_CHANNELS } to share between its lobbies and generators;{ " " }
                    <RouterLink to="/pricing">Pro</RouterLink> has no limit.
                </p>
            </section>
        </div>
    );
}
