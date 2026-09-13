import * as React from "react";

import "@vertix.gg/discord-ui/src/styles/discord-composer.css";

export interface DiscordComposerProps {
    /** The channel being written to, which is all the empty box says. */
    channelName: string;
}

/**
 * Function DiscordComposer() :: The box you would type into, at the foot of the channel.
 *
 * Inert, and meant to be: nothing on these pages is a channel you can talk in. It is here because a
 * channel without one ends in nothing, and the panel above it then reads as the bottom of the page
 * rather than as a message in a room.
 */
export const DiscordComposer: React.FC<DiscordComposerProps> = ( { channelName } ) => (
    <div className="discord-composer" aria-hidden="true">
        <span className="discord-composer-attach">
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M12 2a1 1 0 0 1 1 1v8h8a1 1 0 1 1 0 2h-8v8a1 1 0 1 1-2 0v-8H3a1 1 0 1 1 0-2h8V3a1 1 0 0 1 1-1Z"
                />
            </svg>
        </span>

        <span className="discord-composer-placeholder">Message { channelName }</span>

        <span className="discord-composer-actions">
            <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM8.5 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0
                       1-3 0Zm7.5-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm-8.2 6a1 1 0 0 1 1.4.2 3.9
                       3.9 0 0 0 5.6 0 1 1 0 0 1 1.6 1.2 5.9 5.9 0 0 1-8.8 0 1 1 0 0 1 .2-1.4Z"
                />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8h-5a2 2 0 0 0-2 2v5H6a2 2 0 0
                       1-2-2V5Zm11 15.5V15h5.5L15 20.5Z"
                />
            </svg>
        </span>
    </div>
);

export default DiscordComposer;
