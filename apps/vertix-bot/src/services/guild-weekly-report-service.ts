import { ChannelType, PermissionsBitField } from "discord.js";

import { GuildActivityModel, toUtcDay } from "@vertix.gg/data/src/models/guild-activity-model";
import { GuildVoiceMemberModel } from "@vertix.gg/data/src/models/guild-voice-member-model";
import { GuildWeeklyReportModel } from "@vertix.gg/data/src/models/guild-weekly-report-model";

import { buildGuildWeeklySummary } from "@vertix.gg/data/src/reports/guild-weekly-report";

import {
    GUILD_VOICE_MEMBERS_KEEP_DAYS,
    GUILD_WEEKLY_REPORT_ERRORS,
    GUILD_WEEKLY_REPORT_TIMINGS,
    addWeeks,
    resolveReportedWeekStart
} from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";

import { ownsGuild } from "@vertix.gg/bot/src/definitions/sharding";

import { PermissionsManager } from "@vertix.gg/bot/src/managers/permissions-manager";

import type { Guild, TextChannel } from "discord.js";

import type { IGuildPostStatus, IGuildWeeklySummary } from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

import type { UIService } from "@vertix.gg/gui/src/ui-service";

import type { AppService } from "@vertix.gg/bot/src/services/app-service";

const DAY_MS = 24 * 60 * 60 * 1000;

const MS_PER_SECOND = 1000;

/** What the bot needs in a channel to post a summary there - see it, write in it, and show an embed. */
export const WEEKLY_REPORT_CHANNEL_BOT_PERMISSIONS = new PermissionsBitField( [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.EmbedLinks
] );

/**
 * Function getMissingWeeklyReportPermissions() :: What the bot lacks to post a summary in a channel - empty when
 * it can - or null when it is not a text channel the bot can see.
 */
export function getMissingWeeklyReportPermissions( guild: Guild, channelId: string ): string[] | null {
    const channel = guild.channels.cache.get( channelId );

    if ( ! channel || ChannelType.GuildText !== channel.type ) {
        return null;
    }

    return PermissionsManager.$.getMissingChannelPermissionsForBot( channel, WEEKLY_REPORT_CHANNEL_BOT_PERMISSIONS );
}

/**
 * Function toWeeklyReportArgs() :: A summary as the weekly report adapter takes it - seconds for discord
 * timestamps, an empty id and a zero for what the week had none of.
 */
export function toWeeklyReportArgs( summary: IGuildWeeklySummary ) {
    return {
        weekStart: Math.floor( summary.weekStart.getTime() / MS_PER_SECOND ),
        rooms: summary.rooms,
        roomsBefore: summary.roomsBefore,
        members: summary.members,
        membersBefore: summary.membersBefore,
        busiestHour: summary.busiestHour ? Math.floor( summary.busiestHour.getTime() / MS_PER_SECOND ) : 0,
        topGeneratorId: summary.topGenerator?.generatorId ?? "",
        topGeneratorRooms: summary.topGenerator?.rooms ?? 0
    };
}

/**
 * Posts each server's weekly summary, in the channel it picked on the dashboard, once the week is over.
 *
 * Only for the servers this bot saved a channel for - TestVC and production read the same rows - and
 * only those this shard speaks for. A week is claimed on the row before it is posted, so two shards and
 * two bots cannot both post it; a week that could not go out is not tried again, and the dashboard
 * says why.
 *
 * Its sweep also deletes the members' days in rooms that nothing counts back over any more.
 */
