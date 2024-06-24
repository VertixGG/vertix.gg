// @ts-ignore
import { expose } from "threads/worker";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelType, Client } from "discord.js";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import login from "@vertix.gg/base/src/discord/login";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { CategoryManager } from "@vertix.gg/bot/src/managers/category-manager";

import type { ChannelService } from "@vertix.gg/bot/src/services/channel-service";

import type { VoiceChannel } from "discord.js";

class CleanupWorker extends InitializeBase {
    private static instance: CleanupWorker;

    private channelService: ChannelService;

    public static getName() {
        return "VertixBot/Workers/CleanupWorker";
    }

    public constructor() {
        super();

        this.channelService = ServiceLocator.$.get( "VertixBot/Services/Channel" );
    }

    public static getInstance() {
        if ( ! CleanupWorker.instance ) {
            CleanupWorker.instance = new CleanupWorker();
        }

        return CleanupWorker.instance;
    }

    public static get $() {
        return CleanupWorker.getInstance();
    }

    private async removeEmptyDynamicChannels( client: Client ) {
        const prisma = PrismaBotClient.$.getClient();

        const channels = await prisma.channel.findMany( {
            where: {
                internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL,
            },
            select: {
                id: true,
                guildId: true,
                channelId: true,
            },
        } );

        const CHUNK_SIZE = 20;
        const CHUNK_DELAY = 2000;
        const CHUNK_TIME_LIMIT = 20000;

        let currentIndex = 0;
        let startTime = Date.now();

        while ( currentIndex < channels.length ) {
            const chunkStartIndex = currentIndex;
            const chunkEndIndex = Math.min( currentIndex + CHUNK_SIZE, channels.length );
            const chunk = channels.slice( chunkStartIndex, chunkEndIndex );
            const guildIds = chunk.map( ( channel ) => channel.guildId );
            const channelIds = chunk.map( ( channel ) => channel.channelId );

            const guildCaches = guildIds.map( ( guildId ) =>
                client.guilds.cache.get( guildId )
            );

            const deletePromises = chunk.map( async ( channel ) => {
                const guildCache = guildCaches[ channelIds.indexOf( channel.channelId ) ];

                if (
                    guildCache &&
                    guildCache.channels.cache.has( channel.channelId ) &&
                    guildCache.channels.cache.get( channel.channelId )?.isVoiceBased()
                ) {
                    const channelFetch = await guildCache.channels.fetch( channel.channelId ) as VoiceChannel;
                    if ( channelFetch?.members && channelFetch.members.size === 0 ) {
                        await this.channelService.delete( {
                            channel: channelFetch,
                            guild: guildCache,
                        } );
                    }
                } else {
                    await prisma.channel.delete( {
                        where: {
                            id: channel.id,
                        },
                        include: {
                            data: true,
                        },
                    } );

                    this.logger.info(
                        this.removeEmptyDynamicChannels,
                        `Dynamic Channel id: '${ channel.channelId }' is deleted from db.`
                    );
                }
            } );

            await Promise.all( deletePromises );

            currentIndex += CHUNK_SIZE;
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if ( elapsedTime < CHUNK_TIME_LIMIT && currentIndex < channels.length ) {
                const delay = Math.max( CHUNK_DELAY - elapsedTime, 0 );
                await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
            }

            startTime = Date.now();
        }

        this.logger.info( this.removeEmptyDynamicChannels, "Dynamic channel deletion completed." );
    }

    private async removeNonExistMasterChannelsFromDB( client: Client ) {
        const prisma = PrismaBotClient.$.getClient();

        const masterChannels = await prisma.channel.findMany( {
            where: {
                internalType: PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
            },
        } );

        const CHUNK_SIZE = 100;
        const CHUNK_DELAY = 2000;
        const CHUNK_TIME_LIMIT = 20000;

        let currentIndex = 0;
        let startTime = Date.now();

        while ( currentIndex < masterChannels.length ) {
            const chunkStartIndex = currentIndex;
            const chunkEndIndex = Math.min( currentIndex + CHUNK_SIZE, masterChannels.length );
            const chunk = masterChannels.slice( chunkStartIndex, chunkEndIndex );

            const deletePromises = chunk.map( async ( channel ) => {
                try {
                    const guildFetch = await client.guilds.fetch( channel.guildId );
                    const channelFetch = await guildFetch?.channels.fetch( channel.channelId )
                        .catch( () => null )
                        .then( ( i ) => i as VoiceChannel );

                    if ( ! guildFetch || ! channelFetch ) {
                        await prisma.channel.delete( {
                            where: {
                                id: channel.id,
                            },
                        } );

                        this.logger.info(
                            this.removeNonExistMasterChannelsFromDB,
                            `Master channel id: '${ channel.channelId }' is deleted from db.`
                        );
                    }
                } catch ( error ) {
                    this.logger.error( this.removeNonExistMasterChannelsFromDB, "", error );
                }
            } );

            await Promise.all( deletePromises );

            currentIndex += CHUNK_SIZE;
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if ( elapsedTime < CHUNK_TIME_LIMIT && currentIndex < masterChannels.length ) {
                const delay = Math.max( CHUNK_DELAY - elapsedTime, 0 );
                await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
            }

            startTime = Date.now();
        }

        this.logger.info( this.removeNonExistMasterChannelsFromDB, "Non-existing master channels deletion completed." );
    }

