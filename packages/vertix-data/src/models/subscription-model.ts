import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/**
 * What the webhook knows about one server's subscription.
 *
 * Dates are dates here rather than the strings paddle sends, so anything that does not parse is
 * refused at the edge where the payload is still in view - prisma's complaint about an
 * `Invalid Date` names a column and not the event it came from.
 */
export interface ISubscriptionRecord {
    guildId: string;
    paddleSubscriptionId: string;
    paddleCustomerId: string | null;
    priceId: string;
    status: string;
    currentPeriodEnd: Date | null;
    scheduledToCancelAt: Date | null;
}

/**
 * One row per server, saying what it pays for.
 *
 * Keyed by the guild rather than by paddle's subscription id, because the question every caller
 * asks is "what may this server have" - and a server that cancels and buys again should answer
 * that from one row rather than from two that have to be ordered by date first.
 */
export class SubscriptionModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: SubscriptionModel;

    public static getName(): string {
        return "VertixData/Models/SubscriptionModel";
    }

    public static getInstance(): SubscriptionModel {
        if ( ! SubscriptionModel.instance ) {
            SubscriptionModel.instance = new SubscriptionModel();
        }

        return SubscriptionModel.instance;
    }

    public static get $() {
        return SubscriptionModel.getInstance();
    }

    /**
     * Function get() :: What this server pays for, or null if it never has.
     */
    public async get( guildId: string ) {
        return this.prisma.subscription.findUnique( { where: { guildId } } );
    }

    /**
     * Function upsert() :: Record what paddle last said about a server.
     *
     * The row is replaced wholesale because paddle sends the entire subscription on every event
     * rather than a diff. That is also what makes the write safe to repeat: events arrive twice or
     * out of order, and a replace survives both where an incremental update would not.
     */
    public async upsert( record: ISubscriptionRecord ) {
        const { guildId, ...rest } = record;

        this.debugger.dumpDown( this.upsert, record );

        return this.prisma.subscription.upsert( {
            where: { guildId },
            create: { guildId, ... rest },
            update: rest
        } );
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default SubscriptionModel;
