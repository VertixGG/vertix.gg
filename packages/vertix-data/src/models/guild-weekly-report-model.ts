import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { ModelBase } from "@vertix.gg/data/src/bases/model-base";

import type { TGuildWeeklyReportError } from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

import type { PrismaBot } from "@vertix.gg/prisma/bot-client";

/**
 * Where each server's weekly summary goes, and the last week that went out - one row per server.
 *
 * Every read and write of `guildWeeklyReport` goes through here, so the claim that keeps a week to one
 * post is written once.
 */
export class GuildWeeklyReportModel extends ModelBase<PrismaBot.PrismaClient> {
    private static instance: GuildWeeklyReportModel;

    public static getName(): string {
        return "VertixData/Models/GuildWeeklyReportModel";
    }

    public static getInstance(): GuildWeeklyReportModel {
        if ( ! GuildWeeklyReportModel.instance ) {
            GuildWeeklyReportModel.instance = new GuildWeeklyReportModel();
        }

        return GuildWeeklyReportModel.instance;
    }

    public static get $() {
        return GuildWeeklyReportModel.getInstance();
    }

    /**
     * Function get() :: A server's row, or null when it never picked a channel.
     */
    public async get( guildId: string ) {
        return this.prisma.guildWeeklyReport.findUnique( { where: { guildId } } );
    }

    /**
     * Function save() :: Point a server's summary at a channel - or at none, to turn it off.
     *
     * Saving clears the last error, which was about the channel being replaced. The week last posted
     * stays: a server that moves its summary is not owed last week's twice.
     */
    public async save( guildId: string, channelId: string | null, applicationId: string ) {
        return this.prisma.guildWeeklyReport.upsert( {
            where: { guildId },
            create: { guildId, channelId, applicationId },
            update: { channelId, applicationId, lastError: null }
        } );
    }

    /**
     * Function getPosting() :: The servers a bot posts summaries for - the ones it saved a channel for.
     */
    public async getPosting( applicationId: string ) {
        return this.prisma.guildWeeklyReport.findMany( {
            where: { applicationId, channelId: { not: null } }
        } );
    }

    /**
     * Function claimWeek() :: Take a week's post for a server, unless it was taken already.
     *
     * A filter rather than a read and a write, so two shards and two bots looking at the same row cannot
     * both post it. Rows that never posted have the field unset rather than null, so both are matched.
     *
     * Answers whether this call was the one that took it.
     */
    public async claimWeek( guildId: string, weekStart: Date ): Promise<boolean> {
        const { count } = await this.prisma.guildWeeklyReport.updateMany( {
            where: {
                guildId,
                OR: [
                    { lastWeekStart: { isSet: false } },
                    { lastWeekStart: null },
                    { lastWeekStart: { lt: weekStart } }
                ]
            },
            data: { lastWeekStart: weekStart, lastError: null }
        } );

        return count > 0;
    }

    /**
     * Function recordError() :: Note why a server's week did not go out, for the dashboard to say.
     */
    public async recordError( guildId: string, error: TGuildWeeklyReportError ) {
        await this.prisma.guildWeeklyReport.updateMany( {
            where: { guildId },
            data: { lastError: error }
        } );
    }

    protected getClient() {
        return PrismaBotClient.getPrismaClient();
    }
}

export default GuildWeeklyReportModel;
