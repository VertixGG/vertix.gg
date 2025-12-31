import * as React from "react";

import ArrowsClockwiseEmoji from "./assets/emojis/arrows-clockwise.svg";
import BroomEmoji from "./assets/emojis/broom.svg";
import BustsEmoji from "./assets/emojis/busts.svg";
import EarthEmoji from "./assets/emojis/earth-africa.svg";
import GlobeEmoji from "./assets/emojis/globe-with-meridians.svg";
import MonkeyFaceEmoji from "./assets/emojis/monkey-face.svg";
import NoEntryEmoji from "./assets/emojis/no-entry.svg";
import PencilEmoji from "./assets/emojis/pencil.svg";
import RaisedHandEmoji from "./assets/emojis/raised-hand.svg";
import ShuffleEmoji from "./assets/emojis/shuffle.svg";
import SmilingImpEmoji from "./assets/emojis/smiling-imp.svg";
import ThumbsUpEmoji from "./assets/emojis/thumbsup.svg";

export const DISCORD_EMOJI_ICON_SRC_BY_UNICODE: Readonly<Record<string, string>> = {
    "✏️": PencilEmoji,
    "✋": RaisedHandEmoji,
    "🧹": BroomEmoji,
    "🚫": NoEntryEmoji,
    "🐵": MonkeyFaceEmoji,
    "👥": BustsEmoji,
    "🔃": ArrowsClockwiseEmoji,
    "🔀": ShuffleEmoji,
    "😈": SmilingImpEmoji,
    "🌐": GlobeEmoji,
    "🌍": EarthEmoji,
    "👍": ThumbsUpEmoji,
};

export function getDiscordEmojiIcon( emoji: string ): React.ReactNode | null {
    const src = DISCORD_EMOJI_ICON_SRC_BY_UNICODE[ emoji ];
    if ( !src ) {
        return null;
    }

    return (
        <img
            src={ src }
            alt={ emoji }
            className="discord-emoji"
            draggable={ false }
        />
    );
}

export function replaceEmojisWithIcons( text: string, overrides?: Readonly<Record<string, string>> ): string {
    let result = text;

    const emojiMap = overrides ? { ...DISCORD_EMOJI_ICON_SRC_BY_UNICODE, ...overrides } : DISCORD_EMOJI_ICON_SRC_BY_UNICODE;

    for ( const [ emoji, src ] of Object.entries( emojiMap ) ) {
        const emojiRegex = new RegExp( emoji, "g" );
        result = result.replace( emojiRegex, `<img src="${ src }" alt="${ emoji }" class="emoji" draggable="false">` );
    }

    return result;
}

