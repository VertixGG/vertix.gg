import { discordConfig } from "@vertix.gg/api/src/server/config/discord";
import {
    exchangeCodeForToken,
    getDiscordUser,
    getDiscordGuilds,
    generateState,
    upsertUser,
    upsertToken,
    getUserById,
    refreshAccessToken,
    deleteUserToken
} from "@vertix.gg/api/src/server/services/auth-service";
import { selectGuildIdsWithBot } from "@vertix.gg/api/src/server/services/dashboard-service";
import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import { cacheOwnedGuilds, resolveGuildOwnership } from "@vertix.gg/api/src/server/middleware/guild-access";

import type { IOwnedGuild } from "@vertix.gg/api/src/server/middleware/guild-access";

import type { DiscordGuild } from "@vertix.gg/api/src/server/services/auth-service";
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

export interface SelectedGuild {
    id: string;
    name: string;
    icon: string | null;
}

declare module "fastify" {
    interface Session {
        userId?: string;
        oauthState?: string;
        selectedGuild?: SelectedGuild;

        /**
         * The guilds discord last said this user owns, and when it said so.
         *
         * Kept because discord rate limits `/users/@me/guilds`, and listing then selecting - which
         * is the dashboard's normal flow - is two calls inside a second.
         */
        ownedGuilds?: { guilds: IOwnedGuild[]; fetchedAt: number };
    }
}

const FRONTEND_URL = process.env.DASHBOARD_URL || "http://localhost:3020";

async function handleDiscordAuth( request: FastifyRequest, reply: FastifyReply ) {
    try {
        const state = generateState();
        request.session.oauthState = state;

        await request.session.save();

        const authUrl = discordConfig.getAuthorizationUrl( state );
        return reply.redirect( authUrl );
    } catch( error ) {
        handleError( handleDiscordAuth, error, reply, "Failed to initiate Discord auth" );
    }
}

async function handleDiscordCallback(
    request: FastifyRequest<{ Querystring: { code?: string; state?: string; error?: string } }>,
    reply: FastifyReply
) {
    try {
        const { code, state, error } = request.query;

        if ( error ) {
            return reply.redirect( `${ FRONTEND_URL }/login?error=${ encodeURIComponent( error ) }` );
        }

        if ( !code ) {
            return reply.redirect( `${ FRONTEND_URL }/login?error=no_code` );
        }

        if ( state !== request.session.oauthState ) {
            return reply.redirect( `${ FRONTEND_URL }/login?error=invalid_state` );
        }

        const tokenData = await exchangeCodeForToken( code );
        const discordUser = await getDiscordUser( tokenData.access_token );

        // Store user in database
        const user = await upsertUser( discordUser );

        // Store token in database
        await upsertToken( user.id, tokenData );

        // Session only stores userId reference
        request.session.userId = user.id;
        delete request.session.oauthState;

        // Explicitly save session before redirect
        await request.session.save();

        return reply.redirect( FRONTEND_URL );
    } catch( error ) {
        request.log.error( error, "Discord callback error" );
        return reply.redirect( `${ FRONTEND_URL }/login?error=auth_failed` );
    }
}

async function handleGetMe( request: FastifyRequest, reply: FastifyReply ) {
    if ( !request.session.userId ) {
        return reply.status( 401 ).send( { error: "Not authenticated" } );
    }

    const user = await getUserById( request.session.userId );

    if ( !user ) {
        return reply.status( 401 ).send( { error: "User not found" } );
    }

    return {
        user,
        selectedGuild: request.session.selectedGuild || null,
        isOwner: request.session.userId === process.env.OWNERD_ID
    };
}

