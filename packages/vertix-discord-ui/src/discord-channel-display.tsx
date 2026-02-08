import * as React from "react";

import "./styles/discord-channel-display.css";

import { DiscordChannelList   } from "./discord-channel-list";

import { cn } from "@vertix.gg/discord-ui/src/lib/utils";

import type { DiscordChannelListProps, DiscordChannelListItem } from "./discord-channel-list";

export interface DiscordChannelDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
    categoryName?: string;
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
    categoryName = "༄ Auto Scaling Channels",
    masterChannel,
    scaledChannels = [],
    showMasterChannel = true,
    channelListProps,
    className,
    ...props
} ) => {
    const masterChannelItem: DiscordChannelListItem | null = masterChannel && showMasterChannel ? {
        id: "master",
        name: masterChannel.name,
        active: masterChannel.active ?? false,
        userCount: masterChannel.userCount ?? 0,
        maxUsers: 0
    } : null;

    const allChannels: DiscordChannelListItem[] = [
        ...( masterChannelItem ? [ masterChannelItem ] : [] ),
        ...scaledChannels
    ];

    return (
        <div className={ cn( "discord-channel-display", className ) } { ...props }>
            <DiscordChannelList
                { ...channelListProps }
                title={ categoryName }
                collapsible={ channelListProps?.collapsible ?? true }
                showAddButton={ channelListProps?.showAddButton ?? true }
                channels={ allChannels }
            />
        </div>
    );
};

export default DiscordChannelDisplay;
