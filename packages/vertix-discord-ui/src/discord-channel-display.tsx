import * as React from "react";

import { cn } from "@vertix.gg/discord-ui/src/lib/utils";

import "./styles/discord-channel-display.css";

import { DiscordChannelList, type DiscordChannelListProps, type DiscordChannelListItem } from "./discord-channel-list";

export interface DiscordChannelDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    masterChannel?: {
        name: string;
        active?: boolean;
        userCount?: number;
    };
    scaledChannels?: DiscordChannelListItem[];
    showMasterChannel?: boolean;
    channelListProps?: Omit<DiscordChannelListProps, "channels" | "className" | "title" | "iconEmoji">;
}

export const DiscordChannelDisplay: React.FC<DiscordChannelDisplayProps> = ( {
    masterChannel,
    scaledChannels = [],
    showMasterChannel = true,
    channelListProps,
    className,
    ...props
} ) => {
    const masterChannelList: DiscordChannelListItem[] = masterChannel && showMasterChannel ? [
        {
            id: "master",
            name: masterChannel.name,
            active: masterChannel.active ?? false,
            userCount: masterChannel.userCount ?? 0,
            maxUsers: 0
        }
    ] : [];

    return (
        <div className={ cn( "discord-channel-display", className ) } { ...props }>
            { masterChannel && showMasterChannel && (
                <DiscordChannelList
                    { ...channelListProps }
                    title="Voice Channels"
                    iconEmoji="🔊"
                    collapsible={ false }
                    channels={ masterChannelList }
                    className="discord-channel-display-master"
                />
            ) }
            { scaledChannels.length > 0 && (
                <DiscordChannelList
                    { ...channelListProps }
                    title="Auto Scaling Channels"
                    iconEmoji="≈"
                    collapsible={ channelListProps?.collapsible ?? true }
                    showAddButton={ channelListProps?.showAddButton ?? false }
                    channels={ scaledChannels }
                    className="discord-channel-display-scaled"
                />
            ) }
        </div>
    );
};

export default DiscordChannelDisplay;
