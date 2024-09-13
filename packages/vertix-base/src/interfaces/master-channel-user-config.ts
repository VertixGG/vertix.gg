import type { ChannelState, ChannelVisibilityState } from "@vertix.gg/bot/src/definitions/dynamic-channel";

export interface MasterChannelUserDataInterface {
    dynamicChannelName: string,
    dynamicChannelUserLimit: number,
    dynamicChannelState: ChannelState,
    dynamicChannelVisibilityState: ChannelVisibilityState,
    dynamicChannelAllowedUserIds: string[],
    dynamicChannelBlockedUserIds: string[],
    dynamicChannelRegion: string,
    dynamicChannelPrimaryMessage: {
        title?: string,
        description?: string,
    }
}
