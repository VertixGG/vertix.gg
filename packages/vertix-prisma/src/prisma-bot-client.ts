import process from "process";
import module from "module";

import pc from "picocolors";

import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";

import { Logger } from "@vertix.gg/base/src/modules/logger";
import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import type * as PrismaTypes from "@vertix.gg/prisma/._bot-client-internal";
import type * as PrismaLibrary from "@vertix.gg/prisma/._bot-client-library";

const require = module.createRequire(import.meta.url);

// Prisma does not support esm...
const Prisma = require("@vertix.gg/prisma/._bot-client-internal");

type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};

// TODO Rename its not instance, its singleton, facade, etc. or just PrismaBot
export class PrismaBotClient extends ObjectBase {
    private static instance: PrismaBotClient;

    protected logger: Logger;
    protected debugger: Debugger;

    protected client: PrismaTypes.PrismaClient;

    public static getName() {
        return "VertixPrisma/PrismaBotInstance";
    }

    public static getInstance() {
        if (!PrismaBotClient.instance) {
            PrismaBotClient.instance = new PrismaBotClient();
        }

        return PrismaBotClient.instance;
    }

    public static get $() {
        return PrismaBotClient.getInstance();
    }

    public static getPrismaClient(): PrismaTypes.PrismaClient {
        const prisma = (this as typeof PrismaBotClient).$;

        return prisma.client;
    }

    public constructor() {
        super();

        this.logger = new Logger(this);
        this.debugger = new Debugger(this);
        this.logger.addMessagePrefix(pc.blue("Prisma"));

        let options: PrismaTypes.Prisma.PrismaClientOptions = {};

        if ("true" === process.env.DEBUG_PRISMA) {
            options = {
                ...options,
                log: [
                    { level: "warn", emit: "event" },
                    { level: "info", emit: "event" },
                    { level: "error", emit: "event" },
                    { level: "query", emit: "event" }
                ]
            };
        }

        const PrismaClient = require("@vertix.gg/prisma/._bot-client-internal").PrismaClient;

        this.client = new PrismaClient(options);

        if ("true" === process.env.DEBUG_PRISMA) {
            // @ts-ignore
            this.client.$on("warn", this.onWarn.bind(this)); // @ts-ignore
            this.client.$on("info", this.onInfo.bind(this)); // @ts-ignore
            this.client.$on("error", this.onError.bind(this)); // @ts-ignore
            this.client.$on("query", this.onQuery.bind(this));
        }
    }

    public async connect() {
        return new Promise(async (resolve, reject) => {
            this.logger.log("constructor", "Starting up the database engine ...");

            await this.client.$connect();

            this.logger.log("constructor", "Sending ping to database ...");

            // Run ping with a timeout of 5 seconds
            const timeoutId = setTimeout(() => {
                reject(new Error("Connection to database timed out"));
            }, 5000);

            // Run ping command to check if connection is established
            const ping = await this.client.$runCommandRaw({
                ping: "1"
            });

            clearTimeout(timeoutId);

            resolve(ping);
        });
    }

    public getClient() {
        return this.client;
    }

    private async onError(error: any) {
        this.logger.error(this.onError, "", error);
    }

    private async onInfo(message: any) {
        this.logger.info(this.onInfo, "", message);
    }

    private async onQuery(data: QueryEvent) {
        this.debugger.dumpDown(this.onQuery, data.query);
    }

    private async onWarn(message: any) {
        this.logger.warn(this.onWarn, "", message);
    }
}

global.PrismaBot = Prisma;

export { Prisma as PrismaBot };
export type { PrismaLibrary as PrismaBotLibrary };
