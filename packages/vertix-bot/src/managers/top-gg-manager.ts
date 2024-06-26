import process from "process";

import { isDebugEnabled } from "@vertix.gg/utils/src/environment";

import { EmbedBuilder } from "discord.js";

import { CacheBase } from "@vertix.gg/base/src/bases/cache-base";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { Api } from "@top-gg/sdk";

import type TopGG from "@top-gg/sdk";

import type { Client, MessageComponentInteraction } from "discord.js";
import type { AppService } from "@vertix.gg/bot/src/services/app-service";

const TOP_GG_WORKER_INTERVAL = 1000 * 60 * 60, // 1 hour
    TOP_GG_VOTE_INTERVAL = 1000 * 60 * 60 * 12; // 12 hours

export class TopGGManager extends CacheBase<Date> {
    private static instance: TopGGManager;

    private appService: AppService;

    private api!: TopGG.Api;
    private client!: Client;

    private readonly workerInterval: number;
    private readonly voteInterval: number;

    private isTryingHandshakeOnce = false;
    private isHandshakeDone = false;

    public static getName() {
        return "VertixBot/Managers/TopGG";
    }

    public static getInstance() {
        if ( ! TopGGManager.instance ) {
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
        workerInterval = TOP_GG_WORKER_INTERVAL,
        voteInterval = TOP_GG_VOTE_INTERVAL
    ) {
        super();

        this.appService = ServiceLocator.$.get( "VertixBot/Services/App");

        this.workerInterval = workerInterval;
        this.voteInterval = voteInterval;
    }

    public getVoteUrl() {
        return TopGGManager.getVoteUrl();
    }

    public getVoteEmbed() {
        const embed = new EmbedBuilder(),
            voteUrl = this.getVoteUrl();

        embed.setTitle( "👑 Vote for us to unlock this feature!" );
        embed.setDescription( `This is a premium feature, but you can unlock it for free! [**Vote for us on top.gg!**](${ voteUrl })` );

        return embed;
    }

    public async sendVoteEmbed( interaction: MessageComponentInteraction<"cached"> ) {
        return await interaction.reply( {
            embeds: [ TopGGManager.$.getVoteEmbed() ],
            ephemeral: true,
        } ).catch( ( e ) => {
            this.logger.error( this.sendVoteEmbed, "", e );
        } );
    }

    public updateStats() {
        if ( ! this.workingMiddleware() ) {
            return;
        }

        return this.api.postStats( {
            serverCount: this.client.guilds.cache.size + 1000,
            shardId: this.client.shard?.ids[ 0 ] ?? 0,
            shardCount: this.client.shard?.count ?? 1,
        } ).then( () => {
            this.logger.info( this.updateStats, "TopGG stats updated" );
        } ).catch( ( e ) => {
            this.logger.error( this.updateStats, "", e );
        } );
    }

    public async isVoted( userId: string, cache = true, shouldAdminLog = true ) {
        if ( ! this.workingMiddleware() ) {
            this.logger.admin( this.isVoted, "Working middleware failed" );
            return true;
        }

        if ( cache ) {
            // Try to get cache.
            const cache = this.getCache( userId );

            // If cache is not expired, return true.
            if ( cache && ( new Date().getTime() - cache.getTime() ) < this.voteInterval ) {
                return true;
            }
        }

        const result = await this.api.hasVoted( userId ).catch( ( e ) => {
            this.logger.error( this.isVoted, "", e );
            return null;
        } );

        if ( shouldAdminLog && result ) {
            const displayName = this.client.users.cache.get( userId )?.username ?? "Unknown";

            this.logger.admin( this.isVoted, `👑 Vertix received topGG Vote - From user id: '${ userId }', name: '${ displayName }'` );
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
        if ( ! process.env.TOP_GG_TOKEN ) {
            this.logger.error( this.handshake, "TOP_GG_TOKEN is not defined, the manager will be disabled" );
            return;
        }

        this.api = new Api( process.env.TOP_GG_TOKEN as string );
        this.client = this.appService.getClient();

        if ( ! this.isTryingHandshakeOnce ) {
            this.isTryingHandshakeOnce = true;

            this.logger.info( this.handshake, "TopGG manager is initializing..." );

            setInterval( this.worker.bind( this ), this.workerInterval );
        }

        this.api = new Api( process.env.TOP_GG_TOKEN as string );
        this.client = this.appService.getClient();

        this.logger.info( this.handshake, "TopGG manager is trying to handshake with top.gg API..." );

        this.api.getStats( this.client?.user?.id as string ).then( async ( stats ) => {
            this.logger.info( this.handshake, "TopGG handshake complete, stats:", stats );

            this.isHandshakeDone = true;

            await this.updateStats();
        } ).catch( ( e ) => {
            this.isHandshakeDone = false;

            this.logger.error( this.handshake, "", e );
        } );
    }

    private workingMiddleware() {
        if ( ! process.env.TOP_GG_TOKEN ) {
            return false;
        }

        if ( ! this.isHandshakeDone ) {
            this.logger.error( this.workingMiddleware, "Handshake is not done yet" );
            return false;
        }

        if ( ! this.client.user ) {
            this.logger.error( this.workingMiddleware, "Client user is not ready" );
            return false;
        }

        return true;
    }

    private worker() {
        this.handshake();
    }
}
