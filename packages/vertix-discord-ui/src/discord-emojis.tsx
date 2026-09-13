import * as React from "react";

import { getEmojiTokenName, replaceEmojiTokens } from "@vertix.gg/utils/src/emoji-token";

import { getCustomEmojiSrc } from "./emoji-manifest";

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
    "🙈": MonkeyFaceEmoji,
    "🐵": MonkeyFaceEmoji,
    "👥": BustsEmoji,
    "🔃": ArrowsClockwiseEmoji,
    "🔀": ShuffleEmoji,
    "😈": SmilingImpEmoji,
    "🌐": GlobeEmoji,
    "🌍": EarthEmoji,
    "👍": ThumbsUpEmoji,
};

/**
 * Function isDiscordMarkup() :: Tells whether an emoji string is markup rather than a printable
 * character - custom emoji markdown `<:Name:id>`, or an `<emoji name='Name'>` token.
 *
 * Markup that did not resolve to an icon has to be dropped, printing it raw leaks the source
 * syntax into the page.
 */
export const isDiscordMarkup = ( emoji: string ) => emoji.startsWith( "<" ) && emoji.endsWith( ">" );

/**
 * Function getDiscordEmojiIconSrc() :: Resolves a single emoji - unicode, custom emoji markdown or
 * an `<emoji name='EmojiName'>` token - to the icon that stands for it.
 *
 * The exported UI definitions carry the token rather than markdown, because a custom emoji id is
 * only resolvable by the discord application that owns the emoji.
 */
export function getDiscordEmojiIconSrc(
    emoji: string,
    overridesByUnicode?: Readonly<Record<string, string>>,
): string | undefined {
    const src = overridesByUnicode?.[ emoji ] ?? DISCORD_EMOJI_ICON_SRC_BY_UNICODE[ emoji ];

    if ( src ) {
        return src;
    }

    const markdownName = emoji.match( /<:([^:]+):(\d+)>/ )?.[ 1 ];

    if ( markdownName ) {
        return getCustomEmojiSrc( markdownName );
    }

    const tokenName = getEmojiTokenName( emoji );

    if ( tokenName ) {
        return getCustomEmojiSrc( tokenName );
    }

    return undefined;
}

/**
 * Function getDiscordEmojiLabel() :: Resolves a single emoji to something a screen reader can
 * usefully read out.
 *
 * A printable character is returned as-is - a reader announces it by its unicode name. Markup
 * only has its name segment worth reading, `<:mic_on:123>` reads as `mic on`; the id and the
 * syntax around it are noise.
 */
export function getDiscordEmojiLabel( emoji: string ): string | undefined {
    if ( ! isDiscordMarkup( emoji ) ) {
        return emoji || undefined;
    }

    const name = emoji.match( /<a?:([^:]+):(\d+)>/ )?.[ 1 ] ?? getEmojiTokenName( emoji );

    if ( ! name ) {
        return undefined;
    }

    // Emoji names are written for code, not for reading out - `ChannelRename` has to come apart
    // into words before a reader makes a phrase of it rather than one run-on token.
    return name
        .replace( /[_-]+/g, " " )
        .replace( /([a-z0-9])([A-Z])/g, "$1 $2" )
        .trim() || undefined;
}

export function getDiscordEmojiIcon( emoji: string ): React.ReactNode | null {
    const src = getDiscordEmojiIconSrc( emoji );

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

    // Handle custom Discord emojis <:Name:ID>
    result = result.replace( /<:([^:]+):(\d+)>/g, ( match, name, _id ) => {
        const src = getCustomEmojiSrc( name ) || ( overrides ? overrides[ match ] : undefined );
        if ( src ) {
            return `<img src="${ src }" alt="${ name }" class="emoji" draggable="false">`;
        }
        return match;
    } );

    // Handle the `<emoji name='Name'>` token used by the exported UI definitions.
    result = replaceEmojiTokens( result, ( name ) => {
        const src = getCustomEmojiSrc( name );

        return src ? `<img src="${ src }" alt="${ name }" class="emoji" draggable="false">` : undefined;
    } );

    return result;
}

