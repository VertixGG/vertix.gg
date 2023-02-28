import {
    CategoryChannel,
    CategoryCreateChannelOptions,
    Channel,
    ChannelType,
    Guild,
    VoiceState
} from "discord.js";

/* Master channel */

export interface IMasterChannelCreateArgs {
    guild: Guild,
    name?: string
}

export interface IMasterChanelCreateDynamicArgs {
    oldState: VoiceState,
    newState: VoiceState,
    guild: Guild
    displayName: string,
}

/* Generic */

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

/* Channel */

export interface IChannelCreateArgs extends CategoryCreateChannelOptions {
    guild: Guild,
    parent? : CategoryChannel;
    ownerId?: string,
    isMaster?: boolean;
    isDynamic?: boolean;
}

export interface IChannelDeleteArgs {
    guild: Guild,
    channelName: string,
    channel: Channel,
}
