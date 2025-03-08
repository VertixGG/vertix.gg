import * as fs from "fs";

import * as path from "path";

import process from "process";

import { CURRENT_VERSION } from "@vertix.gg/base/src/definitions/version";

import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import type { Client } from "discord.js";

interface PackageJson {
    version: string;

    [key: string]: any;
}

const packageJsonPath = path.resolve("./package.json");
const packageJsonString = fs.readFileSync(packageJsonPath, { encoding: "utf8" });
const packageJson: PackageJson = JSON.parse(packageJsonString);

export class AppService extends ServiceBase {
    private client: Client<true>;

    private onceReadyCallback: () => void;

    public static getName() {
        return "VertixBot/Services/App";
    }

    public static getVersion() {
        return CURRENT_VERSION;
    }

    public static getBuildVersion() {
        return packageJson.version;
    }

    public constructor() {
        super();

        EventBus.$.register(this, [this.onReady]);

        this.printVersion();
    }

    public getClient() {
        return this.client;
    }

    public onceReady(onceReady: () => void) {
        this.onceReadyCallback = onceReady;
    }

    public async onReady(client: Client<true>) {
        if (this.client) {
            this.logger.error(this.onReady, "Client is already set");

            process.exit(1);
        }

        this.client = client;

        if (!client.user || !client.application) {
            this.logger.error(this.onReady, "Client is not ready");

            process.exit(1);
        }

        const { Commands } = await import("@vertix.gg/bot/src/commands");

        await client.application.commands.set(Commands);

        this.logger.info(this.onReady, "Abandoned channels are handled.");

        await this.ensureBackwardCompatibility();

        const username = client.user.username,
            id = client.user.id;

        this.logger.log(
            this.onReady,
            `Ready handle is set, bot: '${username}', id: '${id}' is online, commands is set.`
        );

        if (this.onceReadyCallback) {
            this.pingInterval();
            this.onceReadyCallback();
        }
    }

    private async ensureBackwardCompatibility() {
        // const { PrismaBotClient } = await import("@vertix.gg/prisma/bot-client");
        // const client = PrismaBotClient.getPrismaClient();
        //
        // const checkVersion = (version: string) => {
        //     const [major, minor, patch] = version.split(".");
        //     return Number(major) === 0 && Number(minor) === 0 && Number(patch) <= 7;
        // };
        //
        // async function ensueDataVersionMatchesNewUIMechanism( this: AppService ) {
        //     const updateData = async ( dataModel: any ) => {
        //         const entities = await dataModel.findMany( {
        //             where: {
        //                 version: {
        //                     lte: "0.0.7",
        //                 }
        //             }
        //         } );
        //
        //         let count = 0;
        //         for ( const entity of entities ) {
        //             if ( entity.version.length === 5 && checkVersion( entity.version ) ) {
        //                 count++;
        //                 await dataModel.update( {
        //                     where: {
        //                         id: entity.id,
        //                     },
        //                     data: {
        //                         version: VERSION_UI_V2,
        //                     },
        //                 } );
        //             }
        //         }
        //
        //         this.logger.log( ensueDataVersionMatchesNewUIMechanism, `Updated ${ count } entities in ${ dataModel.name }` );
        //     };
        //
        //     await updateData( client.guildData );
        //     await updateData( client.channelData );
        //     await updateData( client.userData );
        // }
        //
        // await ensueDataVersionMatchesNewUIMechanism.call( this );
    }

    private pingInterval() {
        setInterval(() => {
            this.logger.log(this.pingInterval, `Ping: ${this.client.ws.ping}ms`);
        }, 30000);
    }

    private printVersion() {
        this.logger.info(
            this.printVersion,
            `Version: '${AppService.getVersion()}' Build version: ${AppService.getBuildVersion()}'`
        );
    }
}

export default AppService;
