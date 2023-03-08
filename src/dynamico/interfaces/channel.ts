import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import {
    CategoryChannel,
    CategoryCreateChannelOptions,
    Guild,
    NonThreadGuildBasedChannel,
    VoiceState
} from "discord.js";

/* Master channel */

export interface IMasterChannelCreateArgs {
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

// TODO: Should be at data-channel-manager.
/* Channel data */

export interface IChannelDataCreateArgs {
    id: string,
    key: string,
    value: string|string[],
    type?: string,
}

export interface IChannelDataGetArgs {
    cache?: boolean,
    type?: string,

    default: string,
    key: string,

    masterChannelId: string,
}
