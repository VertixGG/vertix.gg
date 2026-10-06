import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/** Prisma's code for a write that lost a race to create the same unique row. */
const PRISMA_UNIQUE_CONSTRAINT_FAILED = "P2002";

/**
 * The members who were in a server's rooms, one row per member per UTC day.
 *
 * Only ever counted - "members in rooms this week" - and never listed back, so nothing reads who they
 * were. Deleted once older than anything counts back over.
 */
export class GuildVoiceMemberModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: GuildVoiceMemberModel;

    public static getName(): string {
        return "VertixData/Models/GuildVoiceMemberModel";
    }

    public static getInstance(): GuildVoiceMemberModel {
        if ( ! GuildVoiceMemberModel.instance ) {
            GuildVoiceMemberModel.instance = new GuildVoiceMemberModel();
        }

        return GuildVoiceMemberModel.instance;
    }

    public static get $() {
        return GuildVoiceMemberModel.getInstance();
    }

    /**
     * Function markPresent() :: Note a member in one of a server's rooms on a day, if they were not noted already.
     *
     * A day's row is the same row however often they come, so a second note changes nothing - and two
     * notes racing to create it are the same: the loser finds it already there.
     */
    public async markPresent( guildId: string, userId: string, day: Date ) {
        try {
            await this.prisma.guildVoiceMemberDay.upsert( {
                where: { guildId_day_userId: { guildId, day, userId } },
                create: { guildId, day, userId },
                update: {}
            } );
        } catch( error ) {
            const code = error && "object" === typeof error && "code" in error ? error.code : null;

            if ( PRISMA_UNIQUE_CONSTRAINT_FAILED !== code ) {
                throw error;
            }
        }
    }

    /**
     * Function countMembers() :: How many members were in a server's rooms from one day up to, not including, another.
     */
    public async countMembers( guildId: string, from: Date, to: Date ): Promise<number> {
        const rows = await this.prisma.guildVoiceMemberDay.findMany( {
            where: { guildId, day: { gte: from, lt: to } },
            select: { userId: true },
            distinct: [ "userId" ]
        } );

        return rows.length;
    }

    /**
     * Function getCountedSince() :: The first day members were counted in any server, or null while none has been.
     */
    public async getCountedSince(): Promise<Date | null> {
        const first = await this.prisma.guildVoiceMemberDay.findFirst( {
            orderBy: { day: "asc" },
            select: { day: true }
        } );

        return first?.day ?? null;
    }

    /**
     * Function deleteBefore() :: Delete every day before this one, in every server.
     */
    public async deleteBefore( day: Date ): Promise<number> {
        const { count } = await this.prisma.guildVoiceMemberDay.deleteMany( {
            where: { day: { lt: day } }
        } );

        return count;
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default GuildVoiceMemberModel;
