import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

export type AICaptchaChallengeRecord = {
    answer: string;
    attempts: number;
    expiresAt: Date;
};

/**
 * The pending word for one person in one channel.
 *
 * Kept in the bot's own database rather than in memory because the agent that posed the question
 * and the one that reads the reply are different processes, minutes apart.
 */
export class AICaptchaChallengeModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: AICaptchaChallengeModel;

    public static getName(): string {
        return "VertixData/Models/AICaptchaChallengeModel";
    }

    public static getInstance(): AICaptchaChallengeModel {
        if ( !AICaptchaChallengeModel.instance ) {
            AICaptchaChallengeModel.instance = new AICaptchaChallengeModel();
        }

        return AICaptchaChallengeModel.instance;
    }

    public static get $() {
        return AICaptchaChallengeModel.getInstance();
    }

    /** Replaces any challenge already waiting, so only the newest word is ever accepted. */
    public async put(
        channelId: string,
        userId: string,
        guildId: string,
        answer: string,
        expiresAt: Date
    ): Promise<void> {
        const data = { channelId, userId, guildId, answer, expiresAt, attempts: 0 };

        await this.prisma.aICaptchaChallenge.upsert( {
            where: { channelId_userId: { channelId, userId } },
            create: data,
            update: data
        } );
    }

    public async get( channelId: string, userId: string ): Promise<AICaptchaChallengeRecord | null> {
        return await this.prisma.aICaptchaChallenge.findUnique( {
            where: { channelId_userId: { channelId, userId } },
            select: { answer: true, attempts: true, expiresAt: true }
        } );
    }

    public async countAttempt( channelId: string, userId: string ): Promise<number> {
        const row = await this.prisma.aICaptchaChallenge.update( {
            where: { channelId_userId: { channelId, userId } },
            data: { attempts: { increment: 1 } },
            select: { attempts: true }
        } );

        return row.attempts;
    }

    public async clear( channelId: string, userId: string ): Promise<void> {
        await this.prisma.aICaptchaChallenge.deleteMany( { where: { channelId, userId } } );
    }

    /** Sweeps whatever nobody ever answered, so the collection does not grow without bound. */
    public async clearExpired(): Promise<number> {
        const result = await this.prisma.aICaptchaChallenge.deleteMany( {
            where: { expiresAt: { lt: new Date() } }
        } );

        return result.count;
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default AICaptchaChallengeModel;