export class GuildWeeklyReportService extends ServiceWithDependenciesBase<{
    appService: AppService;
    uiService: UIService;
}> {
    private sweepInterval?: NodeJS.Timeout;

    /** Whether a sweep is still going - the next one waits for its turn rather than running over it. */
    private isSweeping = false;

    public static getName() {
        return "VertixBot/Services/GuildWeeklyReport";
    }

    public getDependencies() {
        return {
            appService: "VertixBot/Services/App",
            uiService: "VertixGUI/UIService"
        };
    }

    protected async initialize() {
        await super.initialize();

        this.services.appService.onceReady( async() => {
            this.scheduleSweep();
        } );
    }

    /**
     * Function getPostStatus() :: Whether this bot can post a summary in a channel.
     *
     * Asked by the dashboard before it saves one, and whichever bot answers is the one that posts there.
     */
    public getPostStatus( guildId: string, channelId: string ): IGuildPostStatus {
        const client = this.services.appService.getClient(),
            guild = client.guilds.cache.get( guildId );

        if ( ! guild ) {
            return { applicationId: client.user.id, isBotInGuild: false, missingPermissions: null };
        }

        return {
            applicationId: client.user.id,
            isBotInGuild: true,
            missingPermissions: getMissingWeeklyReportPermissions( guild, channelId )
        };
    }

    /**
     * Function sweep() :: Post the week that just ended for every server this process speaks for that has not had it.
     */
    public async sweep( now: Date = new Date() ): Promise<void> {
        const client = this.services.appService.getClient();

        if ( ! client?.user || this.isSweeping ) {
            return;
        }

        this.isSweeping = true;

        try {
            await GuildVoiceMemberModel.$.deleteBefore(
                new Date( toUtcDay( now ).getTime() - GUILD_VOICE_MEMBERS_KEEP_DAYS * DAY_MS )
            );

            const weekStart = resolveReportedWeekStart( now );

            for ( const report of await GuildWeeklyReportModel.$.getPosting( client.user.id ) ) {
                // Read before claiming, so a week already out costs no write a sweep.
                if ( report.lastWeekStart && report.lastWeekStart.getTime() >= weekStart.getTime() ) {
                    continue;
                }

                // The rows name every server this bot posts for; this process only speaks for its own.
                const guild = ownsGuild( report.guildId ) ? client.guilds.cache.get( report.guildId ) : undefined;

                if ( ! guild || ! report.channelId ) {
                    continue;
                }

                try {
                    await this.post( guild, report.channelId, weekStart );
                } catch( error ) {
                    this.logger.error( this.sweep, `Guild id: '${ guild.id }' - Could not post the weekly summary`, error );
                }
            }
        } finally {
            this.isSweeping = false;
        }
    }

    private scheduleSweep() {
        if ( this.sweepInterval ) {
            return;
        }

        const pass = () => this.sweep().catch( ( error ) => {
            this.logger.error( this.scheduleSweep, "Weekly summary sweep failed", error );
        } );

        this.sweepInterval = setInterval( pass, GUILD_WEEKLY_REPORT_TIMINGS.SWEEP_INTERVAL_MS );

        pass();
    }

    /**
     * Function post() :: Post one server's week, if nobody has taken it - or note why it could not go out.
     */
    private async post( guild: Guild, channelId: string, weekStart: Date ) {
        if ( ! await GuildWeeklyReportModel.$.claimWeek( guild.id, weekStart ) ) {
            return;
        }

        const missingPermissions = getMissingWeeklyReportPermissions( guild, channelId );

        if ( null === missingPermissions || missingPermissions.length ) {
            const error = null === missingPermissions
                ? GUILD_WEEKLY_REPORT_ERRORS.CHANNEL_MISSING
                : GUILD_WEEKLY_REPORT_ERRORS.CHANNEL_FORBIDDEN;

            await GuildWeeklyReportModel.$.recordError( guild.id, error );

            this.logger.warn( this.post, `Guild id: '${ guild.id }' - Weekly summary not posted in '${ channelId }': '${ error }'` );

            return;
        }

        const adapter = this.services.uiService.get( "VertixBot/UI-General/WeeklyReportAdapter" );

        if ( ! adapter ) {
            this.logger.error( this.post, `Guild id: '${ guild.id }' - Failed to get the weekly report adapter` );

            return;
        }

        const channel = guild.channels.cache.get( channelId ) as TextChannel,
            summary = await this.summarize( guild.id, weekStart );

        try {
            await channel.send( await adapter.render( channel, toWeeklyReportArgs( summary ) ) );
        } catch( error ) {
            await GuildWeeklyReportModel.$.recordError( guild.id, GUILD_WEEKLY_REPORT_ERRORS.CHANNEL_FORBIDDEN );

            this.logger.warn( this.post, `Guild id: '${ guild.id }' - Discord refused the weekly summary in '${ channelId }'`, error );

            return;
        }

        this.logger.info( this.post,
            `Guild id: '${ guild.id }' - Weekly summary for '${ weekStart.toISOString() }' posted in '${ channelId }'`
        );
    }

    /**
     * Function summarize() :: A server's week, beside the week before, from its counts.
     */
    private async summarize( guildId: string, weekStart: Date ): Promise<IGuildWeeklySummary> {
        const weekEnd = addWeeks( weekStart, 1 ),
            weekBefore = addWeeks( weekStart, -1 );

        const [ days, hours, generators, members, membersBefore ] = await Promise.all( [
            GuildActivityModel.$.getDays( guildId, weekBefore, weekEnd ),
            GuildActivityModel.$.getHours( guildId, weekStart, weekEnd ),
            GuildActivityModel.$.getGeneratorDays( guildId, weekStart, weekEnd ),
            GuildVoiceMemberModel.$.countMembers( guildId, weekStart, weekEnd ),
            GuildVoiceMemberModel.$.countMembers( guildId, weekBefore, weekStart )
        ] );

        return buildGuildWeeklySummary( { weekStart, days, hours, generators, members, membersBefore } );
    }
}

export default GuildWeeklyReportService;
