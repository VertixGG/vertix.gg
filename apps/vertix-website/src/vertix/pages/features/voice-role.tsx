import { DiscordChannelWizard, DiscordRoleSelectDropdown, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { ServerSettingsSteps } from "@vertix.gg/website/src/vertix/pages/features/server-roles/server-settings-steps";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";

import {
    FROM_SERVER_OPTIONS,
    VOICE_ROLE_MENTION,
    VOICE_ROLE_WIZARD_STEPS
} from "@vertix.gg/website/src/vertix/shared/server-roles-data";

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
                    moment they leave. Give that role a text channel and the channel opens to whoever is talking
                    right now; list it separately and the member list groups them at the top. It is free.
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
                    An evening on a server whose voice role is <strong>@Voice</strong>.
                </p>
                <DiscordChannelWizard
                    steps={ VOICE_ROLE_WIZARD_STEPS }
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
                    The voice role is set once for the server, and every generator gives it out unless it has
                    one of its own.
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
                    shows it. <strong>Clear</strong> empties it again, and <strong>Back</strong> returns to the server
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
                    Moving between the rooms of two generators swaps one role for the other; between two that give
                    the same role, the member simply keeps it. To put a generator back on the server&apos;s role,
                    pick <strong>From the server options</strong> for it on the dashboard.
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
                        <strong>Only its rooms count.</strong> Rooms made by a v2 or v3 generator give the role. An{ " " }
                        <RouterLink to="/features/auto-scaling">auto-scaling</RouterLink> pool&apos;s rooms, the
                        generator channel itself and the server&apos;s other voice channels do not.
                    </li>
                    <li>
                        <strong>Give it a role of its own.</strong> Leaving a room takes the role off, whoever gave it -
                        so a rank, a colour or any role members hold for another reason is the wrong one to pick.
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
                    <li>They are in a room a generator made - not a pool&apos;s room, or a channel of the server&apos;s own.</li>
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

                <h3 className="text-h5">What is it good for?</h3>
                <p className="text-vc-ice-dim">
                    A text channel only the people in voice can see: give <strong>@Voice</strong> View Channel on it and
                    take View Channel from <strong>@everyone</strong>. Or switch on{ " " }
                    <strong>Display role members separately from online members</strong> for the role, and everyone
                    talking is grouped at the top of the member list.
                </p>

                <h3 className="text-h5">Can a member hold two voice roles?</h3>
                <p className="text-vc-ice-dim">
                    No. A generator&apos;s own role replaces the server&apos;s, and a member is only ever in one room.
                </p>

                <h3 className="text-h5">What about who can see the rooms?</h3>
                <p className="text-vc-ice-dim">
                    That is a different setting: <RouterLink to="/features/verified-roles">verified roles</RouterLink>{ " " }
                    decide who the rooms are for, and <RouterLink to="/features/staff-roles">staff roles</RouterLink>{ " " }
                    who no room can keep out.
                </p>

                <h3 className="text-h5">Does it cost anything?</h3>
                <p className="text-vc-ice-dim mb-0">No - the voice role is free on every server.</p>
            </section>
        </div>
    );
}
