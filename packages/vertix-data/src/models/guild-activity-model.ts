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
 * What a server has done with the bot since adding it: set it up, and had rooms made from it.
 *
 * The milestones are firsts, written once and never moved - they answer whether an install turned
 * into a server that runs on the bot, which is what the owner is trying to grow. The day counts are
 * how much it is used now. None of it names a member.
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
     * Function markRoomCreated() :: Count a room a member made, and record the first one ever.
     */
    public async markRoomCreated( guildId: string, at: Date ) {
        await this.prisma.guild.updateMany( {
            where: { guildId, OR: [ { firstRoomAt: { isSet: false } }, { firstRoomAt: null } ] },
            data: { firstRoomAt: at }
        } );

        await this.countRoom( guildId, toUtcDay( at ) );
    }

    /**
     * Function countRoom() :: Add one to a server's rooms for a day.
     *
     * Two rooms made in the same moment can both find the day's row missing and both try to create it;
     * the loser of that race is retried once, when the row exists and the increment lands on it.
     */
    private async countRoom( guildId: string, day: Date, isRetry = false ): Promise<void> {
        try {
            await this.prisma.guildActivityDay.upsert( {
                where: { guildId_day: { guildId, day } },
                create: { guildId, day, roomsCreated: 1 },
                update: { roomsCreated: { increment: 1 } }
            } );
        } catch( error ) {
            const code = error && "object" === typeof error && "code" in error ? error.code : null;

            if ( PRISMA_UNIQUE_CONSTRAINT_FAILED !== code || isRetry ) {
                throw error;
            }

            await this.countRoom( guildId, day, true );
        }
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default GuildActivityModel;
