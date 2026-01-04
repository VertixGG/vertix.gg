import { DiscordMessage } from "./discord-message";
import { DiscordUIComponentRenderer } from "./discord-ui-component-renderer";

import type { UIElementOverride, UIEmbedOverride } from "./discord-ui-component-renderer";

export interface DiscordUIComponentMessageProps {
    author?: string;
    avatar?: string;
    timestamp?: string;
    mentionUsername?: string;
    componentName: string;
    variables?: Readonly<Record<string, string>>;
    elementOverrides?: Readonly<Record<string, UIElementOverride>>;
    embedOverrides?: Readonly<Record<string, UIEmbedOverride>>;
    preferredEmbedsGroup?: string;
    preferredElementsGroup?: string;
    hideElements?: boolean;
    app?: boolean;
    ephemeral?: boolean;
    interactionUser?: string;
    interactionUserAvatar?: string;
    interactionCommand?: string;
}

export function DiscordUIComponentMessage( {
    author = "Vertix",
    avatar,
    timestamp,
    mentionUsername,
    componentName,
    variables,
    elementOverrides,
    embedOverrides,
    preferredEmbedsGroup,
    preferredElementsGroup,
    hideElements,
    app = true,
    ephemeral = false,
    interactionUser,
    interactionUserAvatar,
    interactionCommand,
}: DiscordUIComponentMessageProps ) {
    return (
        <DiscordMessage
            author={ author }
            avatar={ avatar }
            app={ app }
            timestamp={ timestamp }
            ephemeral={ ephemeral }
            interactionUser={ interactionUser }
            interactionUserAvatar={ interactionUserAvatar }
            interactionCommand={ interactionCommand }
        >
            { mentionUsername && (
                <span className="discord-mention-pill">@{ mentionUsername }</span>
            ) }

            <DiscordUIComponentRenderer
                componentName={ componentName }
                variables={ variables }
                elementOverrides={ elementOverrides }
                embedOverrides={ embedOverrides }
                preferredEmbedsGroup={ preferredEmbedsGroup }
                preferredElementsGroup={ preferredElementsGroup }
                hideElements={ hideElements }
            />
        </DiscordMessage>
    );
}

export default DiscordUIComponentMessage;

