import { DiscordRoleSelectDropdown, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import RouterLink from "@vertix.gg/website/src/vertix/ui/router-link";

import { RoleWalkthrough } from "@vertix.gg/website/src/vertix/pages/features/server-roles/role-walkthrough";
import { ServerSettingsSteps } from "@vertix.gg/website/src/vertix/pages/features/server-roles/server-settings-steps";
import { VERIFIED_ROLES_WALKTHROUGH } from "@vertix.gg/website/src/vertix/pages/features/server-roles/server-roles-walkthroughs";

import { DASHBOARD_URL } from "@vertix.gg/website/src/vertix/shared/dashboard";

import { VERIFIED_ROLE_MENTION } from "@vertix.gg/website/src/vertix/shared/server-roles-data";

import { SETUP_EMPTY_VARIABLES } from "@vertix.gg/website/src/vertix/components/discord/preview-variables";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

const CARD = "p-4 bg-vc-space rounded border border-vc-hairline-bright h-full";

export default function VerifiedRolesPage() {
    return (
        <div>
            <h1 className="text-h3 md:text-h2">Server Verified Roles</h1>

            { /* Overview */ }
            <section className="mb-12">
                <p className="text-lg text-vc-ice-dim">
                    Who your dynamic channels are for. On a server that makes new members verify first, pick the role
                    they earn - <strong>@Member</strong>, say - and the bot keeps everyone without it out: the
                    generator, its category and every room it makes are gone from their channel list. The same roles
                    are what a room&apos;s Private and Hidden act on. Out of the box the list is{ " " }
                    <strong>@everyone</strong>, which keeps nobody out. It is free.
                </p>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-azure-soft">@everyone by default</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Every member sees the generator and every public room.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-cyan">Narrowed to a role</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Pick the roles your members earn - everyone else sees neither the generator nor its rooms.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-mint">What privacy works on</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">Private stops these roles joining a room, Hidden stops them seeing it.</p>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6 lg:col-span-3">
                        <div className={ CARD }>
                            <h3 className="text-h5 text-vc-starlight">Per generator</h3>
                            <p className="text-vc-ice-dim mb-0 text-sm">A generator can keep a list of its own instead of the server&apos;s.</p>
                        </div>
                    </div>
                </div>
            </section>

            { /* How It Works */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">How It Works</h2>
                <p className="text-vc-ice-dim">
                    It is built for servers that make new members verify first - read the rules, pass a captcha, get a
                    role - before they can see anything. The rooms follow the same gate:
                </p>
                <ol className="text-vc-ice-dim mb-6">
                    <li>
                        <strong>Pick the roles your members earn</strong> - <strong>@Member</strong>, say. Left at{ " " }
                        <strong>@everyone</strong>, the default, there is no gate: every member is on the list.
                    </li>
                    <li>
                        <strong>Everybody without one is kept out.</strong> The generator, its category, its control panel
                        and every room it makes disappear from their channel list - they can neither open a room nor
                        join one.
                    </li>
                    <li>
                        <strong>A room&apos;s privacy works on the same roles.</strong> When its owner sets it Private, the
                        roles on the list can still see it but not join; Hidden takes it off their list.
                    </li>
                </ol>

                <h3 className="text-h5 text-vc-cyan mb-4">What it does to permissions</h3>
                <p className="text-vc-ice-dim">
                    The bot writes this onto every room, and rewrites it whenever the list or the room&apos;s privacy
                    changes:
                </p>
                <div className="overflow-x-auto mb-4">
                    <table className="vc-table">
                        <thead>
                            <tr>
                                <th>Who</th>
                                <th>Public room</th>
                                <th>Private room</th>
                                <th>Hidden room</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>The roles on the list</td>
                                <td>See and join</td>
                                <td>See, cannot join</td>
                                <td>Cannot see it</td>
                            </tr>
                            <tr>
                                <td>Everyone else</td>
                                <td>Cannot see it</td>
                                <td>Cannot see it</td>
                                <td>Cannot see it</td>
                            </tr>
                            <tr>
                                <td>Members the owner trusts</td>
                                <td>See and join</td>
                                <td>See and join</td>
                                <td>See and join</td>
                            </tr>
                            <tr>
                                <td>Members the owner blocks</td>
                                <td>Cannot see it</td>
                                <td>Cannot see it</td>
                                <td>Cannot see it</td>
                            </tr>
                            <tr>
                                <td><RouterLink to="/features/staff-roles">Staff roles</RouterLink></td>
                                <td>See and join</td>
                                <td>See and join</td>
                                <td>See and join</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-vc-ice-dim mb-6">
                    &quot;Everyone else&quot; only exists once the list is narrower than <strong>@everyone</strong>: a
                    public room is then public to the roles on the list, and nobody else sees it at all. The generator,
                    its category and its control panel are kept to the same roles. A room&apos;s owner always gets into
                    it, and Discord lets members with Administrator into every channel.
                </p>

                <h3 className="text-h5 text-vc-cyan mb-4">Through a member&apos;s eyes</h3>
                <p className="text-vc-ice-dim">
                    Sam&apos;s Discord, on a server where newcomers see only <strong>#rules</strong> and{ " " }
                    <strong>#get-verified</strong> until they earn <strong>@Member</strong>. Press{ " " }
                    <strong>Next</strong> to see what the verified roles change for Sam.
                </p>
                <RoleWalkthrough steps={ VERIFIED_ROLES_WALKTHROUGH }/>
            </section>

            <hr />

            { /* Setup */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Setup</h2>
                <p className="text-vc-ice-dim mb-6">
                    The verified roles are set once for the server, and every generator follows them unless it has a
                    list of its own.
                </p>

                <ServerSettingsSteps option="editVerifiedRoles" label="Verified Roles"/>

                <h3 className="text-h5 text-vc-cyan mb-4">Step 3: Pick the roles</h3>
                <p className="text-vc-ice-dim mb-4">
                    Pick up to three roles. Each pick replaces the whole list, so pick every role you want together:
                </p>
                <div style={ { maxWidth: "450px" } } className="mb-6">
                    <DiscordRoleSelectDropdown
                        roles={ [
                            { name: "Moderator", memberCount: 4, color: "#e67e22" },
                            { name: "Member", memberCount: 212, color: "#2ecc71", selected: true },
                            { name: "Voice", memberCount: 0, color: "#3498db" },
                            { name: "Events", memberCount: 37, color: "#9b59b6" }
                        ] }
                    />
                </div>
                <p className="text-vc-ice-dim mb-4">
                    It is saved the moment you pick, and the bot rewrites every generator that follows the
                    server&apos;s list there and then - its category, the generator, its control panel and the rooms
                    already open. <strong>Clear</strong> hands the channels back to <strong>@everyone</strong>.
                </p>
                <div className="discord-chat-container m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:01 PM"
                        componentName="VertixBot/UI-General/SetupComponent"
                        preferredEmbedsGroup="VertixBot/UI-General/SetupEmbedGroup"
                        preferredElementsGroup="VertixBot/UI-General/VerifiedRolesElementsGroup"
                        variables={ { ...SETUP_EMPTY_VARIABLES, verifiedRolesMessage: VERIFIED_ROLE_MENTION } }
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
                    A generator can keep a list of its own, which replaces the server&apos;s for it - one generator
                    kept to <strong>@Gamer</strong>, say, while the rest follow the server. Run{ " " }
                    <code>/setup</code> and pick the generator under <strong>Edit a master channel</strong> - or use{ " " }
                    <code>/manage edit</code> - then <strong>◎ ∙ Select Edit Option</strong> →{ " " }
                    <strong>∙ Edit Channel&apos;s Verified Roles</strong>, pick the roles and press{ " " }
                    <strong>✔ Finish</strong>.
                </p>
                <p className="text-vc-ice-dim mb-0">
                    Until it has a list of its own, the generator reads <em>(from the server options)</em> and follows
                    the server&apos;s. Turning <strong>Include everyone role</strong> on there puts it back on the
                    server&apos;s list. The wizard that makes a new generator asks for its verified roles too, as its
                    third step.
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
                    <strong>Verified roles</strong>. Saving it rewrites the generators that follow it, the same way{ " " }
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
                                <td>To write who may see and join onto the category, the generator, its control panel and the rooms</td>
                            </tr>
                            <tr>
                                <td>View Channel, Connect</td>
                                <td>It can only grant a permission it holds itself</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-vc-ice-dim mt-4 mb-0">
                    <code>/setup</code> checks for everything the bot needs before it opens, and says what is missing.
                </p>
            </section>

            { /* Things to Know */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Things to Know</h2>
                <ul className="text-vc-ice-dim mb-0">
                    <li>
                        <strong>Auto-scaling pools do not use it.</strong> An{ " " }
                        <RouterLink to="/features/auto-scaling">auto-scaling</RouterLink> pool&apos;s rooms take their
                        permissions from the pool&apos;s category, which you set in Discord.
                    </li>
                    <li>
                        <strong>Three roles at most</strong> from Discord&apos;s picker, and the picker does not open with
                        the current ones ticked - pick the whole list each time.
                    </li>
                </ul>
            </section>

            { /* Troubleshooting */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Troubleshooting</h2>
                <ul className="text-vc-ice-dim mb-0">
                    <li>
                        <strong>Newcomers can see the rooms</strong> - the list is still <strong>@everyone</strong>.
                        Narrow it to the role your members earn.
                    </li>
                    <li>
                        <strong>Somebody holding the role cannot see the generator</strong> - check whether the generator
                        has a list of its own. The <code>/setup</code> screen marks a generator that follows the
                        server&apos;s with <em>(from the server options)</em>.
                    </li>
                    <li>
                        <strong>Somebody without the role got into a room</strong> - the owner trusted them, they hold a
                        staff role, or they are an Administrator.
                    </li>
                </ul>
            </section>

            { /* FAQ */ }
            <section className="mb-12">
                <h2 className="text-h4 mb-4">Questions</h2>

                <h3 className="text-h5">Do I need to set verified roles?</h3>
                <p className="text-vc-ice-dim">
                    Most servers do not - keep <strong>@everyone</strong>. Narrow it if new members cannot see your
                    channels until somebody gives them a role; otherwise a public room shows up for them anyway.
                </p>

                <h3 className="text-h5">Verified roles or staff roles?</h3>
                <p className="text-vc-ice-dim">
                    Verified roles are who the rooms are for, and who a private or hidden room shuts out.{ " " }
                    <RouterLink to="/features/staff-roles">Staff roles</RouterLink> are who it never shuts out.
                </p>

                <h3 className="text-h5">Does it cost anything?</h3>
                <p className="text-vc-ice-dim mb-0">No - verified roles are free on every server.</p>
            </section>
        </div>
    );
}
