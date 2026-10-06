import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/** Prisma's code for a write that lost a race to create the same unique row. */
const PRISMA_UNIQUE_CONSTRAINT_FAILED = "P2002";

/**
 * Function toUtcDay() :: Midnight UTC of the day a moment falls on - what a day's count is filed under.
 */
export function toUtcDay( at: Date ): Date {
    return new Date( Date.UTC( at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() ) );
}

/**
 * Function toUtcHour() :: The start of the UTC hour a moment falls in - what an hour's count is filed under.
 */
export function toUtcHour( at: Date ): Date {
    return new Date( Date.UTC( at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate(), at.getUTCHours() ) );
}

/**
 * What a server has done with the bot since adding it: set it up, and had rooms made from it.
 *
 * The milestones are firsts, written once and never moved - they answer whether an install turned
 * into a server that runs on the bot, which is what the owner is trying to grow. The day counts are
 * how much it is used now, and the hour counts when in the day and the week. None of it names a member.
 */
export class GuildActivityModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: GuildActivityModel;

    public static getName(): string {
        return "VertixData/Models/GuildActivityModel";
    }

    public static getInstance(): GuildActivityModel {
        if ( ! GuildActivityModel.instance ) {
            GuildActivityModel.instance = new GuildActivityModel();
        }

        return GuildActivityModel.instance;
    }

    public static get $() {
        return GuildActivityModel.getInstance();
    }

    /**
     * Function markSetup() :: Record the first generator a server made, if this is it.
     *
     * A filter rather than a read and a write, so two generators made at once cannot both be first.
     * Rows written before this field existed have it unset rather than null, so both are matched.
     */
    public async markSetup( guildId: string, at: Date ) {
        await this.prisma.guild.updateMany( {
            where: { guildId, OR: [ { setupAt: { isSet: false } }, { setupAt: null } ] },
            data: { setupAt: at }
        } );
    }

    /**
     * Function markRoomCreated() :: Count a room a member made - in its day, its hour and, given the generator
     * that made it, that generator's day - and record the first one ever.
     */
    public async markRoomCreated( guildId: string, at: Date, generatorId: string | null = null ) {
        await this.prisma.guild.updateMany( {
            where: { guildId, OR: [ { firstRoomAt: { isSet: false } }, { firstRoomAt: null } ] },
            data: { firstRoomAt: at }
        } );

        await this.countRoom( guildId, toUtcDay( at ) );

        await this.countRoomHour( guildId, toUtcHour( at ) );

        if ( generatorId ) {
            await this.countGeneratorRoom( guildId, generatorId, toUtcDay( at ) );
        }
    }

    /**
     * Function getDays() :: A server's rooms per day, from one day up to, not including, another.
     */
    public async getDays( guildId: string, from: Date, to: Date ) {
        return this.prisma.guildActivityDay.findMany( {
            where: { guildId, day: { gte: from, lt: to } },
            select: { day: true, roomsCreated: true }
        } );
    }

    /**
     * Function getHours() :: A server's rooms per hour, from one hour up to, not including, another.
     */
    public async getHours( guildId: string, from: Date, to: Date ) {
        return this.prisma.guildActivityHour.findMany( {
            where: { guildId, hour: { gte: from, lt: to } },
            select: { hour: true, roomsCreated: true }
        } );
    }

    /**
     * Function getGeneratorDays() :: A server's rooms per generator per day, from one day up to, not including, another.
     */
    public async getGeneratorDays( guildId: string, from: Date, to: Date ) {
        return this.prisma.guildGeneratorActivityDay.findMany( {
            where: { guildId, day: { gte: from, lt: to } },
            select: { generatorId: true, day: true, roomsCreated: true }
        } );
    }

    /**
     * Function countRoom() :: Add one to a server's rooms for a day.
     */
    private async countRoom( guildId: string, day: Date ) {
        await this.retryLostCreate( () => this.prisma.guildActivityDay.upsert( {
            where: { guildId_day: { guildId, day } },
            create: { guildId, day, roomsCreated: 1 },
            update: { roomsCreated: { increment: 1 } }
        } ) );
    }

    /**
     * Function countRoomHour() :: Add one to a server's rooms for an hour.
     */
    private async countRoomHour( guildId: string, hour: Date ) {
        await this.retryLostCreate( () => this.prisma.guildActivityHour.upsert( {
            where: { guildId_hour: { guildId, hour } },
            create: { guildId, hour, roomsCreated: 1 },
            update: { roomsCreated: { increment: 1 } }
        } ) );
    }

    /**
     * Function countGeneratorRoom() :: Add one to a generator's rooms for a day.
     */
    private async countGeneratorRoom( guildId: string, generatorId: string, day: Date ) {
        await this.retryLostCreate( () => this.prisma.guildGeneratorActivityDay.upsert( {
            where: { generatorId_day: { generatorId, day } },
            create: { guildId, generatorId, day, roomsCreated: 1 },
            update: { roomsCreated: { increment: 1 } }
        } ) );
    }

    /**
     * Function retryLostCreate() :: Write a count, and write it again if it lost the race to create its row.
     *
     * Two rooms made in the same moment can both find the row missing and both try to create it; the loser
     * of that race is retried once, when the row exists and the increment lands on it.
     */
    private async retryLostCreate<TResult>( write: () => Promise<TResult>, isRetry = false ): Promise<TResult> {
        try {
            return await write();
        } catch( error ) {
            const code = error && "object" === typeof error && "code" in error ? error.code : null;

            if ( PRISMA_UNIQUE_CONSTRAINT_FAILED !== code || isRetry ) {
                throw error;
            }

            return await this.retryLostCreate( write, true );
        }
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default GuildActivityModel;
