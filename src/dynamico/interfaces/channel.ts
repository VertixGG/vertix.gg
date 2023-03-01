import {
    CategoryChannel,
    CategoryCreateChannelOptions,
    Channel,
    ChannelType,
    Guild,
    VoiceState
} from "discord.js";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

/* Master channel */

export interface IMasterChannelCreateArgs {
    parent: CategoryChannel,
    guild: Guild,
    name?: string
}

export interface IMasterChannelEditArgs extends IMasterChannelCreateArgs {

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
    internalType: E_INTERNAL_CHANNEL_TYPES,
}

export interface IChannelDeleteArgs {
    guild: Guild,
    channelName: string,
    channel: Channel,
}
