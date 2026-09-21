import { getDiscordGuilds, refreshAccessToken } from "@vertix.gg/api/src/server/services/auth-service";

import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Function requireGuildOwner() :: Whether this session may be told about this guild.
 *
 * A guild id is not a secret and arrives in the url, so a route that reads one and trusts it is a
 * route that answers about any server to anybody holding an account. `requireAuth` only establishes
 * that somebody is signed in, which is a different question from whose server this is.
 *
 * Asked of discord rather than of our own database, because ownership is discord's fact - ours
 * would be a copy that goes stale the moment a server changes hands. It is the same question that
 * produced the dashboard's guild list, which filters on `owner`, asked again where it matters.
 *
 * Answers the reply itself and reports whether the caller should carry on, so the refusal is
 * written in one place rather than in every route that needs it.
 */
export async function requireGuildOwner(
    request: FastifyRequest,
    reply: FastifyReply,
    guildId: string
): Promise<boolean> {
    if ( ! request.session.userId ) {
        await reply.status( 401 ).send( { error: "Authentication required" } );

        return false;
    }

    const accessToken = await refreshAccessToken( request.session.userId );

    if ( ! accessToken ) {
        await reply.status( 401 ).send( { error: "Token expired, please re-login" } );

        return false;
    }

    const guilds = await getDiscordGuilds( accessToken );

    if ( ! guilds.some( ( guild ) => guild.id === guildId && guild.owner ) ) {
        // 404 rather than 403. That a server exists but is somebody else's is a fact the asker did
        // not have before asking, and there is no reason to hand it over.
        await reply.status( 404 ).send( { error: "Not found" } );

        return false;
    }

    return true;
}
