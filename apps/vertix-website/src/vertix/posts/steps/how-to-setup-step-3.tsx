import { DiscordUIComponentMessage, DiscordRoleSelectDropdown } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vertix-icon-discord.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.png";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

interface IHowToSetupStep3Props {
    displayStep?: boolean
}

export default function HowToSetupStep3( props: IHowToSetupStep3Props ) {
    return (
        <>
            <li>
                {
                    props.displayStep ? (
                        <h4 id="step-3">Step 3</h4>
                    ) : <h4>Set verified roles</h4>
                }
                <br/>
                {
                    props.displayStep ? (
                        <h4>Set verified roles</h4>
                    ) : null
                }
                Or continue with <b>( <code>default = @everyone</code> recommended! )</b>
                <br/>
                <br/>
                <div className="discord-chat-container border-box m-0">
                    <DiscordUIComponentMessage
                        author="Vertix"
                        avatar={ VertixAvatar }
                        timestamp="Today at 2:35 PM"
                        componentName="VertixBot/UI-V3/SetupNewWizardComponent"
                        preferredElementsGroup="VertixBot/UI-V3/SetupStep3Component/ElementsGroup"
                        preferredEmbedsGroup="VertixBot/UI-V3/SetupStep3Component/EmbedsGroup"
                        variables={ { verifiedRolesDisplay: "{verifiedRolesDefault}" } }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-General/VerifiedRolesMenu": { highlighted: true },
                            "VertixBot/UI-General/WizardNextButton": { hidden: true },
                        } }
                    />
                </div>
                <br/>
                <br/>
                <p>Select <b>Verified Roles</b></p>
                <DiscordRoleSelectDropdown
                    roles={ [
                        { name: "Bots", memberCount: 3, color: "#3498db" },
                        { name: "Developer", memberCount: 3, color: "#2ecc71" },
                        { name: "Manager", memberCount: 3, color: "#e67e22" },
                        { name: "MEE6", memberCount: 1, color: "#99aab5" },
                        { name: "Support", memberCount: 0, color: "#9b59b6" },
                    ] }
                />

                <ul className="pt-5">
                    <p>Do I need to set <b>Verified Roles</b>?</p>
                    <ul>
                        <li>
                            For most Discord servers, the <code>@everyone</code> role is sufficient. However,
                            there are use cases where you may need additional roles. Here's an
                            example:<br/><br/>
                            Let's say that by <b>default</b>, new members in your Discord server cannot see
                            any <b>Channels</b>. If the owner of a dynamic channel sets their channel to be
                            visible and <b>Verified Role</b> tagged as <code>@everyone</code>, new members will
                            be able to <b>join/see</b> the channel, which may not be what you intended. This is
                            where the <b>Verified Role selection</b> comes into play.
                        </li>
                        <br/>
                        <li><b>Tip:</b> In most cases, one <b>verified role</b> is sufficient, and its
                            recommended to use <code>@everyone</code> role.
                        </li>
                    </ul>
                </ul>

                <br/>
                Press <b>( ✔ Finish )</b> to generate your <b>Master Channel.</b>
                <br/>
                <br/>
                <div className="discord-chat-container border-box m-0">
                    <DiscordUIComponentMessage
                        author="Vertix"
                        avatar={ VertixAvatar }
                        timestamp="Today at 4:26 PM"
                        componentName="VertixBot/UI-V3/SetupNewWizardComponent"
                        preferredElementsGroup="VertixBot/UI-V3/SetupStep3Component/ElementsGroup"
                        preferredEmbedsGroup="VertixBot/UI-V3/SetupStep3Component/EmbedsGroup"
                        variables={ { verifiedRolesDisplay: "@Trusted Members" } }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        elementOverrides={ {
                            "VertixBot/UI-General/WizardFinishButton": { highlighted: true },
                            "VertixBot/UI-General/WizardNextButton": { hidden: true },
                        } }
                    />
                </div>
                <br/>
                <br/>
                <h4>Its done, the <b>Master Channel</b> created!</h4>
                <br/>
                <div className="discord-chat-container border-box m-0">
                    <DiscordUIComponentMessage
                        author="Vertix"
                        avatar={ VertixAvatar }
                        timestamp="Today at 4:26 PM"
                        componentName="VertixBot/UI-General/SetupComponent"
                        variables={ {
                            masterChannelMessage: "{masterChannels}",
                            masterChannels: "**#1**\n▷ Name: 🔊 🆕 New Channel\n▷ Channel ID: 1121075197588541460\n▷ Dynamic Channels Name: `{user}'s Channel`\n▷ Buttons: ✏️, ✋, 🧹, 🚫, 🙈, 👥, 🔃, 🔀, 😈\n▷ Verified Roles: @Trusted Members",
                            badwordsMessage: "`badword`",
                        } }
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                    />
                </div>
                <br/>
            </li>
        </>
    );
}
