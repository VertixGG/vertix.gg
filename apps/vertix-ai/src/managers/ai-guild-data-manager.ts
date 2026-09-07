import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { PrismaAIClient } from "@vertix.gg/prisma/ai-client";

import { PromptManager } from "@vertix.gg/ai/src/managers/prompt-manager";

import { PROMPT_NAMES } from "@vertix.gg/ai/src/definitions/prompt-definitions";

import type { E_AI_TRIGGER_EVENT } from "@vertix.gg/prisma/._ai-client-internal";

export type SystemPromptChange = {
    previousPrompt: string | null;
    prompt: string | null;
};

export type TriggerSettings = {
    events: E_AI_TRIGGER_EVENT[];
    channelIds: string[];
};

/**
 * Per-guild configuration for Vertix AI, stored in this app's own database and
 * keyed by the raw Discord guild id.
 *
 * Deliberately not built on the bot's `GuildData` collection: reading through
 * that requires a `Guild` row to already exist and throws when it does not,
 * which would break every guild that invited Vertix AI without Vertix.
 */
export class AIGuildDataManager extends InitializeBase {
    private static instance: AIGuildDataManager;

    public static getName() {
        return "VertixAI/Managers/AIGuildData";
    }

    public static getInstance(): AIGuildDataManager {
        if ( !AIGuildDataManager.instance ) {
            AIGuildDataManager.instance = new AIGuildDataManager();
        }

        return AIGuildDataManager.instance;
    }

    public static get $() {
        return AIGuildDataManager.getInstance();
    }

    /**
     * Always returns something usable - a guild that has never customised its
     * prompt still gets the shipped default, so the download button never hands
     * anyone an empty file.
     */
    public async getSystemPrompt( guildId: string ): Promise<string> {
        return await this.getCustomSystemPrompt( guildId ) ?? PromptManager.$.get( PROMPT_NAMES.SystemDefault );
    }

    /** `null` when the guild is still on the shipped default. */
    public async getCustomSystemPrompt( guildId: string ): Promise<string | null> {
        const settings = await PrismaAIClient.$.getClient().aIGuildSettings.findUnique( {
            where: { guildId },
            select: { systemPrompt: true }
        } );

        return settings?.systemPrompt ?? null;
    }

    public async hasCustomSystemPrompt( guildId: string ): Promise<boolean> {
        return null !== await this.getCustomSystemPrompt( guildId );
    }

    /** Passing `null` clears the override and returns the guild to the default. */
    public async setSystemPrompt( guildId: string, prompt: string | null, shouldAdminLog = true ): Promise<SystemPromptChange> {
        const previousPrompt = await this.getCustomSystemPrompt( guildId );

        await PrismaAIClient.$.getClient().aIGuildSettings.upsert( {
            where: { guildId },
            create: { guildId, systemPrompt: prompt },
            update: { systemPrompt: prompt }
        } );

        if ( shouldAdminLog ) {
            this.logger.admin(
                this.setSystemPrompt,
                `🧠  AI system prompt modified - guildId: "${ guildId }", ` +
                `"${ previousPrompt?.length ?? 0 }" => "${ prompt?.length ?? 0 }" chars`
            );
        }

        return { previousPrompt, prompt };
    }

    /**
     * Which Discord events wake the AI in this guild.
     *
     * Defaults to none: a bot that starts acting on member joins the moment it
     * is invited would be a surprise, so every event is opt-in.
     */
    public async getTriggerSettings( guildId: string ): Promise<TriggerSettings> {
        const settings = await PrismaAIClient.$.getClient().aIGuildSettings.findUnique( {
            where: { guildId },
            select: { triggerEvents: true, triggerChannelIds: true }
        } );

        return {
            events: settings?.triggerEvents ?? [],
            channelIds: settings?.triggerChannelIds ?? []
        };
    }

    public async isTriggerEnabled( guildId: string, event: E_AI_TRIGGER_EVENT ): Promise<boolean> {
        return ( await this.getTriggerSettings( guildId ) ).events.includes( event );
    }

    public async setTriggerEvents( guildId: string, events: E_AI_TRIGGER_EVENT[] ): Promise<void> {
        await PrismaAIClient.$.getClient().aIGuildSettings.upsert( {
            where: { guildId },
            create: { guildId, triggerEvents: events },
            update: { triggerEvents: events }
        } );

        this.logger.admin(
            this.setTriggerEvents,
            `🎚️  AI trigger events - guildId: "${ guildId }" => "${ events.join( ", " ) || "none" }"`
        );
    }

    public async setTriggerChannels( guildId: string, channelIds: string[] ): Promise<void> {
        await PrismaAIClient.$.getClient().aIGuildSettings.upsert( {
            where: { guildId },
            create: { guildId, triggerChannelIds: channelIds },
            update: { triggerChannelIds: channelIds }
        } );

        this.logger.admin(
            this.setTriggerChannels,
            `🎚️  AI trigger channels - guildId: "${ guildId }" => "${ channelIds.length }" channels`
        );
    }

    /** Removes every stored setting for a guild - used when the bot is kicked. */
    public async deleteGuild( guildId: string ): Promise<void> {
        await PrismaAIClient.$.getClient().aIGuildSettings.deleteMany( { where: { guildId } } );

        this.logger.log( this.deleteGuild, `Deleted settings for guildId: '${ guildId }'` );
    }
}

export default AIGuildDataManager;
