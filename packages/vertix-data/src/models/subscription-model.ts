import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { shouldApplySubscriptionEvent } from "@vertix.gg/definitions/src/billing-definitions";

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

    /** When paddle says the event happened, which is what decides whether it is worth applying. */
    occurredAt: Date | null;

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
     * rather than a diff, which makes a repeated delivery harmless. What a wholesale replace does
     * *not* survive is a delayed event arriving after a newer one - that would write the older
     * truth over the newer one - so the event's own timestamp is checked before anything is
     * written, and one that is definitely older is dropped.
     *
     * Reported rather than thrown, because a dropped event is the system working.
     */
    public async upsert( record: ISubscriptionRecord ): Promise<{ written: boolean }> {
        const { guildId, ...rest } = record;

        const existing = await this.prisma.subscription.findUnique( { where: { guildId } } );

        if ( existing && ! shouldApplySubscriptionEvent( {
            storedOccurredAt: existing.occurredAt,
            incomingOccurredAt: record.occurredAt
        } ) ) {
            this.debugger.log( this.upsert, `Guild id: '${ guildId }' - Event is older than the stored one, dropped` );

            return { written: false };
        }

        this.debugger.dumpDown( this.upsert, record );

        await this.prisma.subscription.upsert( {
            where: { guildId },
            create: { guildId, ... rest },
            update: rest
        } );

        return { written: true };
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default SubscriptionModel;
