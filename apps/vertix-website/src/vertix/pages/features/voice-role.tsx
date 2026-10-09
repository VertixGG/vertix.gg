import { DiscordRoleSelectDropdown, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { RoleWalkthrough } from "@vertix.gg/website/src/vertix/pages/features/server-roles/role-walkthrough";
import { ServerSettingsSteps } from "@vertix.gg/website/src/vertix/pages/features/server-roles/server-settings-steps";
import { VOICE_ROLE_WALKTHROUGH } from "@vertix.gg/website/src/vertix/pages/features/server-roles/server-roles-walkthroughs";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";

import { FROM_SERVER_OPTIONS, VOICE_ROLE_MENTION } from "@vertix.gg/website/src/vertix/shared/server-roles-data";

import { SETUP_EMPTY_VARIABLES } from "@vertix.gg/website/src/vertix/components/discord/preview-variables";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

const CARD = "p-4 bg-vc-space rounded border border-vc-hairline-bright h-full";

export default function VoiceRolePage() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">Server Voice Role</h1>

            { /* Overview */ }
            <section className="mb-12">
                <p className="text-lg text-vc-ice-dim">
                    A role VoiceChannels gives a member while they are in one of its rooms, and takes back the
                    moment they leave. Use it to open a text channel to whoever is talking right now, to colour their
                    names while they talk, or to group them together in the member list. It is free.
                </p>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-azure-soft">Given on join</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">The moment a member lands in a room - the owner of a new one included.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-cyan">Taken on leave</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Leaving, or moving to a channel the bot did not make, takes it back.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-mint">Per generator</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">A generator can give a role of its own instead of the server&apos;s.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-starlight">Checked as you pick</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">A role the bot cannot hand out is flagged the moment you choose it.</p>
                        </div>
                    </div>
                </div>
            </section>

            { /* How It Works */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">How It Works</h2>
                <p className="text-vc-ice-dim">
                    You pick a role once. From then on the bot does two things with it, and nothing else:
                </p>
                <ol className="text-vc-ice-dim mb-6">
                    <li>
                        <strong>Gives it</strong> to a member the moment they land in a room a generator made - their
                        own room or anybody else&apos;s. An{ " " }
                        <RouterLink to="/features/auto-scaling">auto-scaling</RouterLink> pool&apos;s rooms count too,
                        and so do a <RouterLink to="/features/team-lobby">team lobby</RouterLink> and the rooms it
                        splits into.
                    </li>
                    <li>
                        <strong>Takes it back</strong> the moment they leave voice, or move to a channel the bot did not
                        make.
                    </li>
                </ol>

                <h3 className="text-h5 text-vc-cyan mb-4">What it does to permissions</h3>
                <p className="text-vc-ice-dim">
                    Nothing on its own - the bot never writes the voice role into any channel&apos;s permissions. The
                    role carries whatever you give it, and only for as long as it is held, so what it is for is up to
                    you:
                </p>
                <ul className="text-vc-ice-dim">
                    <li>
                        <strong>A text channel for whoever is talking.</strong> On <strong>#voice-chat</strong>, take View
                        Channel from <strong>@everyone</strong> and allow it for <strong>@Voice</strong>. The channel
                        appears for a member the moment they join a room, and is gone again when they leave.
                    </li>
                    <li>
                        <strong>A colour or a badge while talking.</strong> Give <strong>@Voice</strong> a colour or an
                        icon, and it shows on a member&apos;s name only while they are in voice.
                    </li>
                    <li>
                        <strong>Everyone in voice, together.</strong> Switch on{ " " }
                        <strong>Display role members separately from online members</strong> for the role, and the
                        member list puts everyone in a room under a heading of its own.
                    </li>
                </ul>
                <p className="text-vc-ice-dim mb-6">
                    Anybody who can get into a room or a lobby can hold the role, so give it nothing you would not give
                    everybody in voice. It has no say over who can see or join the rooms either - that is what{ " " }
                    <RouterLink to="/features/verified-roles">verified roles</RouterLink> and{ " " }
                    <RouterLink to="/features/staff-roles">staff roles</RouterLink> are for.
                </p>

                <h3 className="text-h5 text-vc-cyan mb-4">Through a member&apos;s eyes</h3>
                <p className="text-vc-ice-dim">
                    Alex&apos;s Discord, on a server whose voice role is <strong>@Voice</strong> and whose{ " " }
                    <strong>#voice-chat</strong> only <strong>@Voice</strong> can see. Press <strong>Next</strong> to
                    follow Alex through an evening.
                </p>
                <RoleWalkthrough steps={ VOICE_ROLE_WALKTHROUGH }/>
            </section>

            <hr />

            { /* Setup */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Setup</h2>
                <p className="text-vc-ice-dim mb-6">
                    The voice role is set once for the server, and every generator gives it out unless it has
                    one of its own. Auto-scaling pools and team lobbies have no voice role of their own, so they
                    always give the server&apos;s.
                </p>

                <ServerSettingsSteps option="editVoiceRole" label="Voice Role"/>

                <h3 className="text-h5 text-vc-cyan mb-4">Step 3: Pick the role</h3>
                <p className="text-vc-ice-dim mb-4">Pick one role from the menu:</p>
                <div style={ { maxWidth: "450px" } } className="mb-6">
                    <DiscordRoleSelectDropdown
                        roles={ [
                            { name: "Moderator", memberCount: 4, color: "#e67e22" },
                            { name: "Member", memberCount: 212, color: "#2ecc71" },
                            { name: "Voice", memberCount: 0, color: "#3498db", selected: true },
                            { name: "Events", memberCount: 37, color: "#9b59b6" }
                        ] }
                    />
                </div>
                <p className="text-vc-ice-dim mb-4">
                    It is saved the moment you pick it, and the screen&apos;s <strong>Server Voice Role</strong> line
                    shows it. Whoever already sits where it is given swaps the old role for the new one there and
                    then. <strong>Clear</strong> empties it again, and <strong>Back</strong> returns to the server
                    settings.
                </p>
                <div className="discord-chat-container m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:01 PM"
                        componentName="VertixBot/UI-General/SetupComponent"
                        preferredEmbedsGroup="VertixBot/UI-General/SetupEmbedGroup"
                        preferredElementsGroup="VertixBot/UI-General/VoiceRoleElementsGroup"
                        variables={ { ...SETUP_EMPTY_VARIABLES, voiceRoleMessage: VOICE_ROLE_MENTION } }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                    />
                </div>
            </section>

            <hr />

            { /* Per Generator */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">A Role per Generator</h2>
                <p className="text-vc-ice-dim mb-4">
                    A generator can give a role of its own, which replaces the server&apos;s for its rooms - a room
                    gives one role, never two. Run <code>/setup</code> and pick the generator under{ " " }
                    <strong>Edit a master channel</strong> - or use <code>/manage edit</code> - then{ " " }
                    <strong>◎ ∙ Select Edit Option</strong> → <strong>∙ Edit Channel&apos;s Voice Role</strong>.
                    Until one is picked there, the generator reads <em>(from the server options)</em> and gives the
                    server&apos;s.
                </p>
                <div className="discord-chat-container m-0 mb-6">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:04 PM"
                        componentName="VertixBot/UI-V3/ConfigComponent"
                        preferredEmbedsGroup="VertixBot/UI-V3/SetupEditVoiceRoleEmbedGroup"
                        preferredElementsGroup="VertixBot/UI-V3/SetupEditVoiceRoleElementsGroup"
                        variables={ { voiceRoleDisplay: `${ VOICE_ROLE_MENTION } ${ FROM_SERVER_OPTIONS }` } }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-General/VoiceRoleMenu": { highlighted: true }
                        } }
                    />
                </div>
                <p className="text-vc-ice-dim mb-0">
                    Moving between the rooms of two generators swaps one role for the other, and so does moving from
                    a room that gives its generator&apos;s own role into a pool&apos;s room or a team lobby, which give
                    the server&apos;s. Between two that give the same role, the member simply keeps it. To put a
                    generator back on the server&apos;s role, pick <strong>From the server options</strong> for it on
                    the dashboard.
                </p>
            </section>

            <hr />

            { /* Assignable */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Roles the Bot Can Give</h2>
                <p className="text-vc-ice-dim mb-4">
                    Discord lets a bot give only roles below its own highest role, and only while it has{ " " }
                    <strong>Manage Roles</strong>. Pick one it cannot give and the role is still saved, but the bot
                    tells you there and then why it will not be handed out:
                </p>
                <div className="discord-chat-container m-0 mb-6">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:01 PM"
                        componentName="VertixBot/UI-General/UnassignableRoleComponent"
                        variables={ { roleId: "Voice", reason: "the role is above the bot in the role list" } }
                        ephemeral={ true }
                    />
                </div>
                <p className="text-vc-ice-dim mb-0">
                    Drag the bot&apos;s role above the voice role in <strong>Server Settings → Roles</strong>, or pick
                    another one. A role that belongs to another app - a bot&apos;s own role, the Server Booster role -
                    cannot be handed out at all, and neither can <strong>@everyone</strong>. Without Manage Roles, the
                    notice names that permission instead.
                </p>
            </section>

            <hr />

            { /* Dashboard */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">On the Dashboard</h2>
                <p className="text-vc-ice-dim mb-0">
                    On the{ " " }
                    <a href={ `${ DASHBOARD_URL }/server-options` } target="_blank" rel="noreferrer">dashboard</a>,
                    the server&apos;s voice role is under <strong>Server Options</strong> → <strong>Roles</strong> →{ " " }
                    <strong>Voice role</strong>: one role, or <strong>None</strong>. A generator&apos;s own is under{ " " }
                    <strong>Generators</strong> → the generator → <strong>Edit</strong> → <strong>Voice role</strong>,
                    where <strong>From the server options</strong> puts it back on the server&apos;s. A role the bot
                    could not give is greyed out in both, with the reason beside it.
                </p>
            </section>

            <hr />

            { /* Permissions */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Permissions</h2>
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
                                <td>Manage Roles</td>
                                <td>To give the role and to take it back</td>
                            </tr>
                            <tr>
                                <td>Its own role above the voice role</td>
                                <td>Discord lets a bot give only roles below its highest one</td>
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
                        <strong>Only its rooms and lobbies count.</strong> Rooms made by a v2 or v3 generator give the
                        role, and so do an <RouterLink to="/features/auto-scaling">auto-scaling</RouterLink> pool&apos;s
                        rooms, a <RouterLink to="/features/team-lobby">team lobby</RouterLink> and the rooms it splits
                        into. The generator channel itself, the channel that sends members into a pool and the
                        server&apos;s other voice channels do not.
                    </li>
                    <li>
                        <strong>Make a role just for this.</strong> Leaving a room takes the role off whoever holds it,
                        however they came by it - so a rank, or any role members hold for another reason, is the wrong
                        one to pick.
                    </li>
                    <li>
                        <strong>One room, one role.</strong> A member is in one room at a time, and a room gives one
                        role - its generator&apos;s own, or else the server&apos;s.
                    </li>
                </ul>
            </section>

            { /* Troubleshooting */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Troubleshooting</h2>
                <p className="text-vc-ice-dim">Nobody gets the role? Check that:</p>
                <ul className="text-vc-ice-dim">
                    <li>
                        They are in a room a generator or a pool made, or in a team lobby or one of its rooms - not a
                        channel of the server&apos;s own.
                    </li>
                    <li>The bot has Manage Roles, and its role sits above the voice role.</li>
                    <li>The voice role is not one that belongs to another app.</li>
                    <li>The generator has no voice role of its own - if it has, that one is given instead.</li>
                </ul>
                <p className="text-vc-ice-dim mb-0">
                    Somebody kept the role after leaving? The bot was probably offline when they left. It comes off the
                    next time they leave a room - or take it off by hand.
                </p>
            </section>

            { /* FAQ */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Questions</h2>

                <h3 className="text-h5">Can a member hold two voice roles?</h3>
                <p className="text-vc-ice-dim">
                    No. A generator&apos;s own role replaces the server&apos;s, and a member is only ever in one room.
                </p>

                <h3 className="text-h5">Does it cost anything?</h3>
                <p className="text-vc-ice-dim mb-0">No - the voice role is free on every server.</p>
            </section>
        </div>
    );
}
