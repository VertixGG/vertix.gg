import {
    getGlobalStats,
    getGuildStats,
    getGuildDetails,
    getGuildBotPresence
} from "@vertix.gg/api/src/server/services/dashboard-service";
import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

interface GuildParams {
    guildId: string;
}

/**
 * Middleware to verify user has access to the requested guild.
 */
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

async function handleGetGlobalStats( _request: FastifyRequest, reply: FastifyReply ) {
    try {
        const stats = await getGlobalStats();
        return stats;
    } catch( error ) {
        handleError( handleGetGlobalStats, error, reply, "Failed to fetch global stats" );
    }
}

async function handleGetGuildStats(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    try {
        const { guildId } = request.params;
        const stats = await getGuildStats( guildId );

        if ( !stats ) {
            return reply.status( 404 ).send( { error: "Guild not found" } );
        }

        return stats;
    } catch( error ) {
        handleError( handleGetGuildStats, error, reply, "Failed to fetch guild stats" );
    }
}

async function handleGetGuildDetails(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    try {
        const { guildId } = request.params;
        const details = await getGuildDetails( guildId );

        if ( !details ) {
            return reply.status( 404 ).send( { error: "Guild not found" } );
        }

        return details;
    } catch( error ) {
        handleError( handleGetGuildDetails, error, reply, "Failed to fetch guild details" );
    }
}

async function handleGetGuildBotPresence(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    try {
        const { guildId } = request.params;

        return await getGuildBotPresence( guildId );
    } catch( error ) {
        handleError( handleGetGuildBotPresence, error, reply, "Failed to check bot presence" );
    }
}

const dashboardRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    // Global stats doesn't need guild access check
    fastify.get( "/dashboard/stats/global", handleGetGlobalStats );

    // Guild-specific routes need access check
    fastify.register( async( guildRoutes ) => {
        guildRoutes.addHook( "preHandler", requireGuildAccess );

        guildRoutes.get<{ Params: GuildParams }>(
            "/dashboard/stats/guild/:guildId",
            handleGetGuildStats
        );

        guildRoutes.get<{ Params: GuildParams }>(
            "/dashboard/guild/:guildId",
            handleGetGuildDetails
        );

        guildRoutes.get<{ Params: GuildParams }>(
            "/dashboard/guild/:guildId/bot-presence",
            handleGetGuildBotPresence
        );
    } );
};

export default dashboardRoutePlugin;
