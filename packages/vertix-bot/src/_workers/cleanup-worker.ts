import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ChannelType, Client, GatewayIntentBits } from "discord.js";

import type { DiscordAPIError } from "discord.js";

import type { default as loginType } from "@vertix.gg/base/src/discord/login";

import type { CategoryManager as CategoryManagerType } from "@vertix.gg/bot/src/managers/category-manager";

import type { PrismaBotClient as PrismaBotClientType } from "@vertix.gg/prisma/bot-client";

let login: typeof loginType;
let PrismaBotClient: typeof PrismaBotClientType;
let CategoryManager: typeof CategoryManagerType;

const CHUNK_SIZE = 100;
const CHUNK_DELAY = 2000;
const CHUNK_TIME_LIMIT = 20000;

const DISCORD_ERROR_UNKNOWN_CHANNEL = 10003;
const DISCORD_ERROR_UNKNOWN_GUILD = 10004;

class CleanupWorker extends InitializeBase {
    private static instance: CleanupWorker;

    public static getName() {
        return "VertixBot/Workers/CleanupWorker";
    }

    public static getInstance() {
        if ( !CleanupWorker.instance ) {
            CleanupWorker.instance = new CleanupWorker();
        }

        return CleanupWorker.instance;
    }

    public static get $() {
        return CleanupWorker.getInstance();
    }

    private async removeNonExistentChannelsByType( client: Client, channelType: PrismaBot.E_INTERNAL_CHANNEL_TYPES ) {
        const prisma = PrismaBotClient.$.getClient();

        const channels = await prisma.channel.findMany( {
            where: {
                internalType: channelType
            },
            select: {
                id: true,
                guildId: true,
                channelId: true
            }
        } );

        this.logger.info(
            this.removeNonExistentChannelsByType,
            `Found ${ channels.length } channels of type '${ channelType }' to check.`
        );

        if ( !channels.length ) {
            return;
        }

        let deletedCount = 0;
        let currentIndex = 0;
        let startTime = Date.now();

        while ( currentIndex < channels.length ) {
            const chunkEndIndex = Math.min( currentIndex + CHUNK_SIZE, channels.length );
            const chunk = channels.slice( currentIndex, chunkEndIndex );

            const deletePromises = chunk.map( async( channel ) => {
                try {
                    const guild = await client.guilds
                        .fetch( channel.guildId )
                        .catch( ( error: DiscordAPIError ) => {
                            if ( error.code === DISCORD_ERROR_UNKNOWN_GUILD ) {
                                return null;
                            }

                            this.logger.error( this.removeNonExistentChannelsByType, "", error );
                            return null;
                        } );

                    if ( !guild ) {
                        await prisma.channel.deleteMany( { where: { id: channel.id } } );
                        ++deletedCount;

                        this.logger.info(
                            this.removeNonExistentChannelsByType,
                            `Guild not found - Channel '${ channel.channelId }' (${ channelType }) deleted from db.`
                        );

                        return;
                    }

                    const discordChannel = await guild.channels
                        .fetch( channel.channelId )
                        .catch( ( error: DiscordAPIError ) => {
                            if ( error.code === DISCORD_ERROR_UNKNOWN_CHANNEL ) {
                                return null;
                            }

                            this.logger.error( this.removeNonExistentChannelsByType, "", error );
                            return null;
                        } );

                    if ( !discordChannel ) {
                        await prisma.channel.deleteMany( { where: { id: channel.id } } );
                        ++deletedCount;

                        this.logger.info(
                            this.removeNonExistentChannelsByType,
                            `Channel '${ channel.channelId }' (${ channelType }) not found in Discord, deleted from db.`
                        );
                    }
                } catch( error ) {
                    this.logger.error( this.removeNonExistentChannelsByType, "", error );
                }
            } );

            await Promise.all( deletePromises );

            currentIndex += CHUNK_SIZE;
            const elapsedTime = Date.now() - startTime;

            if ( elapsedTime < CHUNK_TIME_LIMIT && currentIndex < channels.length ) {
                const delay = Math.max( CHUNK_DELAY - elapsedTime, 0 );
                await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
            }

            startTime = Date.now();
        }

        this.logger.info(
            this.removeNonExistentChannelsByType,
            `Completed cleanup for '${ channelType }': ${ deletedCount }/${ channels.length } channels removed.`
        );
    }

    private async removeEmptyCategories( client: Client ) {
        const prisma = PrismaBotClient.$.getClient();

        const categories = await prisma.category.findMany();

        let currentIndex = 0;
        let startTime = Date.now();

        while ( currentIndex < categories.length ) {
            const chunkEndIndex = Math.min( currentIndex + CHUNK_SIZE, categories.length );
            const chunk = categories.slice( currentIndex, chunkEndIndex );

            const deletePromises = chunk.map( async( category ) => {
                const fetchResult = await client.guilds
                    .fetch( category.guildId )
                    .catch( async( error: DiscordAPIError ) => {
                        if ( error.code === DISCORD_ERROR_UNKNOWN_GUILD ) {
                            await prisma.category.delete( {
                                where: {
                                    id: category.id
                                }
                            } );

                            this.logger.info(
                                this.removeEmptyCategories,
                                `Unknown Guild - Category id: '${ category.categoryId }' is deleted from db.`
                            );

                            return null;
                        }

                        this.logger.error( this.removeEmptyCategories, "", error );
                        return null;
                    } );

                if ( !fetchResult ) {
                    return;
                }

                const categoryFetch = fetchResult.channels.cache.get( category.categoryId );

                if ( categoryFetch?.type === ChannelType.GuildCategory ) {
                    if ( categoryFetch.children.cache.size === 0 ) {
                        await CategoryManager.$.delete( categoryFetch ).catch( ( error: Error ) => {
                            this.logger.error( this.removeEmptyCategories, "", error );
                        } );
                    }
                } else {
                    await prisma.category.delete( {
                        where: {
                            id: category.id
                        }
                    } );

                    this.logger.info(
                        this.removeEmptyCategories,
                        `Category id: '${ category.categoryId }' is deleted from database`
                    );
                }
            } );

            await Promise.all( deletePromises );

            currentIndex += CHUNK_SIZE;
            const elapsedTime = Date.now() - startTime;

            if ( elapsedTime < CHUNK_TIME_LIMIT && currentIndex < categories.length ) {
                const delay = Math.max( CHUNK_DELAY - elapsedTime, 0 );
                await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
            }

            startTime = Date.now();
        }

        this.logger.info( this.removeEmptyCategories, "Empty categories deletion completed." );
    }

