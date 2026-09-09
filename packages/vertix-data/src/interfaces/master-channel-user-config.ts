import type { ChannelState, ChannelVisibilityState } from "@vertix.gg/definitions/src/dynamic-channel-definitions";

export interface MasterChannelUserDataInterface {
    dynamicChannelName: string;
    dynamicChannelUserLimit: number;
    dynamicChannelState: ChannelState;
    dynamicChannelVisibilityState: ChannelVisibilityState;
    dynamicChannelAllowedUserIds: string[];
    dynamicChannelBlockedUserIds: string[];
    dynamicChannelRegion: string;
    dynamicChannelPrimaryMessage: {
        title?: string;
        description?: string;
    };
}
