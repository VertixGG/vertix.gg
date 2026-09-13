import * as React from "react";

import "@vertix.gg/discord-ui/src/styles/discord-channel-intro.css";

import { DiscordButton } from "@vertix.gg/discord-ui/src/discord-button";

export interface DiscordChannelIntroProps {
    /** The channel being opened, which the welcome and the line under it are both written around. */
    channelName: string;
    /**
     * Discord offers this to whoever can manage the channel, and a dynamic channel belongs to the
     * person reading these pages - so it is drawn unless a page says otherwise.
     */
    canEdit?: boolean;
    onEdit?: () => void;
}

/**
 * Function DiscordChannelIntro() :: What Discord puts at the top of a channel with nothing above it.
 *
 * A channel does not begin at its first message - it begins with this: a mark, the channel's name
 * said back to you, and the plain sentence that there is nothing before this point. Every
 * demonstration on the site shows a channel from its very start, so every one of them should be
 * standing under this the way a real one is.
 */
export const DiscordChannelIntro: React.FC<DiscordChannelIntroProps> = ( {
    channelName,
    canEdit = true,
    onEdit
} ) => (
    <div className="discord-channel-intro">
        <div className="discord-channel-intro-icon">
            { /* Discord's own speech bubble, at the 42px it draws it inside a 68px circle. */ }
            <svg width="42" height="42" viewBox="0 0 24 24" aria-hidden="true">
                <path
                    fill="currentColor"
                    d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z"
                />
            </svg>
        </div>

        <h3 className="discord-channel-intro-heading">Welcome to { channelName }!</h3>

        <div className="discord-channel-intro-subtitle">
            This is the start of the { channelName } channel.
        </div>

        { canEdit && (
            <div className="discord-channel-intro-actions">
                { /* Discord's own pencil, copied off the button it draws: a single monochrome path
                     at 16px taking the label's colour, not the coloured emoji it looks like. */ }
                <DiscordButton
                    variant="secondary"
                    icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                                fill="currentColor"
                                d="m13.96 5.46 4.58 4.58a1 1 0 0 0 1.42 0l1.38-1.38a2 2 0 0 0
                                   0-2.82l-3.18-3.18a2 2 0 0 0-2.82 0l-1.38 1.38a1 1 0 0 0 0
                                   1.42ZM2.11 20.16l.73-4.22a3 3 0 0 1 .83-1.61l7.87-7.87a1 1 0 0 1
                                   1.42 0l4.58 4.58a1 1 0 0 1 0 1.42l-7.87 7.87a3 3 0 0 1-1.6.83l-4.23.73a1.5
                                   1.5 0 0 1-1.73-1.73Z"
                            />
                        </svg>
                    }
                    label="Edit Channel"
                    onClick={ onEdit }
                />
            </div>
        ) }
    </div>
);

export default DiscordChannelIntro;
