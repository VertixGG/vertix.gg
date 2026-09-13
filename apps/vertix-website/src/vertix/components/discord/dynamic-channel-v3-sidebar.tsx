import * as React from "react";

import { DiscordChannelList } from "@vertix.gg/discord-ui";

import type { DiscordChannelListItem } from "@vertix.gg/discord-ui";

/**
 * The channel list every v3 demonstration sits beside.
 *
 * All of them show the same corner of the same server: the generator you walk into, and the one
 * channel it made for you. Only that second row differs from page to page, so a page hands over
 * that row and nothing else - and a page where the channel can disappear from the list altogether,
 * which is what Hidden does in Privacy, hands over nothing.
 */
export interface DynamicChannelV3SidebarProps {
    channel?: Omit<DiscordChannelListItem, "id">;
}

export const DynamicChannelV3Sidebar: React.FC<DynamicChannelV3SidebarProps> = ( { channel } ) => (
    <DiscordChannelList
        title="༄ Dynamic Channels"
        collapsible={ true }
        channels={ [
            { id: "generator", name: "＋ New Channel" },
            ...( channel ? [ { id: "dynamic-channel", ...channel } ] : [] )
        ] }
    />
);

export default DynamicChannelV3Sidebar;