async function handleGetGuilds( request: FastifyRequest, reply: FastifyReply ) {
    if ( !request.session.userId ) {
        return reply.status( 401 ).send( { error: "Not authenticated" } );
    }

    try {
        // Get fresh access token (auto-refreshes if expired)
        const accessToken = await refreshAccessToken( request.session.userId );

        if ( !accessToken ) {
            return reply.status( 401 ).send( { error: "Token expired, please re-login" } );
        }

        const guilds = await getDiscordGuilds( accessToken );

        // The same answer the next request needs. Kept now so selecting a guild immediately
        // afterwards does not ask discord a second time and meet its rate limit.
        cacheOwnedGuilds( request, guilds );

        const owned = guilds.filter( ( guild: DiscordGuild ) => guild.owner );

        // Said here rather than left for the picker to ask server by server: the answer is one
        // query, and without it every row draws the same whether the bot is in it or not - which is
        // how somebody picks a server with nothing in it and meets a locked dashboard instead.
        const guildIdsWithBot = await selectGuildIdsWithBot( owned.map( ( guild: DiscordGuild ) => guild.id ) );

        const ownedGuilds = owned.map( ( guild: DiscordGuild ) => ( {
            id: guild.id,
            name: guild.name,
            icon: guild.icon
                ? `https://cdn.discordapp.com/icons/${ guild.id }/${ guild.icon }.png`
                : null,
            owner: guild.owner,
            permissions: guild.permissions,
            hasBot: guildIdsWithBot.has( guild.id )
        } ) );

        return { guilds: ownedGuilds };
    } catch( error ) {
        handleError( handleGetGuilds, error, reply, "Failed to fetch guilds" );
    }
}

/**
 * Function handleSelectGuild() :: Put a guild in the session, once discord agrees it is theirs.
 *
 * **This is the check the guild routes rest on.** They compare the id in their url against
 * `session.selectedGuild` and refuse a mismatch, which is only worth anything if the selected guild
 * was somebody's to select - and it used to be written straight out of the request body, so
 * choosing another server's id was all it took to be let into it.
 *
 * The name and icon are taken from discord's answer rather than from the body for the same reason:
 * they are drawn in the dashboard's sidebar, and a caller who can name a guild whatever it likes
 * can put whatever it likes on that screen.
 */
async function handleSelectGuild(
    request: FastifyRequest<{ Body: { guildId: string } }>,
    reply: FastifyReply
) {
    if ( !request.session.userId ) {
        return reply.status( 401 ).send( { error: "Not authenticated" } );
    }

    const { guildId } = request.body;

    if ( !guildId ) {
        return reply.status( 400 ).send( { error: "guildId is required" } );
    }

    const ownership = await resolveGuildOwnership( request, guildId );

    if ( "no-token" === ownership.outcome ) {
        return reply.status( 401 ).send( { error: "Token expired, please re-login" } );
    }

    if ( "not-owned" === ownership.outcome ) {
        // 403 rather than 404 here, unlike the routes that read a guild from their url: the caller
        // named this guild itself, so it already knows the id exists to be refused.
        return reply.status( 403 ).send( { error: "Access denied" } );
    }

    request.session.selectedGuild = {
        id: ownership.guild.id,
        name: ownership.guild.name,
        icon: ownership.guild.icon
            ? `https://cdn.discordapp.com/icons/${ ownership.guild.id }/${ ownership.guild.icon }.png`
            : null
    };

    await request.session.save();

    return { selectedGuild: request.session.selectedGuild };
}

async function handleLogout( request: FastifyRequest, reply: FastifyReply ) {
    try {
        // Delete token from database
        if ( request.session.userId ) {
            await deleteUserToken( request.session.userId );
        }

        await request.session.destroy();
        return { success: true };
    } catch( error ) {
        handleError( handleLogout, error, reply, "Failed to logout" );
    }
}

const authRoutePlugin: FastifyPluginAsync = async( fastify: FastifyInstance ): Promise<void> => {
    fastify.get( "/auth/discord", handleDiscordAuth );

    fastify.get<{ Querystring: { code?: string; state?: string; error?: string } }>(
        "/auth/discord/callback",
        handleDiscordCallback
    );

    fastify.get( "/auth/me", handleGetMe );

    fastify.get( "/auth/guilds", handleGetGuilds );

    fastify.post<{ Body: { guildId: string; guildName: string; guildIcon: string | null } }>(
        "/auth/select-guild",
        handleSelectGuild
    );

    fastify.post( "/auth/logout", handleLogout );
};

export default authRoutePlugin;
