import * as React from "react";

import "./styles/discord-message.css";

/**
 * The message a reply points back at, as Discord previews it above the reply itself.
 *
 * Only ever one line of it: who wrote it, and as much of what it said as fits. A panel said nothing
 * - it is an embed and a row of buttons - so what shows is the person it was addressed to, which is
 * exactly what Discord shows when it answers a button press on one.
 */
export interface DiscordMessageReply {
    author: string;
    avatar?: string;
    /** Draws the verified badge beside the name, the way an application's own messages carry it. */
    app?: boolean;
    /** What that message said, cut to one line - or who it named, where it said nothing. */
    preview?: React.ReactNode;
    /** Discord marks a message that has been rewritten since it was posted. */
    edited?: boolean;
    /** Stands where the replied message carried a picture rather than words. */
    hasAttachment?: boolean;
}

export interface DiscordMessageProps {
    author?: string;
    /** What colour the name is drawn in, which in Discord is the author's highest role. */
    authorColor?: string;
    avatar?: string;
    bot?: boolean;
    app?: boolean;
    timestamp?: string;
    ephemeral?: boolean;
    /**
     * Draws the message the way Discord draws one that mentions the person reading it: an amber
     * wash over it and a bar down its left edge.
     *
     * Discord decides this by comparing the mention against the account looking at the channel. A
     * page has no account to compare, so it says outright whether the message is addressed to the
     * one person it is being read by.
     */
    mentioned?: boolean;
    /** The message this one answers, previewed above it with Discord's hooked connector. */
    reply?: DiscordMessageReply;
    interactionUser?: string;
    interactionUserAvatar?: string;
    interactionCommand?: string;
    children: React.ReactNode;
}

export const DiscordMessage: React.FC<DiscordMessageProps> = ( {
    author = "Vertix",
    authorColor,
    avatar,
    bot = false,
    app = true,
    timestamp = "Today at 12:00 PM",
    ephemeral = false,
    mentioned = false,
    reply,
    interactionUser,
    interactionUserAvatar,
    interactionCommand,
    children
} ) => {
    return (
        <div className="discord-message-container">
            { interactionUser && interactionCommand && (
                <div className="discord-interaction-reply">
                    { interactionUserAvatar && (
                        <div className="interaction-avatar">
                            <img src={ interactionUserAvatar } alt={ interactionUser } />
                        </div>
                    ) }
                    <div className="interaction-content">
                        <span className="interaction-user">{ interactionUser }</span>
                        <span className="interaction-text"> used </span>
                        <span className="interaction-command">{ interactionCommand }</span>
                    </div>
                </div>
            ) }
            <div className={ [
                "discord-message",
                ephemeral && "ephemeral",
                mentioned && "discord-message-mentioned",
                reply && "discord-message-has-reply"
            ].filter( Boolean ).join( " " ) }>
                { reply && (
                    <div className="discord-message-reply">
                        { /* The hook back to the message being answered. Drawn from the reply's own
                             left edge out to the centre of the avatar below it, which is why it
                             lives in here rather than above: it is measured off this padding. */ }
                        <span className="discord-message-reply-spine" aria-hidden="true"/>

                        { reply.avatar && (
                            <img className="discord-message-reply-avatar" src={ reply.avatar } alt={ reply.author }/>
                        ) }

                        { reply.app && <span className="discord-message-bot-tag">APP</span> }

                        <span className="discord-message-reply-author">{ reply.author }</span>

                        { reply.preview && (
                            <span className="discord-message-reply-preview">{ reply.preview }</span>
                        ) }

                        { reply.edited && <span className="discord-message-reply-edited">(edited)</span> }

                        { reply.hasAttachment && (
                            <span className="discord-message-reply-attachment" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M5 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6a3 3 0 0
                                           0-3-3H5Zm9 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm-9 9.5 4.6-5.1a1
                                           1 0 0 1 1.5 0l2.1 2.4 2-2a1 1 0 0 1 1.4 0L19 15.7V18a1 1 0
                                           0 1-1 1H6a1 1 0 0 1-1-1v-.5Z"
                                    />
                                </svg>
                            </span>
                        ) }
                    </div>
                ) }

                { avatar && (
                    <div className="discord-message-avatar">
                        <img src={ avatar } alt={ author } />
                    </div>
                ) }
                <div className="discord-message-content">
                    <div className="discord-message-header">
                        <span className="discord-message-author" style={ authorColor ? { color: authorColor } : undefined }>{ author }</span>
                        { app && <span className="discord-message-bot-tag">APP</span> }
                        { bot && !app && <span className="discord-message-bot-tag">BOT</span> }
                        <span className="discord-message-timestamp">{ timestamp }</span>
                    </div>
                    <div className="discord-message-body">
                        { children }
                    </div>
                    { ephemeral && (
                        <div className="discord-ephemeral-footer">
                            <span className="ephemeral-icon">👁️</span>
                            Only you can see this • <span className="ephemeral-dismiss">Dismiss message</span>
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default DiscordMessage;

