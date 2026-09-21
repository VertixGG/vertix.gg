import { getDiscordGuilds, refreshAccessToken } from "@vertix.gg/api/src/server/services/auth-service";

import type { DiscordGuild } from "@vertix.gg/api/src/server/services/auth-service";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * The parts of a guild worth keeping once ownership is known.
 *
 * The name and icon come along because the one screen that asks this question also draws them, and
 * fetching them separately would mean asking discord twice for one answer.
 */
export interface IOwnedGuild {
    id: string;
    name: string;
    icon: string | null;
}

/**
 * How long an owned-guild list is trusted without asking again.
 *
 * Discord rate limits `/users/@me/guilds` hard enough that the dashboard's own flow trips it: it
 * lists the guilds and then selects one, which is two calls within a second. Short enough that
 * losing a server is noticed quickly, long enough that a normal session asks once.
 */
const OWNED_GUILDS_FRESH_MS = 5 * 60 * 1000;

/**
 * How old a list may be and still be used when discord cannot be reached at all.
 *
 * Only for the case where the call fails outright - a rate limit, an outage. Answering 500 there
 * would lock somebody out of their own dashboard because discord is busy, and refusing on stale
 * information is a smaller wrong than that, as long as it cannot go on for ever.
 */
const OWNED_GUILDS_STALE_MS = 60 * 60 * 1000;

/**
 * Whether a guild is this user's, and if not, why the answer could not be yes.
 *
 * Three outcomes rather than a boolean, because "you do not own this" and "we could not ask
 * discord" want different answers on the wire: one is a refusal, the other is a sign-in that has
 * gone stale and is fixed by logging in again.
 */
export type TGuildOwnership =
    | { outcome: "owned"; guild: IOwnedGuild }
    | { outcome: "not-owned" }
    | { outcome: "no-token" };

/** The shape stored on the session, kept here because this is what reads it back. */
const toOwnedGuilds = ( guilds: DiscordGuild[] ): IOwnedGuild[] =>
    guilds
        .filter( ( guild ) => guild.owner )
        .map( ( guild ) => ( { id: guild.id, name: guild.name, icon: guild.icon } ) );

const pick = ( guilds: IOwnedGuild[], guildId: string ): TGuildOwnership => {
    const guild = guilds.find( ( candidate ) => candidate.id === guildId );

    return guild ? { outcome: "owned", guild } : { outcome: "not-owned" };
};

/**
 * Function cacheOwnedGuilds() :: Keep a list discord has just given us.
 *
 * Called by the route that lists guilds, so that selecting one immediately afterwards - which is
 * exactly what the dashboard does - costs nothing rather than a second call into a rate limit.
 */
export function cacheOwnedGuilds( request: FastifyRequest, guilds: DiscordGuild[] ): void {
    request.session.ownedGuilds = { guilds: toOwnedGuilds( guilds ), fetchedAt: Date.now() };
}

/**
 * Function resolveGuildOwnership() :: Ask discord whether this guild is this user's.
 *
 * Discord rather than our own database, because ownership is discord's fact - ours would be a copy
 * that goes stale the moment a server changes hands. The same question `/auth/guilds` asks to build
 * the list the dashboard offers, which is why that list is filtered on `owner` too.
 */
export async function resolveGuildOwnership( request: FastifyRequest, guildId: string ): Promise<TGuildOwnership> {
    const userId = request.session.userId;

    if ( ! userId ) {
        return { outcome: "no-token" };
    }

    const cached = request.session.ownedGuilds;

    if ( cached && Date.now() - cached.fetchedAt < OWNED_GUILDS_FRESH_MS ) {
        return pick( cached.guilds, guildId );
    }

    const accessToken = await refreshAccessToken( userId );

    if ( ! accessToken ) {
        return { outcome: "no-token" };
    }

    let guilds: IOwnedGuild[];

    try {
        guilds = toOwnedGuilds( await getDiscordGuilds( accessToken ) );
    } catch( error ) {
        if ( cached && Date.now() - cached.fetchedAt < OWNED_GUILDS_STALE_MS ) {
            request.log.warn( error, "Discord would not list guilds - deciding on a stale owned list" );

            return pick( cached.guilds, guildId );
        }

        throw error;
    }

    request.session.ownedGuilds = { guilds, fetchedAt: Date.now() };

    await request.session.save();

    return pick( guilds, guildId );
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

    const ownership = await resolveGuildOwnership( request, guildId );

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
