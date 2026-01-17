import { replaceEmojisWithIcons } from "./discord-emojis";

import "./styles/discord-select-menu.css";

export interface DiscordSelectMenuProps {
    placeholder?: string;
    disabled?: boolean;
    emojiIconSrcByUnicode?: Readonly<Record<string, string>>;
    highlighted?: boolean;
    selectedLabel?: string;
    highlightedCaret?: boolean;
    expanded?: boolean;
    onClick?: () => void;
}

export function DiscordSelectMenu( {
    placeholder,
    disabled = false,
    emojiIconSrcByUnicode,
    highlighted = false,
    selectedLabel,
    highlightedCaret = false,
    expanded = false,
    onClick,
}: DiscordSelectMenuProps ) {
    const resolvedPlaceholder = placeholder ? replaceEmojisWithIcons( placeholder, emojiIconSrcByUnicode ) : "";
    const resolvedSelectedLabel = selectedLabel
        ? replaceEmojisWithIcons( selectedLabel, emojiIconSrcByUnicode )
        : "";
    const labelClassName = selectedLabel ? "discord-select-menu-selected" : "discord-select-menu-placeholder";
    const labelValue = selectedLabel ? resolvedSelectedLabel : resolvedPlaceholder;

    const caretClassName = [
        "discord-select-menu-caret",
        highlightedCaret ? "discord-select-menu-caret-highlighted" : "",
        expanded ? "discord-select-menu-caret-expanded" : ""
    ].filter( Boolean ).join( " " );

    return (
        <button
            type="button"
            className={ highlighted ? "discord-select-menu discord-select-menu-highlighted" : "discord-select-menu" }
            disabled={ disabled }
            aria-label={ placeholder }
            onClick={ onClick }
        >
            <span
                className={ labelClassName }
                dangerouslySetInnerHTML={ { __html: labelValue } }
            />
            <span className={ caretClassName } aria-hidden="true">
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

