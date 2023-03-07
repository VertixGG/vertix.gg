import { PrismaClient } from "@prisma/client";

import ObjectBase from "../bases/object-base";
import Logger from "../modules/logger";

export default class PrismaInstance extends ObjectBase {
    private static instance: PrismaInstance;

    private logger: Logger;

    private client: PrismaClient;

    private connectPromise: Promise<void>;

    static getName() {
        return "Prisma/PrismaInstance";
    }

    private constructor() {
        super();

        this.logger = new Logger( this );
        this.client = new PrismaClient();

        this.logger.info( "constructor", "Connecting to database..." );

        this.connectPromise = this.client.$connect();

        this.connectPromise.catch( ( error ) => {
            this.logger.error( "constructor", error );
            process.exit( 1 );
        } );
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
}
