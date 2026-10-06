import { DiscordCommandSuggestion, DiscordUIComponentMessage } from "@vertix.gg/discord-ui";

import VertixAvatar from "@vertix.gg/assets/brand/vc-avatar.webp";
import UserAvatar from "@vertix.gg/assets/brand/user-avatar.webp";

import { SETUP_EMPTY_VARIABLES } from "@vertix.gg/website/src/vertix/components/discord/preview-variables";

import "@vertix.gg/website/src/vertix/components/discord/discord-chat-container.css";

/**
 * The value each role setting carries in the server settings menu - what the bot switches on when
 * one is picked, and what the menu is told to point at here.
 */
export type ServerRoleOptionValue = "editVoiceRole" | "editVerifiedRoles" | "editStaffRoles";

interface ServerSettingsStepsProps {
    option: ServerRoleOptionValue;
    /** The option's label in the menu, which is what a reader looks for in it. */
    label: string;
}

/**
 * The first two steps every server role takes: open the server settings, and pick the role there.
 *
 * Shared because the three pages differ only in which option the menu points at. The screen each
 * role opens onto is its own page's business.
 */
export function ServerSettingsSteps( { option, label }: ServerSettingsStepsProps ) {
    return (
        <>
            <h3 className="text-h5 text-vc-cyan mb-4">Step 1: Open the server settings</h3>
            <p className="text-vc-ice-dim mb-4">
                Run <code>/setup</code> and press <strong>⚙️ Edit Server Options</strong>.
            </p>
            <div className="discord-chat-container m-0 mb-6">
                <DiscordUIComponentMessage
                    author="VoiceChannels"
                    avatar={ VertixAvatar }
                    timestamp="Today at 9:00 PM"
                    componentName="VertixBot/UI-General/SetupComponent"
                    variables={ SETUP_EMPTY_VARIABLES }
                    ephemeral={ true }
                    interactionUser="iNewLegend"
                    interactionUserAvatar={ UserAvatar }
                    interactionCommand="/setup"
                    elementOverrides={ {
                        "VertixBot/UI-General/SetupServerOptionsEditButton": { highlighted: true }
                    } }
                />
            </div>
            <p className="text-vc-ice-dim mb-4">
                Or skip straight to a menu of just the three role settings with <code>/manage roles</code>:
            </p>
            <div className="discord-chat-container m-0 mb-6 box-normalize">
                <DiscordCommandSuggestion
                    searchTerm="/manage roles"
                    items={ [
                        {
                            command: "/manage roles",
                            description: "Set this server's voice, verified and staff roles.",
                            botName: "VoiceChannels",
                            botAvatar: VertixAvatar
                        }
                    ] }
                />
            </div>

            <h3 className="text-h5 text-vc-cyan mb-4">Step 2: Pick { label }</h3>
            { /* The open menu hangs below the message the way Discord's does, past the button row under
                 it, and covered the step after this one. The room it hangs into is padding on a wrapper,
                 because the container's own stylesheet outranks a margin utility. */ }
            <div className="pb-36">
                <div className="discord-chat-container m-0">
                    <DiscordUIComponentMessage
                        author="VoiceChannels"
                        avatar={ VertixAvatar }
                        timestamp="Today at 9:00 PM"
                        componentName="VertixBot/UI-General/SetupComponent"
                        preferredEmbedsGroup="VertixBot/UI-General/SetupServerOptionsEmbedGroup"
                        preferredElementsGroup="VertixBot/UI-General/ServerOptionsElementsGroup"
                        ephemeral={ true }
                        interactionUser="iNewLegend"
                        interactionUserAvatar={ UserAvatar }
                        interactionCommand="/setup"
                        expandedSelectMenu={ {
                            elementName: "VertixBot/UI-General/ServerOptionsEditSelectMenu",
                            highlightedValue: option
                        } }
                    />
                </div>
            </div>
        </>
    );
}

export default ServerSettingsSteps;
