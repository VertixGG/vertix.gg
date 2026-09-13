import React from "react";

import "@vertix.gg/discord-ui/src/styles/discord-app-frame.css";

import { DiscordChannelIntro } from "@vertix.gg/discord-ui/src/discord-channel-intro";
import { DiscordComposer } from "@vertix.gg/discord-ui/src/discord-composer";
import { DiscordDateDivider } from "@vertix.gg/discord-ui/src/discord-date-divider";

export interface DiscordAppFrameProps {
    /** The channel list, down the left, as Discord puts it. */
    sidebar?: React.ReactNode;
    /**
     * Opens the channel from its very beginning: the mark, the welcome, and the day the first
     * messages fall on.
     *
     * Given, because a demonstration showing a channel with nothing above its first message is
     * showing a channel at its start, and Discord never shows one without this. Left out where the
     * panel is the subject and the room around it would only be in the way.
     */
    channelName?: string;
    /** The day the messages below carry, worded as Discord words it. Defaults to today. */
    channelDate?: string;
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
export function DiscordAppFrame( { sidebar, channelName, channelDate, children, className }: DiscordAppFrameProps ) {
    return (
        <div className={ className ? `discord-app-frame ${ className }` : "discord-app-frame" }>
            { sidebar && <div className="discord-app-frame-sidebar">{ sidebar }</div> }

            <div className="discord-app-frame-main">
                { channelName && (
                    <>
                        <DiscordChannelIntro channelName={ channelName }/>
                        <DiscordDateDivider date={ channelDate }/>
                    </>
                ) }

                { children }

                { channelName && <DiscordComposer channelName={ channelName }/> }
            </div>
        </div>
    );
}
