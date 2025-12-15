import * as React from "react";

import "./styles/discord-message.css";

export interface DiscordMessageProps {
    author?: string;
    avatar?: string;
    bot?: boolean;
    app?: boolean;
    timestamp?: string;
    ephemeral?: boolean;
    interactionUser?: string;
    interactionUserAvatar?: string;
    interactionCommand?: string;
    children: React.ReactNode;
}

export const DiscordMessage: React.FC<DiscordMessageProps> = ( {
    author = "Vertix",
    avatar,
    bot = false,
    app = true,
    timestamp = "Today at 12:00 PM",
    ephemeral = false,
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
            <div className={ `discord-message ${ ephemeral ? "ephemeral" : "" }` }>
                { avatar && (
                    <div className="discord-message-avatar">
                        <img src={ avatar } alt={ author } />
                    </div>
                ) }
                <div className="discord-message-content">
                    <div className="discord-message-header">
                        <span className="discord-message-author">{ author }</span>
                        { app && <span className="discord-message-bot-tag">APP</span> }
                        { bot && !app && <span className="discord-message-bot-tag">BOT</span> }
                        <span className="discord-message-timestamp">{ timestamp }</span>
                    </div>
                    <div className="discord-message-body">
                        { children }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiscordMessage;

