import type { GuildChannel, User as DiscordUser } from "discord.js";

import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";

import type { Channel as ChannelDB, ChannelData as ChannelDataDB, GuildData as GuildDataDB } from "@vertix.gg/base/src/prisma-bot-client";

export interface APIDataTypeGenericError {
    error: true,
    code?: number,
    message: string
}

export interface APIDataTypeMasterChannel {
    dataDB: ChannelDataDB[],
    channelDB: ChannelDB,

    dynamicChannelsDB: ChannelDB[],

    channelDS: GuildChannel,
    userOwnerDS: DiscordUser,
}

export interface APIDataTypeGuild {
    guildRS: RESTAPIPartialCurrentUserGuild,
    masterChannelsAP: APIDataTypeMasterChannel[],
    dataDB: GuildDataDB[],
}

export type APIDataTypeGetGuilds = APIDataTypeGenericError | APIDataTypeGuild[];
export type APIDataTypeGetGuild = APIDataTypeGenericError | APIDataTypeGuild;
