import {
    CategoryChannel,
    CategoryCreateChannelOptions,
    Channel,
    ChannelType,
    Guild,
    VoiceState
} from "discord.js";

export interface IMasterChannelCreateArgs {
    guild: Guild,
    name?: string
}

export interface IChannelEnterGenericArgs {
    oldState: VoiceState,
    newState: VoiceState,
    displayName: string,
    channelName: string
}

export interface IChannelLeaveGenericArgs {
    oldState: VoiceState,
    newState: VoiceState,
    displayName: string,
    channelName: string
}

/* Master channel */

export interface IChannelCreateArgs extends CategoryCreateChannelOptions {
    guild: Guild,
    parent? : CategoryChannel;
    isMaster?: boolean;
    isDynamic?: boolean;
}

export interface IChannelDeleteArgs {
    guild: Guild,
    channelName: string,
    channel: Channel,
}
