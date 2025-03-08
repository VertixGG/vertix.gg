import type { VoiceState } from "discord.js";

/* Generic */

export interface IChannelEnterGenericArgs {
    oldState: VoiceState;
    newState: VoiceState;
    displayName: string;
    channelName: string;
}

export interface IChannelLeaveGenericArgs {
    oldState: VoiceState;
    newState: VoiceState;
    displayName: string;
    channelName: string;
}
