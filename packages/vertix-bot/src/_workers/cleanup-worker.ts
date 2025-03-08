import { fileURLToPath } from "node:url";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ensureInWorker } from "@zenflux/worker/utils";

import { ChannelType, Client, DiscordAPIError, GatewayIntentBits } from "discord.js";

import type { default as loginType } from "@vertix.gg/base/src/discord/login";

import type { ServiceLocator as ServiceLocatorType } from "@vertix.gg/base/src/modules/service/service-locator";

import type { CategoryManager as CategoryManagerType } from "@vertix.gg/bot/src/managers/category-manager";

import type { AppService as AppServiceType } from "@vertix.gg/bot/src/services/app-service";

import type { ChannelService as ChannelServiceType } from "@vertix.gg/bot/src/services/channel-service";

import type { PrismaBotClient as PrismaBotClientType } from "@vertix.gg/prisma/bot-client";

import type { ThreadHost } from "@zenflux/worker/definitions";

import type { VoiceChannel } from "discord.js";

let login: typeof loginType;
let ServiceLocator: typeof ServiceLocatorType;
let PrismaBotClient: typeof PrismaBotClientType;
let AppService: typeof AppServiceType;
let CategoryManager: typeof CategoryManagerType;
let ChannelService: typeof ChannelServiceType;

class CleanupWorker extends InitializeBase {
    private static instance: CleanupWorker;

    private channelService: ChannelServiceType;

    public static getName() {
        return "VertixBot/Workers/CleanupWorker";
    }

    public static getInstance() {
        if (!CleanupWorker.instance) {
            CleanupWorker.instance = new CleanupWorker();
        }

        return CleanupWorker.instance;
    }

    public static get $() {
        return CleanupWorker.getInstance();
    }

    private async removeDynamicChannelFromDB(
        prisma: ReturnType<(typeof PrismaBotClient.$)["getClient"]>,
        channel: any
    ) {
        await prisma.channel.delete({
            where: {
                id: channel.id
            },
            include: {
                data: true
            }
        });

        this.logger.info(
            this.removeEmptyDynamicChannels,
            `Dynamic Channel id: '${channel.channelId}' is deleted from db.`
        );
    }

