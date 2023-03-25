import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import {
    CategoryChannel,
    CategoryCreateChannelOptions,
    Guild,
    NonThreadGuildBasedChannel,
    VoiceState
} from "discord.js";

/* Master channel */

export interface IMasterChannelCreateDefaultMasters {
    dynamicChannelNameTemplate?: string,
    badwords?: string[],
}

export interface IMasterChannelCreateArgs extends IMasterChannelCreateDefaultMasters {
    parent: CategoryChannel,
    guild: Guild,
    name?: string
    userOwnerId: string,
}

export interface IMasterChannelCreateDynamicArgs {
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
    userOwnerId: string,
    ownerChannelId?: string,
    internalType: E_INTERNAL_CHANNEL_TYPES,
}

export interface IChannelDeleteArgs {
    guild: Guild,
    channel: NonThreadGuildBasedChannel,
}
