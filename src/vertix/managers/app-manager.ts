import process from "process";

import * as fs from "fs";
import * as path from "path";

import { spawn, Thread, Worker } from "threads";

import { Client } from "discord.js";

import { InitializeBase } from "@vertix-base/bases/initialize-base";

import { CURRENT_VERSION } from "@vertix-base/definitions/version";

import { DynamicChannelClaimManager } from "@vertix/managers/dynamic-channel-claim-manager";

interface PackageJson {
    version: string;

    [ key: string ]: any;
}

const packageJsonPath = path.resolve( "./package.json" );
const packageJsonString = fs.readFileSync( packageJsonPath, { encoding: "utf8" } );
const packageJson: PackageJson = JSON.parse( packageJsonString );

export class AppManager extends InitializeBase {
    private static instance: AppManager;

    private client!: Client<true>;

    public static getName() {
        return "Vertix/Managers/App";
    }

    public static getInstance() {
        if ( ! AppManager.instance ) {
            AppManager.instance = new AppManager();
        }

        return AppManager.instance;
    }

    public static get $() {
        return AppManager.getInstance();
    }

    public static getVersion() {
        return CURRENT_VERSION;
    }

    public static getBuildVersion() {
        return packageJson.version;
    }

    public static isDebugOn( debugType: string, entityName: string ) {
        return !! process.env[ `DEBUG_${ debugType }` ]?.includes( entityName );
    }

    public constructor() {
        super();

        this.printVersion();
    }

    public getClient() {
        return this.client;
    }

    public async onReady( client: Client ) {
        if ( this.client ) {
            this.logger.error( this.onReady, "Client is already set" );
            process.exit( 1 );
            return;
        }

        this.client = client;

        if ( ! client.user || ! client.application ) {
            this.logger.error( this.onReady, "Client is not ready" );
            process.exit( 1 );
            return;
        }

        const { Commands } = ( await import( "@vertix/commands" ) );

        await client.application.commands.set( Commands );

        // ---
        const worker = await spawn( new Worker(
            process.platform !== "darwin" ?
                "./_workers/cleanup-worker.js" :
                "./../_workers/cleanup-worker"
        ) );

        worker.handle().then( () => {
            this.logger.log( this.onReady, "terminate worker" );
            Thread.terminate( worker );
        } );
        // ---

        await DynamicChannelClaimManager.$.handleAbandonedChannels( client );

        this.logger.info( this.onReady, "Abandoned channels are handled." );

        await this.ensureBackwardCompatibility();

        const username = client.user.username,
            id = client.user.id;

        this.logger.log( this.onReady,
            `Ready handle is set, bot: '${ username }', id: '${ id }' is online, commands is set.` );
    }

    private async ensureBackwardCompatibility() {
    }

    private printVersion() {
        this.logger.info( this.printVersion,
            `Version: '${ AppManager.getVersion() }' Build version: ${ AppManager.getBuildVersion() }'`
        );
    }
}
