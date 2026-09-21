import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { ChannelType, Client, GatewayIntentBits } from "discord.js";

import { ownsGuild } from "@vertix.gg/bot/src/definitions/sharding";

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

const EXCLUDED_GUILD_IDS_ENV_KEY = "DEV_GUILD_ID";

const EXCLUDED_GUILD_IDS_SEPARATOR = ",";

/**
 * What asking discord about something that may have been deleted actually told us.
 *
 * Three answers rather than two. `gone` is discord saying the thing does not exist; `unreachable` is
 * discord not answering at all - a rate limit, a bad minute, a request that never arrived. Both used
 * to arrive as `null`, and `null` meant delete, so a hiccup part way through a sweep took rows for
 * guilds and channels that were perfectly alive - and `ChannelData` cascades, so a server's settings
 * went with them.
 *
 * Nothing is lost by declining to decide: the row is looked at again on the next sweep.
 */
type TLookup<TValue> =
    | { state: "found"; value: TValue }
    | { state: "gone" }
    | { state: "unreachable" };

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

    private getExcludedGuildIds(): string[] {
        return ( process.env[ EXCLUDED_GUILD_IDS_ENV_KEY ] ?? "" )
            .split( EXCLUDED_GUILD_IDS_SEPARATOR )
            .map( ( guildId ) => guildId.trim() )
            .filter( ( guildId ) => guildId.length > 0 );
    }

    private getGuildExclusionFilter(): { guildId?: { notIn: string[] } } {
        const excludedGuildIds = this.getExcludedGuildIds();

        if ( ! excludedGuildIds.length ) {
            return {};
        }

        return { guildId: { notIn: excludedGuildIds } };
    }

    /**
     * Function lookup() :: Asks discord about something, and says which of three answers it gave.
     *
     * `goneCode` is the one refusal that means the thing is not there - an unknown guild, an unknown
     * channel. Anything else is discord failing to answer, which says nothing about whether the row
     * should live, so it is reported as such rather than read as a deletion.
     */
    private async lookup<TValue>( fetch: () => Promise<TValue>, goneCode: number ): Promise<TLookup<TValue>> {
        try {
            return { state: "found", value: await fetch() };
        } catch( error ) {
            if ( goneCode === ( error as DiscordAPIError )?.code ) {
                return { state: "gone" };
            }

            this.logger.error( this.lookup, "", error );

            return { state: "unreachable" };
        }
    }

    private async removeNonExistentChannelsByType( client: Client, channelType: PrismaBot.E_INTERNAL_CHANNEL_TYPES ) {
        const prisma = PrismaBotClient.$.getClient();

        const channels = await prisma.channel.findMany( {
            where: {
                internalType: channelType,
                ... this.getGuildExclusionFilter()
            },
            select: {
                id: true,
                guildId: true,
                channelId: true
            }
        } );

        // The rows come from the database, which knows nothing about shards, so this list names
        // every guild the bot has ever had a channel in. Left unfiltered, every process cleans the
        // whole database - the same rest calls and the same deletions done once per shard - and
        // `guilds.fetch()` below drags each of those guilds into a cache that was sharded not to
        // hold them. Filtered, the shards divide the work and together still cover all of it.
        const owned = channels.filter( ( channel ) => ownsGuild( channel.guildId ) );

        this.logger.info(
            this.removeNonExistentChannelsByType,
            `Found ${ channels.length } channels of type '${ channelType }' to check` +
            ( owned.length === channels.length ? "." : `, ${ owned.length } of them on this shard.` )
        );

        if ( !owned.length ) {
            return;
        }

        let deletedCount = 0;
        let skippedCount = 0;
        let currentIndex = 0;
        let startTime = Date.now();

        while ( currentIndex < owned.length ) {
            const chunkEndIndex = Math.min( currentIndex + CHUNK_SIZE, owned.length );
            const chunk = owned.slice( currentIndex, chunkEndIndex );

            const deletePromises = chunk.map( async( channel ) => {
                try {
                    const guild = await this.lookup(
                        () => client.guilds.fetch( channel.guildId ),
                        DISCORD_ERROR_UNKNOWN_GUILD
                    );

                    if ( "unreachable" === guild.state ) {
                        ++skippedCount;

                        return;
                    }

                    if ( "gone" === guild.state ) {
                        await prisma.channel.deleteMany( { where: { id: channel.id } } );
                        ++deletedCount;

                        this.logger.info(
                            this.removeNonExistentChannelsByType,
                            `Guild not found - Channel '${ channel.channelId }' (${ channelType }) deleted from db.`
                        );

                        return;
                    }

                    const discordChannel = await this.lookup(
                        () => guild.value.channels.fetch( channel.channelId ),
                        DISCORD_ERROR_UNKNOWN_CHANNEL
                    );

                    if ( "unreachable" === discordChannel.state ) {
                        ++skippedCount;

                        return;
                    }

                    // `channels.fetch` answers with null for a channel that is not there rather than
                    // throwing, so a found-but-empty answer means gone just as much as the throw does.
                    if ( "gone" === discordChannel.state || !discordChannel.value ) {
                        await prisma.channel.deleteMany( { where: { id: channel.id } } );
                        ++deletedCount;

                        this.logger.info(
                            this.removeNonExistentChannelsByType,
                            `Channel '${ channel.channelId }' (${ channelType }) not found in Discord, deleted from db.`
                        );
                    }
                } catch( error ) {
                    ++skippedCount;

                    this.logger.error( this.removeNonExistentChannelsByType, "", error );
                }
            } );

            await Promise.all( deletePromises );

            currentIndex += CHUNK_SIZE;
            const elapsedTime = Date.now() - startTime;

            if ( elapsedTime < CHUNK_TIME_LIMIT && currentIndex < owned.length ) {
                const delay = Math.max( CHUNK_DELAY - elapsedTime, 0 );
                await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
            }

            startTime = Date.now();
        }

        this.logger.info(
            this.removeNonExistentChannelsByType,
            `Completed cleanup for '${ channelType }': ${ deletedCount }/${ owned.length } channels removed` +
                ( skippedCount ? `, ${ skippedCount } left alone because discord could not be asked.` : "." )
        );
    }

    private async removeEmptyCategories( client: Client ) {
        const prisma = PrismaBotClient.$.getClient();

        const categories = await prisma.category.findMany( {
            where: this.getGuildExclusionFilter()
        } );

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
                },
                ... this.getGuildExclusionFilter()
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

        /**
         * Last, and the only one that was never swept.
         *
         * A control panel is written as a default channel, so every generator ever made leaves one of
         * these behind when its channel goes - and nothing collected them. A guild the end-to-end
         * suite runs against had a hundred and nineteen, one per run.
         *
         * It is also where a row lands when nothing said what it was: the column defaults to this, so
         * anything written before the column meant anything reads as a default channel whatever it
         * actually is. Sweeping on "discord says this channel does not exist" is the same question for
         * all of them, and it is only asked of rows whose channel is genuinely gone - but it is the
         * reason this one is worth being careful about, and the reason it goes last.
         */
        await this.removeNonExistentChannelsByType( client, PrismaBot.E_INTERNAL_CHANNEL_TYPES.DEFAULT_CHANNEL );
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
