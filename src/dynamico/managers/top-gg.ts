import process from "process";

import { Client } from "discord.js";

import { Api } from "@top-gg/sdk";

import { dynamicoManager } from "@dynamico/managers/index";

import { InitializeBase } from "@internal/bases";

export class TopGGManager extends InitializeBase {
    private static instance: TopGGManager;

    private api!: Api;
    private client!: Client;

    private isHandshakeDone = false;

    public static getInstance() {
        if ( ! TopGGManager.instance ) {
            TopGGManager.instance = new TopGGManager();
        }

        return TopGGManager.instance;
    }

    public static getName() {
        return "Dynamico/Managers/TopGG";
    }

    public static getVoteUrl() {
        return process.env.TOP_GG_VOTE_URL ?? "404_URL_NOT_FOUND";
    }

    public getVoteUrl() {
        return TopGGManager.getVoteUrl();
    }

    public async updateStats() {
        if ( ! this.workingMiddleware() ) {
            return;
        }

        this.api.postStats( {
            serverCount: this.client.guilds.cache.size,
            shardId: this.client.shard?.ids[ 0 ] ?? 0,
            shardCount: this.client.shard?.count ?? 1,
        } ).then( () => {
            this.logger.info( this.updateStats, "TopGG stats updated" );
        } ).catch( ( e ) => {
            this.logger.error( this.updateStats, "", e );
        } );
    }

    public async isVoted( userId: string ) {
        if ( ! this.workingMiddleware() ) {
            return false;
        }

        const result = await this.api.hasVoted( userId );

        this.logger.debug( this.isVoted, `User id: '${ userId }' isVoted: '${ result }'` );

        return result;
    }

    public handshake() {
        if ( ! process.env.TOP_GG_TOKEN ) {
            this.logger.error( this.handshake, "TOP_GG_TOKEN is not defined, the manager will be disabled" );
            return;
        }

        this.api = new Api( process.env.TOP_GG_TOKEN as string );
        this.client = dynamicoManager.getClient() as Client;

        this.logger.info( this.handshake, "TopGG manager is initializing..." );

        this.api.getStats( this.client?.user?.id as string ).then( async ( stats ) => {
            this.logger.info( this.handshake, "TopGG self stats:", stats );

            this.isHandshakeDone = true;

            await this.updateStats();
        } ).catch( ( e ) => {
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
}

export default TopGGManager;