    private async removeEmptyCategories( client: Client ) {
        const prisma = PrismaBotClient.$.getClient();

        const categories = await prisma.category.findMany();

        const CHUNK_SIZE = 100; // Set the desired chunk size for deletion
        const CHUNK_DELAY = 2000; // Delay in milliseconds between processing each chunk
        const CHUNK_TIME_LIMIT = 20000; // Time limit in milliseconds for processing each chunk

        let currentIndex = 0;
        let startTime = Date.now();

        while ( currentIndex < categories.length ) {
            const chunkStartIndex = currentIndex;
            const chunkEndIndex = Math.min( currentIndex + CHUNK_SIZE, categories.length );
            const chunk = categories.slice( chunkStartIndex, chunkEndIndex );

            const deletePromises = chunk.map( async ( category ) => {
                const categoryFetch = (await client.guilds.fetch( category.guildId ))
                    ?.channels.cache.get( category.categoryId );

                if ( categoryFetch?.type === ChannelType.GuildCategory ) {
                    if ( categoryFetch.children.cache.size === 0 ) {
                        await CategoryManager.$.delete( categoryFetch ).catch( ( error: any ) => {
                            this.logger.error( this.removeEmptyCategories, "", error );
                        } );
                    }
                } else {
                    await prisma.category.delete( {
                        where: {
                            id: category.id,
                        },
                    } );

                    this.logger.info(
                        this.removeEmptyCategories,
                        `Category id: '${ category.categoryId }' is deleted from database`
                    );
                }
            } );

            await Promise.all( deletePromises );

            currentIndex += CHUNK_SIZE;
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if ( elapsedTime < CHUNK_TIME_LIMIT && currentIndex < categories.length ) {
                const delay = Math.max( CHUNK_DELAY - elapsedTime, 0 );
                await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
            }

            startTime = Date.now();
        }

        this.logger.info( this.removeEmptyCategories, "Empty categories deletion completed." );
    }

    private async updateGuilds( client: Client ) {
        const prisma = PrismaBotClient.$.getClient();

        const guilds = await prisma.guild.findMany();

        const CHUNK_SIZE = 20;
        const CHUNK_DELAY = 2000;
        const CHUNK_TIME_LIMIT = 20000;

        let currentIndex = 0;
        let startTime = Date.now();

        while ( currentIndex < guilds.length ) {
            const chunkStartIndex = currentIndex;
            const chunkEndIndex = Math.min( currentIndex + CHUNK_SIZE, guilds.length );
            const chunk = guilds.slice( chunkStartIndex, chunkEndIndex );

            const updatePromises = chunk.map( async ( guild ) => {
                const guildCache = client?.guilds.cache.get( guild.guildId );
                const name = guildCache?.name || guild.name;
                const isInGuild = !! guildCache;

                await prisma.guild.update( {
                    where: {
                        id: guild.id,
                    },
                    data: {
                        name,
                        isInGuild,
                        updatedAt: guild.updatedAt,
                        updatedAtInternal: new Date(),
                    },
                } );

                this.logger.info(
                    this.updateGuilds,
                    `Guild id: '${ guild.guildId }' - Updated, name: '${ name }', isInGuild: '${ isInGuild }'`
                );
            } );

            await Promise.all( updatePromises );

            currentIndex += CHUNK_SIZE;
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if ( elapsedTime < CHUNK_TIME_LIMIT && currentIndex < guilds.length ) {
                const delay = Math.max( CHUNK_DELAY - elapsedTime, 0 );
                await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
            }

            startTime = Date.now();
        }

        this.logger.info( this.updateGuilds, "All guild updates completed." );
    }

    private async handleChannels( client: Client ) {
        await this.removeNonExistMasterChannelsFromDB( client );
        await this.removeEmptyDynamicChannels( client );
        await this.removeEmptyCategories( client );

        this.logger.info( this.handleChannels, "All channels are handled." );
    }

    public async handle() {
        this.logger.info( this.handle, "Channels worker thread is started." );

        const client = new Client( {
            intents: [
            ],
        } );

        await login( client, async () => {
            await this.updateGuilds( client );
            await this.handleChannels( client );
        } );

        this.logger.info( this.handle, "Channels worker thread is finished." );
    }
}

expose( {
    handle: CleanupWorker.$.handle.bind( CleanupWorker.$ ),
} );
