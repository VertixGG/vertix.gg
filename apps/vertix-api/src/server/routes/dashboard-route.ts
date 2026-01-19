import {
    getGlobalStats,
    getGuildStats,
    getGuildDetails,
    checkGuildAccess
} from "@vertix.gg/api/src/server/services/dashboard-service";
import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

async function handleGetGlobalStats( _request: FastifyRequest, reply: FastifyReply ) {
    try {
        const stats = await getGlobalStats();
        return stats;
    } catch ( error ) {
        handleError( handleGetGlobalStats, error, reply, "Failed to fetch global stats" );
    }
}

async function handleGetGuildStats(
    request: FastifyRequest<{ Params: { guildId: string } }>,
    reply: FastifyReply
) {
    try {
        const { guildId } = request.params;

        const hasAccess = await checkGuildAccess( guildId );

        if ( !hasAccess ) {
            return reply.status( 404 ).send( { error: "Guild not found" } );
        }

        const stats = await getGuildStats( guildId );

        if ( !stats ) {
            return reply.status( 404 ).send( { error: "Guild not found" } );
        }

        return stats;
    } catch ( error ) {
        handleError( handleGetGuildStats, error, reply, "Failed to fetch guild stats" );
    }
}

async function handleGetGuildDetails(
    request: FastifyRequest<{ Params: { guildId: string } }>,
    reply: FastifyReply
) {
    try {
        const { guildId } = request.params;

        const hasAccess = await checkGuildAccess( guildId );

        if ( !hasAccess ) {
            return reply.status( 404 ).send( { error: "Guild not found" } );
        }

        const details = await getGuildDetails( guildId );

        if ( !details ) {
            return reply.status( 404 ).send( { error: "Guild not found" } );
        }

        return details;
    } catch ( error ) {
        handleError( handleGetGuildDetails, error, reply, "Failed to fetch guild details" );
    }
}

const dashboardRoutePlugin: FastifyPluginAsync = async ( fastify: FastifyInstance ): Promise<void> => {
    fastify.get( "/dashboard/stats/global", handleGetGlobalStats );

    fastify.get<{ Params: { guildId: string } }>(
        "/dashboard/stats/guild/:guildId",
        handleGetGuildStats
    );

    fastify.get<{ Params: { guildId: string } }>(
        "/dashboard/guild/:guildId",
        handleGetGuildDetails
    );
};

export default dashboardRoutePlugin;
