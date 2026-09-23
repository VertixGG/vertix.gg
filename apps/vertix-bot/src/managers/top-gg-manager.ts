import process from "process";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { EmbedBuilder, MessageFlags } from "discord.js";

import { CacheBase } from "@vertix.gg/base/src/bases/cache-base";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { Api } from "@top-gg/sdk";

import { getOwnedShardIds, getShardCount } from "@vertix.gg/bot/src/definitions/sharding";

import type TopGG from "@top-gg/sdk";

import type { Client, CommandInteraction, MessageComponentInteraction } from "discord.js";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";

const TOP_GG_TIMER_INTERVAL = 1000 * 60 * 60, // 1 hour
    TOP_GG_VOTE_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours

export class TopGGManager extends CacheBase<Date> {
    private static instance: TopGGManager;

    private appService: AppService;

    private api!: TopGG.Api;
    private client!: Client;

    private readonly timerInterval: number;
    private readonly voteInterval: number;

    private isTryingHandshakeOnce = false;
    private isHandshakeDone = false;

    public static getName() {
        return "VertixBot/Managers/TopGG";
    }

    public static getInstance() {
        if ( !TopGGManager.instance ) {
            TopGGManager.instance = new TopGGManager();
        }

        return TopGGManager.instance;
    }

    public static get $() {
        return TopGGManager.getInstance();
    }

    public static getVoteUrl() {
        return process.env.TOP_GG_VOTE_URL ?? "404_URL_NOT_FOUND";
    }

    public constructor(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        shouldDebugCache = isDebugEnabled( "CACHE", TopGGManager.getName() ),
        timerInterval = TOP_GG_TIMER_INTERVAL,
        voteInterval = TOP_GG_VOTE_INTERVAL
    ) {
        super();

        this.appService = ServiceLocator.$.get( "VertixBot/Services/App" );

        this.timerInterval = timerInterval;
        this.voteInterval = voteInterval;
    }

    /**
     * A vote is good for the whole top.gg window, so these entries have to outlive the default TTL.
     *
     * `isVoted()` already compares the cached `Date` against `voteInterval` itself, so expiring an
     * entry sooner would not make the answer wrong - it would send every repeat question back to
     * the top.gg API, once per user per fifteen minutes instead of once per twelve hours.
     *
     * Safe to answer from a field because the base reads this lazily, on the first get or set,
     * rather than while `super()` is still running.
     */
    protected override getCacheTtlMs(): number {
        return this.voteInterval;
    }

    public getVoteUrl() {
        return TopGGManager.getVoteUrl();
    }

    public getVoteEmbed() {
        const embed = new EmbedBuilder(),
            voteUrl = this.getVoteUrl();

        embed.setTitle( "👑 Vote for us to unlock this feature!" );
        embed.setDescription(
            `This is a premium feature, but you can unlock it for free! [**Vote for us on top.gg!**](${ voteUrl })`
        );

        return embed;
    }

    public async sendVoteEmbed(
        interaction: MessageComponentInteraction<"cached"> | CommandInteraction<"cached">
    ) {
        return await interaction
            .reply( {
                embeds: [ TopGGManager.$.getVoteEmbed() ],
                flags: MessageFlags.Ephemeral
            } )
            .catch( ( e ) => {
                this.logger.error( this.sendVoteEmbed, "", e );
            } );
    }

    public updateStats() {
        if ( !this.workingMiddleware() ) {
            return;
        }

        const shardCount = getShardCount(),
            ownedShardIds = getOwnedShardIds();

        // Unsharded, which is every deployment today: one post for the whole bot.
        if ( null === shardCount || null === ownedShardIds ) {
            return this.postShardStats( this.client.guilds.cache.size, 0, 1 );
        }

        // Sharded, top.gg sums what each shard reports, so a process posts for the shards it holds
        // and for no others. Posting `guilds.cache.size` from every process as though it were the
        // whole bot is what this replaces - the count would have flapped between whichever process
        // posted last. `guild.shardId` is where discord actually routed the guild, so the split is
        // the real one rather than an even division.
        const countByShard = new Map<number, number>( ownedShardIds.map( ( id ) => [ id, 0 ] ) );

        for ( const guild of this.client.guilds.cache.values() ) {
            const current = countByShard.get( guild.shardId );

            if ( undefined !== current ) {
                countByShard.set( guild.shardId, current + 1 );
            }
        }

        return Promise.all(
            [ ... countByShard ].map( ( [ shardId, count ] ) =>
                this.postShardStats( count, shardId, shardCount )
            )
        );
    }

