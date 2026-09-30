import {
    getGlobalStats,
    getGrowthStats,
    getGuildActivity,
    getGuildEventsStats,
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

/**
 * Function isOwnerRequest() :: Whether the request comes from the owner of the bot.
 *
 * Never true while no owner is configured - an unset id would otherwise match a session without one.
 */
export function isOwnerRequest( request: FastifyRequest ): boolean {
    const ownerId = process.env.OWNERD_ID;

    return !! ownerId && request.session.userId === ownerId;
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

async function handleGetGuildActivity(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    try {
        return await getGuildActivity( request.params.guildId );
    } catch( error ) {
        handleError( handleGetGuildActivity, error, reply, "Failed to fetch guild activity" );
    }
}

async function handleGetGuildEventsStats(
    request: FastifyRequest<{ Params: GuildParams }>,
    reply: FastifyReply
) {
    try {
        return await getGuildEventsStats( request.params.guildId );
    } catch( error ) {
        handleError( handleGetGuildEventsStats, error, reply, "Failed to fetch guild events stats" );
    }
}

/**
 * What became of every install, by the link it came through - business figures, for the owner only.
 */
async function handleGetGrowthStats( request: FastifyRequest, reply: FastifyReply ) {
    if ( ! isOwnerRequest( request ) ) {
        return reply.status( 403 ).send( { error: "Access denied" } );
    }

    try {
        return await getGrowthStats();
    } catch( error ) {
        handleError( handleGetGrowthStats, error, reply, "Failed to fetch growth stats" );
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

    fastify.get( "/dashboard/stats/growth", handleGetGrowthStats );

    // Guild-specific routes need access check
    fastify.register( async( guildRoutes ) => {
        guildRoutes.addHook( "preHandler", requireGuildAccess );

        guildRoutes.get<{ Params: GuildParams }>(
            "/dashboard/stats/guild/:guildId",
            handleGetGuildStats
        );

        guildRoutes.get<{ Params: GuildParams }>(
            "/dashboard/stats/guild/:guildId/activity",
            handleGetGuildActivity
        );

        guildRoutes.get<{ Params: GuildParams }>(
            "/dashboard/stats/guild/:guildId/events",
            handleGetGuildEventsStats
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
