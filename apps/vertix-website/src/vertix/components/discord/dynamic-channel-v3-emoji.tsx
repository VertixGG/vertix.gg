import * as React from "react";

import { useCustomEmojiSrc } from "@vertix.gg/discord-ui";

/**
 * The artwork a v3 button actually carries in Discord, by emoji name.
 *
 * A custom emoji id is only resolvable by the application that owns it, so the icons come from the
 * manifest the api serves rather than from the repo. Until it lands, and whenever the api cannot
 * be reached, the unicode stand-in keeps the page whole.
 */
export interface DynamicChannelV3EmojiProps {
    name: string;
    alt: string;
    fallback: string;
    className?: string;
}

export const DynamicChannelV3Emoji: React.FC<DynamicChannelV3EmojiProps> = ( {
    name,
    alt,
    fallback,
    className
} ) => {
    const src = useCustomEmojiSrc( name );

    if ( ! src ) {
        return <span className={ className }>{ fallback }</span>;
    }

    return (
        <span className={ className }>
            <img
                src={ src }
                alt={ alt }
                className="discord-emoji"
                draggable={ false }
                style={ { width: "1em", height: "1em", verticalAlign: "middle" } }
            />
        </span>
    );
};

export default DynamicChannelV3Emoji;
