import { DiscordMessage } from "./discord-message";
import { DiscordUIComponentRenderer } from "./discord-ui-component-renderer";
import { useEmojiManifest } from "./emoji-manifest";

import type { UIElementOverride, UIEmbedOverride, ExpandedSelectMenus } from "./discord-ui-component-renderer";

export interface DiscordUIComponentMessageProps {
    author?: string;
    avatar?: string;
    timestamp?: string;
    mentionUsername?: string;
    componentName: string;
    onElementClick?: ( elementName: string ) => void;
    variables?: Readonly<Record<string, string>>;
    /** Placeholders the bot declared for a preview, which lose to the embed and to the caller. */
    defaultVariables?: Readonly<Record<string, string>>;
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
    expandedSelectMenu?: ExpandedSelectMenus;
    onSelectOption?: ( elementName: string, optionIndex: number ) => void;
}

export function DiscordUIComponentMessage( {
    author = "Vertix",
    avatar,
    timestamp,
    mentionUsername,
    componentName,
    onElementClick,
    variables,
    defaultVariables,
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
    expandedSelectMenu,
    onSelectOption,
}: DiscordUIComponentMessageProps ) {
    // The emojis below are resolved through the manifest module, which React cannot see changing.
    useEmojiManifest();

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
                onElementClick={ onElementClick }
                variables={ variables }
                defaultVariables={ defaultVariables }
                elementOverrides={ elementOverrides }
                embedOverrides={ embedOverrides }
                preferredEmbedsGroup={ preferredEmbedsGroup }
                preferredElementsGroup={ preferredElementsGroup }
                hideElements={ hideElements }
                expandedSelectMenu={ expandedSelectMenu }
                onSelectOption={ onSelectOption }
            />
        </DiscordMessage>
    );
}

export default DiscordUIComponentMessage;

