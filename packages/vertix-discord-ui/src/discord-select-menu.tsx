import { replaceEmojisWithIcons } from "./discord-emojis";

import "./styles/discord-select-menu.css";

export interface DiscordSelectMenuProps {
    placeholder?: string;
    disabled?: boolean;
    emojiIconSrcByUnicode?: Readonly<Record<string, string>>;
    highlighted?: boolean;
}

export function DiscordSelectMenu( {
    placeholder,
    disabled = false,
    emojiIconSrcByUnicode,
    highlighted = false,
}: DiscordSelectMenuProps ) {
    const resolvedPlaceholder = placeholder ? replaceEmojisWithIcons( placeholder, emojiIconSrcByUnicode ) : "";

    return (
        <button
            type="button"
            className={ highlighted ? "discord-select-menu discord-select-menu-highlighted" : "discord-select-menu" }
            disabled={ disabled }
            aria-label={ placeholder }
        >
            <span
                className="discord-select-menu-placeholder"
                dangerouslySetInnerHTML={ { __html: resolvedPlaceholder } }
            />
            <span className="discord-select-menu-caret" aria-hidden="true">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M7 10L12 15L17 10"
                        fill="currentColor"
                    />
                </svg>
            </span>
        </button>
    );
}