    private postShardStats( serverCount: number, shardId: number, shardCount: number ) {
        return this.api
            .postStats( { serverCount, shardId, shardCount } )
            .then( () => {
                this.logger.info(
                    this.postShardStats,
                    `TopGG stats updated - shard ${ shardId }/${ shardCount }, ${ serverCount } server(s)`
                );
            } )
            .catch( ( e ) => {
                this.logger.error( this.postShardStats, "", e );
            } );
    }

    public async isVoted( userId: string, cache = true, shouldAdminLog = true ) {
        if ( !this.workingMiddleware() ) {
            this.logger.admin( this.isVoted, "Working middleware failed" );
            return true;
        }

        if ( cache ) {
            // Try to get cache.
            const cache = this.getCache( userId );

            // If cache is not expired, return true.
            if ( cache && new Date().getTime() - cache.getTime() < this.voteInterval ) {
                return true;
            }
        }

        const result = await this.api.hasVoted( userId ).catch( ( e ) => {
            this.logger.error( this.isVoted, "", e );
            return null;
        } );

        if ( shouldAdminLog && result ) {
            const displayName = this.client.users.cache.get( userId )?.username ?? "Unknown";

            this.logger.admin(
                this.isVoted,
                `👑 Vertix received topGG Vote - From user id: '${ userId }', name: '${ displayName }'`
            );
        }

        // Vote failed, we can't know if user voted or not, so we return true.
        if ( null === result ) {
            return true;
        }

        // Set cache only if user voted.
        if ( result ) {
            this.setCache( userId, new Date() );
        }

        return result;
    }

    public handshake() {
        /**
         * A `warn`, not an `error`. No token is a decision rather than a failure - the listing this
         * posts to was taken down, so the manager is meant to be off - and error lines are reported
         * to the alert channel, which every restart would then fill with two copies of this, one
         * per shard. An alert channel carrying something expected is one nobody reads.
         */
        if ( !process.env.TOP_GG_TOKEN ) {
            this.logger.warn( this.handshake, "TOP_GG_TOKEN is not defined, the manager will be disabled" );
            return;
        }

        this.api = new Api( process.env.TOP_GG_TOKEN as string );
        this.client = this.appService.getClient();

        if ( !this.isTryingHandshakeOnce ) {
            this.isTryingHandshakeOnce = true;

            this.logger.info( this.handshake, "TopGG manager is initializing..." );

            setInterval( this.timer.bind( this ), this.timerInterval );
        }

        this.logger.info( this.handshake, "TopGG manager is trying to handshake with top.gg API..." );

        this.api
            .getStats( this.client?.user?.id as string )
            .then( async( stats ) => {
                this.logger.info( this.handshake, "TopGG handshake complete, stats:", stats );

                this.isHandshakeDone = true;

                await this.updateStats();
            } )
            .catch( ( e ) => {
                this.isHandshakeDone = false;

                this.logger.error( this.handshake, "", e );
            } );
    }

    private workingMiddleware() {
        if ( !process.env.TOP_GG_TOKEN ) {
            return false;
        }

        if ( !this.isHandshakeDone ) {
            this.logger.error( this.workingMiddleware, "Handshake is not done yet" );
            return false;
        }

        if ( !this.client.user ) {
            this.logger.error( this.workingMiddleware, "Client user is not ready" );
            return false;
        }

        return true;
    }

    private timer() {
        this.handshake();
    }
}