    private async getGuildsDidntUpdateRecently( prisma: ReturnType<( typeof PrismaBotClient.$ )[ "getClient" ]> ) {
        return prisma.guild.findMany( {
            where: {
                updatedAtInternal: {
                    lt: new Date( Date.now() - 30 * 24 * 60 * 60 * 1000 )
                }
            },
            select: {
                id: true,
                guildId: true,
                name: true,
                updatedAt: true,
                updatedAtInternal: true
            }
        } );
    }

    private async removeNonExistentChannels( client: Client ) {
        await this.removeNonExistentChannelsByType( client, PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL );
        await this.removeNonExistentChannelsByType( client, PrismaBot.E_INTERNAL_CHANNEL_TYPES.MASTER_SCALING_CHANNEL );
        await this.removeNonExistentChannelsByType( client, PrismaBot.E_INTERNAL_CHANNEL_TYPES.DYNAMIC_CHANNEL );
        await this.removeNonExistentChannelsByType( client, PrismaBot.E_INTERNAL_CHANNEL_TYPES.SCALING_CHANNEL );
    }

    private async handleGuilds( client: Client ) {
        const prisma = PrismaBotClient.$.getClient();

        const guilds = await this.getGuildsDidntUpdateRecently( prisma );

        const GUILDS_CHUNK_SIZE = 20;

        let count = 0;
        let currentIndex = 0;
        let startTime = Date.now();

        const totalStartTime = Date.now();

        while ( currentIndex < guilds.length ) {
            const chunkEndIndex = Math.min( currentIndex + GUILDS_CHUNK_SIZE, guilds.length );
            const chunk = guilds.slice( currentIndex, chunkEndIndex );

            const updatePromises = chunk.map( async( guild ) => {
                const guildCache = client?.guilds.cache.get( guild.guildId );
                const name = guildCache?.name || guild.name;
                const isInGuild = !!guildCache;

                await prisma.guild.update( {
                    where: {
                        id: guild.id
                    },
                    data: {
                        name,
                        isInGuild,
                        updatedAt: guild.updatedAt,
                        updatedAtInternal: new Date()
                    }
                } );

                ++count;

                this.logger.info(
                    this.handleGuilds,
                    `Guild id: '${ guild.guildId }' - Updated, name: '${ name }', isInGuild: '${ isInGuild }'`
                );
            } );

            await Promise.all( updatePromises );

            currentIndex += GUILDS_CHUNK_SIZE;
            const elapsedTime = Date.now() - startTime;

            if ( elapsedTime < CHUNK_TIME_LIMIT && currentIndex < guilds.length ) {
                const delay = Math.max( CHUNK_DELAY - elapsedTime, 0 );
                await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
            }

            startTime = Date.now();
        }

        const totalElapsedTime = Date.now() - totalStartTime,
            totalForEachChunk = ( totalElapsedTime / guilds.length ).toFixed( 4 );

        this.logger.info(
            this.handleGuilds,
            `${ count } guild are updates it toke: ${ totalElapsedTime }ms` +
            ( count ? `in ${ GUILDS_CHUNK_SIZE } chunk(s) with ${ totalForEachChunk }ms approximately for each chunk.` : "" )
        );
    }

    private async handleChannels( client: Client ) {
        await this.removeNonExistentChannels( client );
        await this.removeEmptyCategories( client );

        this.logger.info( this.handleChannels, "All channels are handled." );
    }

    public async handle( existingClient?: Client ) {
        this.logger.info( this.handle, "Cleanup worker started." );

        if ( !PrismaBotClient ) {
            PrismaBotClient = ( await import( "@vertix.gg/prisma/bot-client" ) ).PrismaBotClient;
        }

        if ( existingClient ) {
            await this.removeNonExistentChannels( existingClient );
        } else {
            login = ( await import( "@vertix.gg/base/src/discord/login" ) ).default;
            CategoryManager = ( await import( "@vertix.gg/bot/src/managers/category-manager" ) ).CategoryManager;

            const client = new Client( {
                intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ]
            } );

            await login( client, async() => {
                await this.removeNonExistentChannels( client );
                // await this.handleChannels( client );
                // await this.handleGuilds( client );
            } );
        }

        this.logger.info( this.handle, "Cleanup worker finished." );
    }
}

export { CleanupWorker };

export async function initWorker( _args = [] ) {
    return CleanupWorker.$.handle().catch( ( e ) => {
        throw e;
    } );
}
