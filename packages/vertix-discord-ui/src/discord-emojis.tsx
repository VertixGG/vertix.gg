import * as React from "react";

import { getEmojiTokenName, replaceEmojiTokens } from "@vertix.gg/utils/src/emoji-token";

import ChannelRenameEmoji from "@vertix.gg/assets/svg/ChannelRename.svg";

import UserLimitEmoji from "@vertix.gg/assets/svg/UserLimit.svg";

import ChannelPermissionsEmoji from "@vertix.gg/assets/svg/ChannelPermissions.svg";

import ChannelPrivacyEmoji from "@vertix.gg/assets/svg/ChannelPrivacy.svg";

import ChannelRegionEmoji from "@vertix.gg/assets/svg/ChannelRegion.svg";

import EditChannelMessageEmoji from "@vertix.gg/assets/svg/EditChannelMessage.svg";

import ClearChatEmoji from "@vertix.gg/assets/svg/ClearChat.svg";

import ResetChannelEmoji from "@vertix.gg/assets/svg/ResetChannel.svg";

import TransferChannelEmoji from "@vertix.gg/assets/svg/TransferChannel.svg";

import ClaimChannelEmoji from "@vertix.gg/assets/svg/ClaimChannel.svg";

import ChannelTemplatesEmoji from "@vertix.gg/assets/svg/ChannelTemplates.svg";

import CaptureEmoji from "@vertix.gg/assets/svg/Capture.svg";

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

export const DISCORD_EMOJI_ICON_SRC_BY_NAME: Readonly<Record<string, string>> = {
    "ChannelRename": ChannelRenameEmoji,
    "UserLimit": UserLimitEmoji,
    "ChannelPermissions": ChannelPermissionsEmoji,
    "ChannelPrivacy": ChannelPrivacyEmoji,
    "ChannelRegion": ChannelRegionEmoji,
    "EditChannelMessage": EditChannelMessageEmoji,
    "ClearChat": ClearChatEmoji,
    "ResetChannel": ResetChannelEmoji,
    "TransferChannel": TransferChannelEmoji,
    "ClaimChannel": ClaimChannelEmoji,
    // The exported bot UI names this emoji `ChannelTemplates`; the site's own
    // hand-written constant still uses `Templates`, so both resolve.
    "ChannelTemplates": ChannelTemplatesEmoji,
    "Capture": CaptureEmoji,
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
        return DISCORD_EMOJI_ICON_SRC_BY_NAME[ markdownName ];
    }

    const tokenName = getEmojiTokenName( emoji );

    if ( tokenName ) {
        return DISCORD_EMOJI_ICON_SRC_BY_NAME[ tokenName ];
    }

    return undefined;
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
        const src = DISCORD_EMOJI_ICON_SRC_BY_NAME[ name ] || ( overrides ? overrides[ match ] : undefined );
        if ( src ) {
            return `<img src="${ src }" alt="${ name }" class="emoji" draggable="false">`;
        }
        return match;
    } );

    // Handle the `<emoji name='Name'>` token used by the exported UI definitions.
    result = replaceEmojiTokens( result, ( name ) => {
        const src = DISCORD_EMOJI_ICON_SRC_BY_NAME[ name ];

        return src ? `<img src="${ src }" alt="${ name }" class="emoji" draggable="false">` : undefined;
    } );

    return result;
}

