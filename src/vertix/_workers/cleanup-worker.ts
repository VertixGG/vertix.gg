import { expose } from "threads/worker";

import { ChannelType, Client, Partials, VoiceChannel } from "discord.js";

import { E_INTERNAL_CHANNEL_TYPES } from ".prisma/client";

import login from "@vertix/login";

import { ChannelManager } from "@vertix/managers/channel-manager";
import { CategoryManager } from "@vertix/managers/category-manager";

import { PrismaInstance } from "@internal/prisma";
import { InitializeBase } from "@internal/bases";

class CleanupWorker extends InitializeBase {
    private static instance: CleanupWorker;

    public static getName() {
        return "Vertix/Workers/CleanupWorker";
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

    private async removeEmptyDynamicChannelsBasic( client: Client ) {
        // Get all dynamic channels.
        const prisma = await PrismaInstance.getClient(),
            channelsDB = await prisma.channel.findMany( {
                where: {
                    internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL
                }
            } );

        for ( const channel of channelsDB ) {
            const guildCache = client.guilds.cache.get( channel.guildId ),
                channelCache = guildCache?.channels.cache.get( channel.channelId );

            if ( guildCache && channelCache?.members && channelCache.isVoiceBased() ) {
                if ( 0 === channelCache.members.size ) {
                    await ChannelManager.$.delete( {
                        channel: channelCache,
                        guild: guildCache,
                    } );
                }

                continue;
            }

            // Delete only from db.
            await prisma.channel.delete( {
                where: {
                    id: channel.id
                },
                include: {
                    data: true
                }
            } );

            this.logger.info( this.removeEmptyDynamicChannelsBasic,
                `Dynamic Channel id: '${ channel.channelId }' is deleted from db.`
            );
        }
    }

    private async removeEmptyDynamicChannels( client: Client ) {
        const prisma = await PrismaInstance.getClient();

        const channels = await prisma.channel.findMany( {
            where: {
                internalType: E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL,
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
                    const channelCache = guildCache.channels.cache.get( channel.channelId ) as VoiceChannel;
                    if ( channelCache?.members && channelCache.members.size === 0 ) {
                        await ChannelManager.$.delete( {
                            channel: channelCache,
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

    private async removeNonExistMasterChannelsFromDBBasic( client: Client ) {
        // Remove non-existing master channels.
        const prisma = await PrismaInstance.getClient(),
            masterChannels = await prisma.channel.findMany( {
                where: {
                    internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL
                }
            } );

        for ( const channel of masterChannels ) {
            const guildCache = client.guilds.cache.get( channel.guildId ),
                channelCache = guildCache?.channels.cache.get( channel.channelId );

            if ( ! guildCache || ! channelCache ) {
                await prisma.channel.delete( {
                    where: {
                        id: channel.id
                    }
                } );

                this.logger.info( this.removeNonExistMasterChannelsFromDBBasic,
                    `Master channel id: '${ channel.channelId }' is deleted from db.`
                );
            }
        }
    }

    private async removeNonExistMasterChannelsFromDB( client: Client ) {
        const prisma = await PrismaInstance.getClient();

        const masterChannels = await prisma.channel.findMany( {
            where: {
                internalType: E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
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
                const guildCache = client.guilds.cache.get( channel.guildId );
                const channelCache = guildCache?.channels.cache.get( channel.channelId );

                if ( ! guildCache || ! channelCache ) {
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

    private async removeEmptyCategoriesBasic( client: Client ) {
        // Get all dynamic channels.
        const prisma = await PrismaInstance.getClient(),
            categories = await prisma.category.findMany();

        for ( const category of categories ) {
            const categoryCache = client.guilds.cache.get( category.guildId )?.channels.cache.get( category.categoryId );

            if ( ChannelType.GuildCategory === categoryCache?.type ) {
                if ( 0 === categoryCache.children.cache.size ) {
                    await CategoryManager.$.delete( categoryCache ).catch( ( error: any ) => {
                        this.logger.error( this.removeEmptyCategoriesBasic, "", error );
                    } );
                }

                continue;
            }

            // Delete only from db.
            await prisma.category.delete( {
                where: {
                    id: category.id
                }
            } );

            this.logger.info( this.removeEmptyCategoriesBasic,
                `Category id: '${ category.categoryId }' is deleted from database`
            );
        }
    }

    private async removeEmptyCategories( client: Client ) {
        const prisma = await PrismaInstance.getClient();

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
                const categoryCache = client.guilds.cache
                    .get( category.guildId )
                    ?.channels.cache.get( category.categoryId );

                if ( categoryCache?.type === ChannelType.GuildCategory ) {
                    if ( categoryCache.children.cache.size === 0 ) {
                        await CategoryManager.$.delete( categoryCache ).catch( ( error: any ) => {
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

    private async updateGuildsBasic( client: Client ) {
        // Get all guilds.
        const prisma = await PrismaInstance.getClient(),
            guilds = await prisma.guild.findMany();

        for ( const guild of guilds ) {
            // Check if the guild is active.
            const guildCache = client?.guilds.cache.get( guild.guildId ),
                name = guildCache?.name || guild.name,
                isInGuild = !! guildCache;

            await prisma.guild.update( {
                where: {
                    id: guild.id
                },
                data: {
                    name,
                    isInGuild,
                    // Do not update `updatedAt` field.
                    updatedAt: guild.updatedAt,
                    updatedAtInternal: new Date(),
                },
            } ).then( () => {
                this.logger.info( this.updateGuilds,
                    `Guild id: '${ guild.guildId }' - Updated, name: '${ name }', isInGuild: '${ isInGuild }'`
                );
            } );
        }
    }

    private async updateGuilds( client: Client ) {
        const prisma = await PrismaInstance.getClient();

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
                "GuildIntegrations",
                "GuildInvites",
                // "GuildMembers",
                "Guilds",
                "GuildVoiceStates",
                "DirectMessages",
            ],
            partials: [
                Partials.Channel,
            ]
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
