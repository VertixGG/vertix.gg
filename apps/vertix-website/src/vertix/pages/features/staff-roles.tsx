import { DiscordRoleSelectDropdown, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { RoleWalkthrough } from "@vertix.gg/website/src/vertix/pages/features/server-roles/role-walkthrough";
import { ServerSettingsSteps } from "@vertix.gg/website/src/vertix/pages/features/server-roles/server-settings-steps";
import { STAFF_ROLES_WALKTHROUGH } from "@vertix.gg/website/src/vertix/pages/features/server-roles/server-roles-walkthroughs";

import { DEMO_MEMBERS, DEMO_OWNER } from "@vertix.gg/website/src/vertix/pages/features/dynamic-channel-v3-features/dynamic-channel-v3-constants";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";

import { FROM_SERVER_OPTIONS, STAFF_ROLE_MENTIONS } from "@vertix.gg/website/src/vertix/shared/server-roles-data";

import { SETUP_EMPTY_VARIABLES } from "@vertix.gg/website/src/vertix/components/discord/preview-variables";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

const CARD = "p-4 bg-vc-space rounded border border-vc-hairline-bright h-full";

export default function StaffRolesPage() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">Server Staff Roles</h1>

            { /* Overview */ }
            <section className="mb-12">
                <p className="text-lg text-vc-ice-dim">
                    For your moderators: roles no room can shut out. Whatever its owner chooses, a room still shows
                    itself to a staff role and lets it connect - and the owner cannot block or kick somebody who holds
                    one. Your moderators reach any room without being let in one at a time. It is free.
                </p>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-azure-soft">Sees hidden rooms</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">A hidden room stays on the channel list for staff.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-cyan">Joins private rooms</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Staff connect without anybody trusting them first.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-mint">Cannot be blocked or kicked</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">The owner&apos;s Block and Kick refuse a staff member, and say why.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-starlight">Server-wide or per generator</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">A generator can keep a list of its own instead of the server&apos;s.</p>
                        </div>
                    </div>
                </div>
            </section>

            { /* How It Works */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">How It Works</h2>
                <p className="text-vc-ice-dim">
                    It is for your moderators. A room belongs to its owner, who can make it private, hide it, block
                    people from it and kick them out of it - and staff roles are the exception to all four:
                </p>
                <ol className="text-vc-ice-dim mb-6">
                    <li><strong>They always see the room</strong> - Hidden never takes it off their list.</li>
                    <li>
                        <strong>They always get in</strong> - Private never locks them out, and nobody has to trust them
                        first.
                    </li>
                    <li>
                        <strong>They cannot be blocked or kicked</strong> - the owner&apos;s Block and Kick refuse a staff
                        member, and say why.
                    </li>
                </ol>

                <h3 className="text-h5 text-vc-cyan mb-4">What it does to permissions</h3>
                <p className="text-vc-ice-dim mb-6">
                    The bot allows every staff role View Channel and Connect on each room, and leaves the staff roles
                    out whenever it writes a room&apos;s privacy - so no state takes that away. That is all it grants: a
                    way into any room, not the room itself. A room&apos;s panel answers to its owner alone, and anybody
                    else who presses it - staff included - is told it is not their channel. To move, mute or disconnect
                    somebody, a moderator uses the Discord permissions their own role already has, and a room whose
                    owner has left is claimed by staff the same way as by anyone else in it.
                </p>

                <h3 className="text-h5 text-vc-cyan mb-4">Through members&apos; eyes</h3>
                <p className="text-vc-ice-dim">
                    { DEMO_OWNER }&apos;s room, side by side through the eyes of two members: Alex, and{ " " }
                    { DEMO_MEMBERS.mia.username }, who holds <strong>@Moderator</strong> - one of the server&apos;s staff
                    roles. Press <strong>Next</strong> to follow what the owner does to it.
                </p>
                <RoleWalkthrough steps={ STAFF_ROLES_WALKTHROUGH }/>
            </section>

            <hr />

            { /* Setup */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Setup</h2>
                <p className="text-vc-ice-dim mb-6">
                    The staff roles are set once for the server, and every generator follows them unless it has a list
                    of its own. A team lobby has no list of its own, so it always follows the server&apos;s.
                </p>

                <ServerSettingsSteps option="editStaffRoles" label="Staff Roles"/>

                <h3 className="text-h5 text-vc-cyan mb-4">Step 3: Pick the roles</h3>
                <p className="text-vc-ice-dim mb-4">
                    Pick up to five roles. Each pick replaces the whole list, so pick every role you want together:
                </p>
                <div style={ { maxWidth: "450px" } } className="mb-6">
                    <DiscordRoleSelectDropdown
                        roles={ [
                            { name: "Moderator", memberCount: 4, color: "#e67e22", selected: true },
                            { name: "Helper", memberCount: 9, color: "#f1c40f", selected: true },
                            { name: "Member", memberCount: 212, color: "#2ecc71" },
                            { name: "Voice", memberCount: 0, color: "#3498db" }
                        ] }
                    />
                </div>
                <p className="text-vc-ice-dim mb-4">
                    It is saved the moment you pick, and reaches every generator that follows the server&apos;s list
                    there and then - the rooms already open included. A team lobby reads it at its next split.{ " " }
                    <strong>Clear</strong> empties the list again.
                </p>
                <div className="discord-chat-container m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:01 PM"
                        componentName="VertixBot/UI-General/SetupComponent"
                        preferredEmbedsGroup="VertixBot/UI-General/SetupEmbedGroup"
                        preferredElementsGroup="VertixBot/UI-General/StaffRolesElementsGroup"
                        variables={ { ...SETUP_EMPTY_VARIABLES, staffRolesMessage: STAFF_ROLE_MENTIONS } }
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
                <h2 className="text-h4 mb-4">A List per Generator</h2>
                <p className="text-vc-ice-dim mb-4">
                    A generator can keep a list of its own, which replaces the server&apos;s for it - a server staff
                    role is not staff on a generator with a list of its own. Run <code>/setup</code> and pick the
                    generator under <strong>Edit a master channel</strong> - or use <code>/manage edit</code> - then{ " " }
                    <strong>◎ ∙ Select Edit Option</strong> → <strong>∙ Edit Channel&apos;s Staff Roles</strong>. The
                    change reaches that generator&apos;s open rooms at once.
                </p>
                <div className="discord-chat-container m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:04 PM"
                        componentName="VertixBot/UI-V3/ConfigComponent"
                        preferredEmbedsGroup="VertixBot/UI-V3/SetupEditStaffRolesEmbedGroup"
                        preferredElementsGroup="VertixBot/UI-V3/SetupEditStaffRolesElementsGroup"
                        variables={ { staffRolesDisplay: `${ STAFF_ROLE_MENTIONS } ${ FROM_SERVER_OPTIONS }` } }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-General/StaffRolesMenu": { highlighted: true }
                        } }
                    />
                </div>
            </section>

            <hr />

            { /* Who Counts */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Who Counts as Staff</h2>
                <p className="text-vc-ice-dim mb-0">
                    Only members holding a role on the list - the generator&apos;s own list, if it has one. Being an
                    Administrator, or the server&apos;s owner, does not make anybody staff to the bot, though Discord
                    itself lets both into every channel.
                </p>
            </section>

            <hr />

            { /* Dashboard */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">On the Dashboard</h2>
                <p className="text-vc-ice-dim mb-0">
                    On the{ " " }
                    <a href={ `${ DASHBOARD_URL }/server-options` } target="_blank" rel="noreferrer">dashboard</a>,
                    the server&apos;s list is under <strong>Server Options</strong> → <strong>Roles</strong> →{ " " }
                    <strong>Staff roles</strong>. Saving it reaches the generators that follow it, the same way{ " " }
                    <code>/setup</code> does.
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
                                <td>Manage Channels, Manage Roles</td>
                                <td>To write the staff roles&apos; way in onto every room</td>
                            </tr>
                            <tr>
                                <td>View Channel, Connect</td>
                                <td>It can only grant a permission it holds itself</td>
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
                        <strong>Full rooms.</strong> A staff role brings View Channel and Connect. Joining a room that is
                        already at its user limit also takes Move Members - that is Discord&apos;s rule.
                    </li>
                    <li>
                        <strong>Blocked earlier.</strong> A member an owner blocked before they held a staff role stays
                        blocked until the owner unblocks them - a block on a member outranks any role.
                    </li>
                    <li>
                        <strong>Refusals are logged.</strong> With a{ " " }
                        <RouterLink to="/posts/how-to-setup-logs-channel">logs channel</RouterLink> set, an owner&apos;s
                        attempt to block or kick a staff member is written there too.
                    </li>
                    <li>
                        <strong>Team lobbies let staff into every room.</strong> When a{ " " }
                        <RouterLink to="/features/team-lobby">team lobby</RouterLink> splits, the server&apos;s staff
                        roles can enter every room it opens, the way its hosts can - and walking into one team&apos;s
                        room does not shut them out of the others. The rooms are made with the list as it is at that
                        moment; rooms already open keep what they were made with. A staff role does not make anybody a
                        host - on its own, it does not let them split or call back.
                    </li>
                    <li>
                        <strong>Auto-scaling pools do not use it.</strong> An{ " " }
                        <RouterLink to="/features/auto-scaling">auto-scaling</RouterLink> pool&apos;s rooms take their
                        permissions from the pool&apos;s category, which you set in Discord.
                    </li>
                </ul>
            </section>

            { /* Troubleshooting */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Troubleshooting</h2>
                <p className="text-vc-ice-dim">A moderator cannot get into a room? Check that:</p>
                <ul className="text-vc-ice-dim mb-0">
                    <li>They hold a role on the list - the generator&apos;s own list, if it has one.</li>
                    <li>The room is not full - joining a full room takes Move Members.</li>
                    <li>The owner did not block them before they held the role.</li>
                    <li>In a team lobby, the role was on the list before the split opened - its rooms keep the list they were made with.</li>
                </ul>
            </section>

            { /* FAQ */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Questions</h2>

                <h3 className="text-h5">Can an owner keep staff out?</h3>
                <p className="text-vc-ice-dim">
                    Not through the bot: privacy never applies to a staff role, and Block and Kick refuse a staff member.
                    The owner is not given the permissions to change that by hand either.
                </p>

                <h3 className="text-h5">Staff roles or verified roles?</h3>
                <p className="text-vc-ice-dim">
                    <RouterLink to="/features/verified-roles">Verified roles</RouterLink> are who the rooms are for, and
                    who a private or hidden room shuts out. Staff roles are who it never shuts out.
                </p>

                <h3 className="text-h5">Does it cost anything?</h3>
                <p className="text-vc-ice-dim mb-0">No - staff roles are free on every server.</p>
            </section>
        </div>
    );
}
