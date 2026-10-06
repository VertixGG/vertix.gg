import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { GUILD_WEEKLY_REPORT_SAVE_REFUSALS } from "@vertix.gg/definitions/src/guild-weekly-report-definitions";

import {
    getGuildWeeklyReport,
    readGuildWeeklyReportChannel,
    saveGuildWeeklyReport
} from "@vertix.gg/api/src/server/services/guild-weekly-report-service";

import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

import type { ManagementService } from "@vertix.gg/api/src/server/services/management-service";

interface GuildParams {
    guildId: string;
}

async function requireGuildAccess(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    const { guildId } = request.params;
    const selectedGuild = request.session.selectedGuild;

    if ( !selectedGuild || selectedGuild.id !== guildId ) {
        return reply.status( 403 ).send( { error: "Access denied" } );
    }
}

async function handleGetWeeklyReport(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    try {
        return await getGuildWeeklyReport( request.params.guildId );
    } catch( error ) {
        handleError( handleGetWeeklyReport, error, reply, "Failed to fetch the weekly summary" );
    }
}

async function handleSaveWeeklyReport(
    request: FastifyRequest<{ Params: GuildParams; Body: unknown }>,
    reply: FastifyReply
) {
    try {
        const channelId = readGuildWeeklyReportChannel( request.body );

        if ( undefined === channelId ) {
            return reply.status( 400 ).send( { error: "Send a channel id, or null to turn the weekly summary off" } );
        }

        const managementService = ServiceLocator.$.get<ManagementService>( "VertixAPI/Services/Management", { silent: true } );

        const result = await saveGuildWeeklyReport(
            request.params.guildId,
            channelId,
            async( guildId, picked ) => managementService ? managementService.getGuildPostStatus( guildId, picked ) : null
        );

        if ( result.view ) {
            return result.view;
        }

        // Refusals are answers rather than failures, so they carry their code for the screen to word.
        const status = GUILD_WEEKLY_REPORT_SAVE_REFUSALS.BOT_UNREACHABLE === result.refusal ? 503 : 409;

        return reply.status( status ).send( { error: result.refusal, missingPermissions: result.missingPermissions } );
    } catch( error ) {
        handleError( handleSaveWeeklyReport, error, reply, "Failed to save the weekly summary" );
    }
}

/**
 * Where a server's weekly summary is posted - read and changed from the dashboard's home page.
 *
 * A channel is saved only once the bot has said it can post there; see `saveGuildWeeklyReport()`.
 */
const weeklyReportRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.register( async( guildRoutes ) => {
        guildRoutes.addHook( "preHandler", requireGuildAccess );

        guildRoutes.get( "/management/guild/:guildId/weekly-report", handleGetWeeklyReport );
        guildRoutes.put( "/management/guild/:guildId/weekly-report", handleSaveWeeklyReport );
    } );
};

export default weeklyReportRoutePlugin;
