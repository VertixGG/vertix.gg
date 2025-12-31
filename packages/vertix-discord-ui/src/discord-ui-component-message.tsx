import * as React from "react";

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
    app?: boolean;
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
    app = true,
}: DiscordUIComponentMessageProps ) {
    return (
        <DiscordMessage
            author={ author }
            avatar={ avatar }
            app={ app }
            timestamp={ timestamp }
        >
            { mentionUsername && (
                <span className="discord-mention-pill">@{ mentionUsername }</span>
            ) }

            <DiscordUIComponentRenderer
                componentName={ componentName }
                variables={ variables }
                elementOverrides={ elementOverrides }
                embedOverrides={ embedOverrides }
            />
        </DiscordMessage>
    );
}

export default DiscordUIComponentMessage;

