import { GuildWeeklyReportModel } from "@vertix.gg/data/src/models/guild-weekly-report-model";

import {
    GUILD_WEEKLY_REPORT_SAVE_REFUSALS,
    isGuildWeeklyReportError
} from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

import type {
    IGuildPostStatus,
    IGuildWeeklyReportView,
    TGuildWeeklyReportSaveRefusal
} from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

/** A discord id, as a channel's is. */
const SNOWFLAKE_PATTERN = /^\d{17,20}$/;

/**
 * What saving came to - the summary as it now stands, or why the bot would not take the channel.
 */
export type TGuildWeeklyReportSaveResult =
    | { view: IGuildWeeklyReportView; refusal: null; missingPermissions: null }
    | { view: null; refusal: TGuildWeeklyReportSaveRefusal; missingPermissions: string[] | null };

/** How the bot is asked whether it can post in a channel - null when it could not be asked. */
export type TAskBotForPostStatus = ( guildId: string, channelId: string ) => Promise<IGuildPostStatus | null>;

/**
 * Function readGuildWeeklyReportChannel() :: The channel a save asks for - a channel id, or null to turn the
 * summary off - or undefined when the body is not a save at all.
 */
export function readGuildWeeklyReportChannel( body: unknown ): string | null | undefined {
    if ( ! body || "object" !== typeof body || ! ( "channelId" in body ) ) {
        return undefined;
    }

    const { channelId } = body as { channelId: unknown };

    if ( null === channelId ) {
        return null;
    }

    return "string" === typeof channelId && SNOWFLAKE_PATTERN.test( channelId ) ? channelId : undefined;
}

function toView( row: Awaited<ReturnType<typeof GuildWeeklyReportModel.$.get>> ): IGuildWeeklyReportView {
    return {
        channelId: row?.channelId ?? null,
        lastWeekStart: row?.lastWeekStart?.toISOString() ?? null,
        lastError: row && isGuildWeeklyReportError( row.lastError ) ? row.lastError : null
    };
}

/**
 * Function getGuildWeeklyReport() :: A server's weekly summary as the dashboard shows it - off for one that
 * never picked a channel.
 */
export async function getGuildWeeklyReport( guildId: string ): Promise<IGuildWeeklyReportView> {
    return toView( await GuildWeeklyReportModel.$.get( guildId ) );
}

/**
 * Function saveGuildWeeklyReport() :: Point a server's weekly summary at a channel, or turn it off.
 *
 * A channel is saved only on the bot's word that it can post there, and under the bot that said so -
 * that bot is then the one that posts it, since two bots read this database. Turning it off needs no
 * word from anybody.
 */
export async function saveGuildWeeklyReport(
    guildId: string,
    channelId: string | null,
    askBot: TAskBotForPostStatus
): Promise<TGuildWeeklyReportSaveResult> {
    if ( null === channelId ) {
        const row = await GuildWeeklyReportModel.$.get( guildId );

        // Nothing to turn off for a server that never turned it on.
        const saved = row ? await GuildWeeklyReportModel.$.save( guildId, null, row.applicationId ) : null;

        return { view: toView( saved ), refusal: null, missingPermissions: null };
    }

    const status = await askBot( guildId, channelId );

    if ( ! status ) {
        return { view: null, refusal: GUILD_WEEKLY_REPORT_SAVE_REFUSALS.BOT_UNREACHABLE, missingPermissions: null };
    }

    if ( ! status.isBotInGuild ) {
        return { view: null, refusal: GUILD_WEEKLY_REPORT_SAVE_REFUSALS.BOT_NOT_IN_GUILD, missingPermissions: null };
    }

    if ( ! status.missingPermissions || status.missingPermissions.length ) {
        return {
            view: null,
            refusal: GUILD_WEEKLY_REPORT_SAVE_REFUSALS.CHANNEL_UNUSABLE,
            missingPermissions: status.missingPermissions
        };
    }

    const saved = await GuildWeeklyReportModel.$.save( guildId, channelId, status.applicationId );

    return { view: toView( saved ), refusal: null, missingPermissions: null };
}
