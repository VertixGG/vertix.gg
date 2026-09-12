import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

export type AIChannelPromptChange = {
    previous: string | null;
    current: string | null;
};

/**
 * The per-channel instruction the AI Chat bot appends to its base system prompt.
 *
 * Rows are keyed by the raw Discord channel id, so a channel Vertix never created still
 * gets one - unlike everything hung off `Channel`, which exists only for dynamic channels.
 */
export class AIChannelPromptModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: AIChannelPromptModel;

    public static getName(): string {
        return "VertixData/Models/AIChannelPromptModel";
    }

    public static getInstance(): AIChannelPromptModel {
        if ( !AIChannelPromptModel.instance ) {
            AIChannelPromptModel.instance = new AIChannelPromptModel();
        }

        return AIChannelPromptModel.instance;
    }

    public static get $() {
        return AIChannelPromptModel.getInstance();
    }

    /** `null` when the channel has no prompt of its own. */
    public async get( channelId: string ): Promise<string | null> {
        const row = await this.prisma.aIChannelPrompt.findUnique( {
            where: { channelId },
            select: { prompt: true }
        } );

        return row?.prompt ?? null;
    }

    public async set(
        channelId: string,
        guildId: string,
        prompt: string,
        updatedBy: string
    ): Promise<AIChannelPromptChange> {
        const previous = await this.get( channelId );

        await this.prisma.aIChannelPrompt.upsert( {
            where: { channelId },
            create: { channelId, guildId, prompt, updatedBy },
            update: { guildId, prompt, updatedBy }
        } );

        return { previous, current: prompt };
    }

    /** Returns the prompt that was removed, or `null` when there was nothing to remove. */
    public async clear( channelId: string ): Promise<string | null> {
        const previous = await this.get( channelId );

        if ( null === previous ) {
            return null;
        }

        await this.prisma.aIChannelPrompt.delete( { where: { channelId } } );

        return previous;
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default AIChannelPromptModel;
