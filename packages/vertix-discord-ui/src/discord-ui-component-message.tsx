import { DiscordMessage } from "./discord-message";
import { DiscordUIComponentRenderer } from "./discord-ui-component-renderer";
import { useEmojiManifest } from "./emoji-manifest";

import type { DiscordMessageReply } from "./discord-message";
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
    /** The message this one answers, previewed above it. */
    reply?: DiscordMessageReply;
    /**
     * Whether the mention in this message is aimed at the person reading the page.
     *
     * A demonstration puts the reader in the owner's chair, so a panel addressed to them is one
     * addressed to you, and Discord washes it amber - which is why carrying a mention is taken to
     * mean it by default. Somewhere the reader is only being shown a panel rather than standing in
     * front of their own, say so and the wash stays off.
     */
    mentioned?: boolean;
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
    reply,
    mentioned,
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
            reply={ reply }
            // This component is the application speaking, and Discord draws a name in the
            // colour of its highest role - which for this one is the role it carries in its
            // own server.
            authorColor="var(--discord-app-author-color)"
            mentioned={ mentioned ?? Boolean( mentionUsername ) }
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

