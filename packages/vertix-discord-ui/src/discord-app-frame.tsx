import React from "react";

import "@vertix.gg/discord-ui/src/styles/discord-app-frame.css";

export interface DiscordAppFrameProps {
    /** The channel list, down the left, as Discord puts it. */
    sidebar?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

/**
 * Discord, as much of it as a demonstration needs: the channels on one side and the channel you are
 * in on the other.
 *
 * What a feature does to the sidebar is half of what it does - a status is a line under a channel
 * name in that list - so showing the message without the list beside it leaves out the result.
 */
export function DiscordAppFrame( { sidebar, children, className }: DiscordAppFrameProps ) {
    return (
        <div className={ className ? `discord-app-frame ${ className }` : "discord-app-frame" }>
            { sidebar && <div className="discord-app-frame-sidebar">{ sidebar }</div> }

            <div className="discord-app-frame-main">{ children }</div>
        </div>
    );
}
