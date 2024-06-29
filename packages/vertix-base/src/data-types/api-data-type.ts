import "@vertix.gg/prisma/bot-client";

import type { GuildChannel, User as DiscordUser } from "discord.js";

import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";

export interface APIDataTypeGenericError {
    error: true,
    code?: number,
    message: string
}

export interface APIDataTypeMasterChannel {
    dataDB: PrismaBot.ChannelData[],
    channelDB: PrismaBot.Channel,

    dynamicChannelsDB: PrismaBot.Channel[],

    channelDS: GuildChannel,
    userOwnerDS: DiscordUser,
}

export interface APIDataTypeGuild {
    guildRS: RESTAPIPartialCurrentUserGuild,
    masterChannelsAP: APIDataTypeMasterChannel[],
    dataDB: PrismaBot.GuildData[],
}

export type APIDataTypeGetGuilds = APIDataTypeGenericError | APIDataTypeGuild[];
export type APIDataTypeGetGuild = APIDataTypeGenericError | APIDataTypeGuild;
