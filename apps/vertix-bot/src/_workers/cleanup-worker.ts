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

    /**
     * The guilds this process is actually holding, minus the ones a dev box is told to leave alone.
     *
     * This is what bounds the sweep. `ownsGuild()` answers the same question arithmetically, but it
     * answers it about a row already in hand - the query still had to read every row in the table to
     * produce one. A shard's own guild ids are a list the database can be given, and `Channel` is
     * indexed on `guildId`, so the same sweep becomes a bounded indexed read instead of a collection
     * scan repeated once per shard.
     *
     * Read from the cache rather than computed, which is also why the caller has to be past `ready`:
     * before then this is empty and the sweep would quietly do nothing.
     */
    private getOwnedGuildIds( client: Client ): string[] {
        const excludedGuildIds = new Set( this.getExcludedGuildIds() );

        return [ ... client.guilds.cache.keys() ]
            .filter( ( guildId ) => ! excludedGuildIds.has( guildId ) );
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

        const ownedGuildIds = this.getOwnedGuildIds( client );

        if ( ! ownedGuildIds.length ) {
            this.logger.info(
                this.removeNonExistentChannelsByType,
                `No guilds held by this process, nothing of type '${ channelType }' to check.`
            );

            return;
        }

        // Asked of the database rather than filtered afterwards. The rows the database knows about
        // span every guild the bot has ever had a channel in, and it knows nothing about shards, so
        // reading them all and discarding the others meant every process paid for the whole table -
        // and did it on a column with no index. Named this way the read is bounded by the guilds this
        // process holds, and `@@index([guildId])` serves it.
        const owned = await prisma.channel.findMany( {
            where: {
                internalType: channelType,
                guildId: { in: ownedGuildIds }
            },
            select: {
                id: true,
                guildId: true,
                channelId: true
            }
        } );

        this.logger.info(
            this.removeNonExistentChannelsByType,
            `Found ${ owned.length } channels of type '${ channelType }' to check` +
            ` across ${ ownedGuildIds.length } guild(s) held here.`
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
                    // Read, not fetched. Every row here was selected because its guild is in this
                    // process's cache, so there is nothing to ask discord - and asking was what used
                    // to drag guilds in over rest, which ignores sharding and undid the split.
                    const guild = client.guilds.cache.get( channel.guildId );

                    // Absent means the bot was removed from that guild since the query ran - the
                    // sweep is chunked and paced, so it runs for minutes. `guildDelete` deletes the
                    // guild's rows through `GuildManager.onLeave()`, which knows that happened;
                    // this loop would only be guessing, so it leaves the row for next time.
                    if ( ! guild ) {
                        ++skippedCount;

                        return;
                    }

                    const discordChannel = await this.lookup(
                        () => guild.channels.fetch( channel.channelId ),
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

    /**
     * Function removeChannelsOfLeftGuilds() :: Rows for guilds the bot was removed from while it was
     * not running.
     *
     * `guildDelete` handles a removal that happens while the bot is up - `GuildManager.onLeave()`
     * deletes the guild's rows there, and does it knowing it happened. No event is waiting when the
     * process comes back, so a removal during a deploy or an outage leaves its rows behind with
     * nothing to collect them. Sweeping the channel tables used to cover this by accident, because
     * it read every row and asked discord about each guild; bounding that read to the guilds this
     * process holds is exactly what stopped it seeing the guilds it does not.
     *
     * Absence from the cache is the cheap half of the question and not the answer. A guild in an
     * outage, a shard still filling, a gateway that dropped one - all look identical to a guild the
     * bot was kicked from, and the deletion cascades to `ChannelData`, which is a server's settings.
     * So the cache only nominates; discord decides, and anything other than "that guild does not
     * exist" leaves the row alone for next time.
     */
    /**
     * Which recorded-as-joined guilds this process should be holding and is not.
     *
     * Both halves matter and for different reasons. `ownsGuild()` is what keeps a shard to its own
     * rows: every other shard's guilds are missing from this cache too, and without the arithmetic
     * they would all read as candidates - one shard would go on to delete the rows of every guild
     * the others are serving. The cache check is what makes it a question at all.
     *
     * Nominating is all this does. The caller asks discord before deleting anything.
     */
    private selectLeftGuildCandidates<T extends { guildId: string }>( client: Client, rows: T[] ): T[] {
        return rows.filter( ( row ) =>
            ownsGuild( row.guildId ) && ! client.guilds.cache.has( row.guildId )
        );
    }

    private async removeChannelsOfLeftGuilds( client: Client ) {
        const prisma = PrismaBotClient.$.getClient();

        // A scan, narrowed to one column. It is the read this sweep cannot bound the way the channel
        // sweep is bounded: "guilds this process should hold" is arithmetic on the id - `ownsGuild()`
        // - and the database cannot be asked to compute it. Answering that in a query wants the shard
        // written onto the row, which is a schema decision tied to the shard count and does not
        // belong in a fix for this.
        const rows = await prisma.guild.findMany( {
            where: {
                isInGuild: true,
                ... this.getGuildExclusionFilter()
            },
            select: {
                guildId: true,
                name: true
            }
        } );

        const candidates = this.selectLeftGuildCandidates( client, rows );

        if ( ! candidates.length ) {
            this.logger.info(
                this.removeChannelsOfLeftGuilds,
                `Every guild this process is recorded as being in is present, of ${ rows.length } checked.`
            );

            return;
        }

        this.logger.info(
            this.removeChannelsOfLeftGuilds,
            `${ candidates.length } guild(s) of ${ rows.length } are recorded as joined but not held here - asking discord.`
        );

        let deletedCount = 0,
            skippedCount = 0,
            presentCount = 0,
            currentIndex = 0,
            startTime = Date.now();

        while ( currentIndex < candidates.length ) {
            const chunkEndIndex = Math.min( currentIndex + CHUNK_SIZE, candidates.length );
            const chunk = candidates.slice( currentIndex, chunkEndIndex );

            await Promise.all( chunk.map( async( row ) => {
                try {
                    const guild = await this.lookup(
                        () => client.guilds.fetch( row.guildId ),
                        DISCORD_ERROR_UNKNOWN_GUILD
                    );

                    if ( "unreachable" === guild.state ) {
                        ++skippedCount;

                        return;
                    }

                    // Discord says the bot is in it, so the cache was simply missing it. Nothing to
                    // delete, and worth counting: a process reporting these is one whose cache does
                    // not match what it is actually in, which is a different problem from a stale row.
                    if ( "found" === guild.state ) {
                        ++presentCount;

                        return;
                    }

                    // The same three deletions `GuildManager.onLeave()` does, replayed late.
                    await prisma.category.deleteMany( { where: { guildId: row.guildId } } );
                    await prisma.channel.deleteMany( { where: { guildId: row.guildId } } );
                    await prisma.guild.update( {
                        where: { guildId: row.guildId },
                        data: { isInGuild: false }
                    } );

                    ++deletedCount;

                    this.logger.info(
                        this.removeChannelsOfLeftGuilds,
                        `Guild '${ row.name }' (${ row.guildId }) is gone - its rows are deleted.`
                    );
                } catch( error ) {
                    ++skippedCount;

                    this.logger.error( this.removeChannelsOfLeftGuilds, "", error );
                }
            } ) );

            currentIndex += CHUNK_SIZE;
            const elapsedTime = Date.now() - startTime;

            if ( elapsedTime < CHUNK_TIME_LIMIT && currentIndex < candidates.length ) {
                const delay = Math.max( CHUNK_DELAY - elapsedTime, 0 );
                await new Promise( ( resolve ) => setTimeout( resolve, delay ) );
            }

            startTime = Date.now();
        }

        this.logger.info(
            this.removeChannelsOfLeftGuilds,
            `Left-guild cleanup done: ${ deletedCount } cleared` +
            ( presentCount ? `, ${ presentCount } discord says are still joined` : "" ) +
            ( skippedCount ? `, ${ skippedCount } left alone because discord could not be asked` : "" ) +
            "."
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

        // Last, and about the guilds the sweeps above cannot see: each of those is bounded to the
        // guilds this process holds, so a guild the bot was removed from while it was down is in
        // none of them.
        await this.removeChannelsOfLeftGuilds( client );
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
                // `login()` resolves when the gateway handshake starts, not when the guilds arrive,
                // and the sweep is bounded by `client.guilds.cache` - run on login it would find an
                // empty cache and report a clean database however much was in it.
                await new Promise<void>( ( resolve ) => {
                    if ( client.isReady() ) {
                        resolve();

                        return;
                    }

                    client.once( "ready", () => resolve() );
                } );

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
