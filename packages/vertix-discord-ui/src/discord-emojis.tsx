import * as React from "react";

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
    "Templates": ChannelTemplatesEmoji,
};

export function getDiscordEmojiIcon( emoji: string ): React.ReactNode | null {
    let src = DISCORD_EMOJI_ICON_SRC_BY_UNICODE[ emoji ];

    if ( !src ) {
        const match = emoji.match( /<:([^:]+):(\d+)>/ );
        if ( match ) {
            const name = match[ 1 ];
            src = DISCORD_EMOJI_ICON_SRC_BY_NAME[ name ];
        }
    }

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

    return result;
}

