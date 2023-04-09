import process from "process";

import { PrismaClient } from "@prisma/client";

import chalk from "chalk";

import ObjectBase from "../bases/object-base";

import Logger from "@internal/modules/logger";

export default class PrismaInstance extends ObjectBase {
    private static instance: PrismaInstance;

    private logger: Logger;

    private client: PrismaClient;

    private connectPromise: Promise<void>;

    public static getName() {
        return "Prisma/PrismaInstance";
    }

    public static getInstance() {
        if ( ! PrismaInstance.instance ) {
            PrismaInstance.instance = new PrismaInstance();
        }

        return PrismaInstance.instance;
    }

    public static getConnectPromise(): Promise<void> {
        const prisma = ( this as typeof PrismaInstance ).getInstance();

        return prisma.connectPromise;
    }

    public static getClient(): PrismaClient {
        const prisma = ( this as typeof PrismaInstance ).getInstance();

        return prisma.client;
    }

    private constructor() {
        super();

        this.logger = new Logger( this );
        this.logger.addMessagePrefix( chalk.blue( "Prisma" ) );

        let options = {};

        if ( "prisma" === process.env.env_mode ) {
            options = {
                log: [
                    { level: "warn", emit: "event" },
                    { level: "info", emit: "event" },
                    { level: "error", emit: "event" },
                    { level: "query", emit: "event" },
                ],
            };
        }

        this.client = new PrismaClient( options );

        if ( "prisma" === process.env.env_mode ) {
            // @ts-ignore
            this.client.$on( "warn", this.onWarn.bind( this ) ); // @ts-ignore
            this.client.$on( "info", this.onInfo.bind( this ) ); // @ts-ignore
            this.client.$on( "error", this.onError.bind( this ) ); // @ts-ignore
            this.client.$on( "query", this.onQuery.bind( this ) );
        }

        this.logger.log( "constructor", "Connecting to database..." );

        this.connectPromise = this.client.$connect();

        this.connectPromise.catch( ( error ) => {
            this.logger.error( "constructor", error );
            process.exit( 1 );
        } );
    }

    private async onError( error: any ) {
        this.logger.error( this.onError, "", error );
    }

    private async onInfo( message: any ) {
        this.logger.info( this.onInfo, "", message );
    }

    private async onQuery( data: any ) {
        this.logger.log( this.onQuery, data.query );
    }

    private async onWarn( message: any ) {
        this.logger.warn( this.onWarn, "", message );
    }
}