    private async removeEmptyDynamicChannels(client: Client) {
        const prisma = PrismaBotClient.$.getClient();

        const channels = await prisma.channel.findMany({
            where: {
                internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL
            },
            select: {
                id: true,
                guildId: true,
                channelId: true
            }
        });

        const CHUNK_SIZE = 20;
        const CHUNK_DELAY = 2000;
        const CHUNK_TIME_LIMIT = 20000;

        let currentIndex = 0;
        let startTime = Date.now();

        while (currentIndex < channels.length) {
            const chunkStartIndex = currentIndex;
            const chunkEndIndex = Math.min(currentIndex + CHUNK_SIZE, channels.length);
            const chunk = channels.slice(chunkStartIndex, chunkEndIndex);

            const deletePromises = chunk.map(async (channel) => {
                try {
                    const guild = await client.guilds.fetch(channel.guildId);

                    const channelFetch =
                        guild &&
                        (await guild.channels
                            .fetch(channel.channelId)
                            .catch((error: any) => {
                                this.logger.error(this.removeEmptyDynamicChannels, "", error);
                                return null;
                            })
                            .then((i) => i as VoiceChannel));

                    if (!channelFetch) {
                        await this.removeDynamicChannelFromDB(prisma, channel);
                        return;
                    }

                    if (channelFetch.members && channelFetch.members.size === 0) {
                        await this.channelService.delete({
                            guild,
                            channel: channelFetch
                        });
                    }
                } catch (error: any) {
                    if (error instanceof DiscordAPIError && error.code === 10004) {
                        // Unknown Guild, remove from db
                        this.logger.info(
                            this.removeEmptyDynamicChannels,
                            `Unknown Guild (not exist anymore) - Master channel id: '${channel.channelId}' is deleted from db.`
                        );

                        await this.removeDynamicChannelFromDB(prisma, channel);
                    }

                    this.logger.error(this.removeEmptyDynamicChannels, "", error);
                }
            });

            await Promise.all(deletePromises);

            currentIndex += CHUNK_SIZE;
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if (elapsedTime < CHUNK_TIME_LIMIT && currentIndex < channels.length) {
                const delay = Math.max(CHUNK_DELAY - elapsedTime, 0);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            startTime = Date.now();
        }

        this.logger.info(this.removeEmptyDynamicChannels, "Dynamic channel deletion completed.");
    }

    private async removeNonExistMasterChannelsFromDB(client: Client) {
        const prisma = PrismaBotClient.$.getClient();

        const masterChannels = await prisma.channel.findMany({
            where: {
                internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL
            }
        });

        const CHUNK_SIZE = 100;
        const CHUNK_DELAY = 2000;
        const CHUNK_TIME_LIMIT = 20000;

        let currentIndex = 0;
        let startTime = Date.now();

        while (currentIndex < masterChannels.length) {
            const chunkStartIndex = currentIndex;
            const chunkEndIndex = Math.min(currentIndex + CHUNK_SIZE, masterChannels.length);
            const chunk = masterChannels.slice(chunkStartIndex, chunkEndIndex);

            const deletePromises = chunk.map(async (channel) => {
                try {
                    const guildFetch = await client.guilds
                        .fetch(channel.guildId)
                        .catch((error: DiscordAPIError) => {
                            if (error.code === 10004) {
                                // Unknown Guild, remove from db
                                prisma.channel.delete({
                                    where: {
                                        id: channel.id
                                    }
                                });

                                this.logger.info(
                                    this.removeNonExistMasterChannelsFromDB,
                                    `Unknown Guild (not exist anymore) - Master channel id: '${channel.channelId}' is deleted from db.`
                                );

                                return null;
                            }

                            this.logger.error(this.removeNonExistMasterChannelsFromDB, "", error);
                            return null;
                        })
                        .then((i) => i);

                    if (!guildFetch) {
                        return;
                    }

                    const channelFetch = await guildFetch?.channels
                        .fetch(channel.channelId)
                        .catch((error: any) => {
                            this.logger.error(this.removeNonExistMasterChannelsFromDB, "", error);
                            return null;
                        })
                        .then((i) => i as VoiceChannel);

                    if (!guildFetch || !channelFetch) {
                        await prisma.channel.delete({
                            where: {
                                id: channel.id
                            }
                        });

                        this.logger.info(
                            this.removeNonExistMasterChannelsFromDB,
                            `Master channel id: '${channel.channelId}' is deleted from db.`
                        );
                    }
                } catch (error) {
                    this.logger.error(this.removeNonExistMasterChannelsFromDB, "", error);
                }
            });

            await Promise.all(deletePromises);

            currentIndex += CHUNK_SIZE;
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if (elapsedTime < CHUNK_TIME_LIMIT && currentIndex < masterChannels.length) {
                const delay = Math.max(CHUNK_DELAY - elapsedTime, 0);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            startTime = Date.now();
        }

        this.logger.info(this.removeNonExistMasterChannelsFromDB, "Non-existing master channels deletion completed.");
    }

    private async removeEmptyCategories(client: Client) {
        const prisma = PrismaBotClient.$.getClient();

        const categories = await prisma.category.findMany();

        const CHUNK_SIZE = 100; // Set the desired chunk size for deletion
        const CHUNK_DELAY = 2000; // Delay in milliseconds between processing each chunk
        const CHUNK_TIME_LIMIT = 20000; // Time limit in milliseconds for processing each chunk

        let currentIndex = 0;
        let startTime = Date.now();

        while (currentIndex < categories.length) {
            const chunkStartIndex = currentIndex;
            const chunkEndIndex = Math.min(currentIndex + CHUNK_SIZE, categories.length);
            const chunk = categories.slice(chunkStartIndex, chunkEndIndex);

            const deletePromises = chunk.map(async (category) => {
                const fetchPromise = client.guilds.fetch(category.guildId);

                const fetchResult = await fetchPromise
                    .catch(async (error: DiscordAPIError) => {
                        if (error.code === 10004) {
                            // Unknown Guild, remove from db
                            await prisma.category.delete({
                                where: {
                                    id: category.id
                                }
                            });

                            this.logger.info(
                                this.removeEmptyCategories,
                                `Unknown Guild (not exist anymore) - Category id: '${category.categoryId}' is deleted from db.`
                            );

                            return null;
                        }

                        this.logger.error(this.removeEmptyCategories, "", error);
                        return null;
                    })
                    .then((i) => i);

                if (!fetchResult) {
                    return;
                }

                const categoryFetch = fetchResult.channels.cache.get(category.categoryId);

                if (categoryFetch?.type === ChannelType.GuildCategory) {
                    if (categoryFetch.children.cache.size === 0) {
                        await CategoryManager.$.delete(categoryFetch).catch((error: any) => {
                            this.logger.error(this.removeEmptyCategories, "", error);
                        });
                    }
                } else {
                    await prisma.category.delete({
                        where: {
                            id: category.id
                        }
                    });

                    this.logger.info(
                        this.removeEmptyCategories,
                        `Category id: '${category.categoryId}' is deleted from database`
                    );
                }
            });

            await Promise.all(deletePromises);

            currentIndex += CHUNK_SIZE;
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if (elapsedTime < CHUNK_TIME_LIMIT && currentIndex < categories.length) {
                const delay = Math.max(CHUNK_DELAY - elapsedTime, 0);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            startTime = Date.now();
        }

        this.logger.info(this.removeEmptyCategories, "Empty categories deletion completed.");
    }

    private async handleGuilds(client: Client) {
        const prisma = PrismaBotClient.$.getClient();

        // Find all guilds that are `updated_at` at current year.
        const guilds = await this.getGuildsDidntUpdateRecently(prisma);

        const CHUNK_SIZE = 20;
        const CHUNK_DELAY = 2000;
        const CHUNK_TIME_LIMIT = 20000;

        let count = 0;
        let currentIndex = 0;
        let startTime = Date.now();

        const totalStartTime = Date.now();

        while (currentIndex < guilds.length) {
            const chunkStartIndex = currentIndex;
            const chunkEndIndex = Math.min(currentIndex + CHUNK_SIZE, guilds.length);
            const chunk = guilds.slice(chunkStartIndex, chunkEndIndex);

            const updatePromises = chunk.map(async (guild) => {
                const guildCache = client?.guilds.cache.get(guild.guildId);
                const name = guildCache?.name || guild.name;
                const isInGuild = !!guildCache;

                await prisma.guild.update({
                    where: {
                        id: guild.id
                    },
                    data: {
                        name,
                        isInGuild,
                        updatedAt: guild.updatedAt,
                        updatedAtInternal: new Date()
                    }
                });

                ++count;

                this.logger.info(
                    this.handleGuilds,
                    `Guild id: '${guild.guildId}' - Updated, name: '${name}', isInGuild: '${isInGuild}'`
                );
            });

            await Promise.all(updatePromises);

            currentIndex += CHUNK_SIZE;
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if (elapsedTime < CHUNK_TIME_LIMIT && currentIndex < guilds.length) {
                const delay = Math.max(CHUNK_DELAY - elapsedTime, 0);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            startTime = Date.now();
        }

        const totalElapsedTime = Date.now() - totalStartTime,
            totalForEachChunk = (totalElapsedTime / guilds.length).toFixed(4);

        this.logger.info(
            this.handleGuilds,
            `${count} guild are updates it toke: ${totalElapsedTime}ms` +
                (count ? `in ${CHUNK_SIZE} chunk(s) with ${totalForEachChunk}ms approximately for each chunk.` : "")
        );
    }

    private async getGuildsDidntUpdateRecently(prisma: ReturnType<(typeof PrismaBotClient.$)["getClient"]>) {
        return prisma.guild.findMany({
            where: {
                updatedAtInternal: {
                    // Get only guilds that are not updated in the last month.
                    lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            select: {
                id: true,
                guildId: true,
                name: true,
                updatedAt: true,
                updatedAtInternal: true
            }
        });
    }

    private async handleChannels(client: Client) {
        await this.removeNonExistMasterChannelsFromDB(client);
        await this.removeEmptyDynamicChannels(client);
        await this.removeEmptyCategories(client);

        this.logger.info(this.handleChannels, "All channels are handled.");
    }

    public async handle() {
        this.logger.info(this.handle, "Channels worker thread is started.");

        PrismaBotClient = (await import("@vertix.gg/prisma/bot-client")).PrismaBotClient;

        // Load the required modules.
        login = (await import("@vertix.gg/base/src/discord/login")).default;
        ServiceLocator = (await import("@vertix.gg/base/src/modules/service/service-locator")).ServiceLocator;
        AppService = (await import("@vertix.gg/bot/src/services/app-service")).AppService;
        CategoryManager = (await import("@vertix.gg/bot/src/managers/category-manager")).CategoryManager;
        ChannelService = (await import("@vertix.gg/bot/src/services/channel-service")).ChannelService;

        ServiceLocator.$.register(AppService);
        ServiceLocator.$.register(ChannelService);

        this.channelService = ServiceLocator.$.get("VertixBot/Services/Channel");

        await ServiceLocator.$.waitForAll();

        const client = new Client({
            // Require for cleanup to work properly.
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
        });

        await login(client, async () => {
            await this.handleChannels(client);
            await this.handleGuilds(client);
        });

        this.logger.info(this.handle, "Channels worker thread is finished.");
    }
}

export function inWorker(threadHost: ThreadHost) {
    ensureInWorker();

    return CleanupWorker.$.handle().catch((e) => {
        threadHost.sendMessage("error", {
            name: e.name,
            message: e.message,
            stack: e.stack,
            code: e.code
        });
    });
}

export async function initWorker(args = []) {
    const { zCreateWorker } = await import("@zenflux/worker");

    return zCreateWorker({
        name: "clean-up-worker",
        display: CleanupWorker.getName(),

        workFilePath: fileURLToPath(import.meta.url),
        workFunction: inWorker,

        workArgs: args
    });
}
