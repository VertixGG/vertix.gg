import { getDiscordGuilds, refreshAccessToken } from "@vertix.gg/api/src/server/services/auth-service";

import type { DiscordGuild } from "@vertix.gg/api/src/server/services/auth-service";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Whether a guild is this user's, and if not, why the answer could not be yes.
 *
 * Three outcomes rather than a boolean, because "you do not own this" and "we could not ask
 * discord" want different answers on the wire: one is a refusal, the other is a sign-in that has
 * gone stale and is fixed by logging in again.
 */
export type TGuildOwnership =
    | { outcome: "owned"; guild: DiscordGuild }
    | { outcome: "not-owned" }
    | { outcome: "no-token" };

/**
 * Function resolveGuildOwnership() :: Ask discord whether this guild is this user's.
 *
 * Discord rather than our own database, because ownership is discord's fact - ours would be a copy
 * that goes stale the moment a server changes hands. The same question `/auth/guilds` asks to build
 * the dashboard's guild list, which is why it filters on `owner` too.
 */
export async function resolveGuildOwnership( userId: string, guildId: string ): Promise<TGuildOwnership> {
    const accessToken = await refreshAccessToken( userId );

    if ( ! accessToken ) {
        return { outcome: "no-token" };
    }

    const guild = ( await getDiscordGuilds( accessToken ) )
        .find( ( candidate ) => candidate.id === guildId && candidate.owner );

    return guild ? { outcome: "owned", guild } : { outcome: "not-owned" };
}

/**
 * Function requireGuildOwner() :: Whether this session may be told about this guild.
 *
 * For routes that take a guild id in the url rather than acting on the selected one. A guild id is
 * not a secret and arrives in the url, so a route that reads one and trusts it is a route that
 * answers about any server to anybody holding an account.
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

    const ownership = await resolveGuildOwnership( request.session.userId, guildId );

    if ( "no-token" === ownership.outcome ) {
        await reply.status( 401 ).send( { error: "Token expired, please re-login" } );

        return false;
    }

    if ( "not-owned" === ownership.outcome ) {
        // 404 rather than 403. That a server exists but is somebody else's is a fact the asker did
        // not have before asking, and there is no reason to hand it over.
        await reply.status( 404 ).send( { error: "Not found" } );

        return false;
    }

    return true;
}
