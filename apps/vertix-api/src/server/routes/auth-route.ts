import { discordConfig } from "@vertix.gg/api/src/server/config/discord";
import {
    exchangeCodeForToken,
    getDiscordUser,
    getDiscordGuilds,
    formatDiscordUser,
    generateState
} from "@vertix.gg/api/src/server/services/auth-service";
import { handleError } from "@vertix.gg/api/src/server/utils/error-handler";

import type { AuthUser, DiscordGuild } from "@vertix.gg/api/src/server/services/auth-service";
import type { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

export interface SelectedGuild {
    id: string;
    name: string;
    icon: string | null;
}

declare module "fastify" {
    interface Session {
        user?: AuthUser;
        accessToken?: string;
        refreshToken?: string;
        oauthState?: string;
        selectedGuild?: SelectedGuild;
    }
}

const FRONTEND_URL = process.env.DASHBOARD_URL || "http://localhost:3020";

async function handleDiscordAuth( request: FastifyRequest, reply: FastifyReply ) {
    try {
        const state = generateState();
        request.session.oauthState = state;

        const authUrl = discordConfig.getAuthorizationUrl( state );
        return reply.redirect( authUrl );
    } catch ( error ) {
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
        const user = formatDiscordUser( discordUser );

        request.session.user = user;
        request.session.accessToken = tokenData.access_token;
        request.session.refreshToken = tokenData.refresh_token;
        delete request.session.oauthState;

        return reply.redirect( FRONTEND_URL );
    } catch ( error ) {
        request.log.error( error, "Discord callback error" );
        return reply.redirect( `${ FRONTEND_URL }/login?error=auth_failed` );
    }
}

async function handleGetMe( request: FastifyRequest, reply: FastifyReply ) {
    if ( !request.session.user ) {
        return reply.status( 401 ).send( { error: "Not authenticated" } );
    }

    return {
        user: request.session.user,
        selectedGuild: request.session.selectedGuild || null
    };
}

async function handleGetGuilds( request: FastifyRequest, reply: FastifyReply ) {
    if ( !request.session.accessToken ) {
        return reply.status( 401 ).send( { error: "Not authenticated" } );
    }

    try {
        const guilds = await getDiscordGuilds( request.session.accessToken );

        const ownedGuilds = guilds
            .filter( ( guild: DiscordGuild ) => guild.owner )
            .map( ( guild: DiscordGuild ) => ( {
                id: guild.id,
                name: guild.name,
                icon: guild.icon
                    ? `https://cdn.discordapp.com/icons/${ guild.id }/${ guild.icon }.png`
                    : null,
                owner: guild.owner,
                permissions: guild.permissions
            } ) );

        return { guilds: ownedGuilds };
    } catch ( error ) {
        handleError( handleGetGuilds, error, reply, "Failed to fetch guilds" );
    }
}

async function handleSelectGuild(
    request: FastifyRequest<{ Body: { guildId: string; guildName: string; guildIcon: string | null } }>,
    reply: FastifyReply
) {
    if ( !request.session.user ) {
        return reply.status( 401 ).send( { error: "Not authenticated" } );
    }

    const { guildId, guildName, guildIcon } = request.body;

    request.session.selectedGuild = {
        id: guildId,
        name: guildName,
        icon: guildIcon
    };

    return { selectedGuild: request.session.selectedGuild };
}

async function handleLogout( request: FastifyRequest, reply: FastifyReply ) {
    try {
        await request.session.destroy();
        return { success: true };
    } catch ( error ) {
        handleError( handleLogout, error, reply, "Failed to logout" );
    }
}

const authRoutePlugin: FastifyPluginAsync = async ( fastify: FastifyInstance ): Promise<void> => {
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
