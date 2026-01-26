import { discordConfig } from "@vertix.gg/api/src/server/config/discord";
import { PrismaAPIClient } from "@vertix.gg/prisma/api-client";

const DISCORD_API_BASE = "https://discord.com/api/v10";

function getClient() {
    return PrismaAPIClient.$.getClient();
}

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email?: string;
    global_name?: string;
}

export interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export interface AuthUser {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    email?: string;
}

export async function exchangeCodeForToken( code: string ): Promise<TokenResponse> {
    const response = await fetch( `${ DISCORD_API_BASE }/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams( {
            client_id: discordConfig.getClientId(),
            client_secret: discordConfig.getClientSecret(),
            grant_type: "authorization_code",
            code,
            redirect_uri: discordConfig.getRedirectUri()
        } )
    } );

    if ( !response.ok ) {
        const error = await response.text();
        throw new Error( `Failed to exchange code for token: ${ error }` );
    }

    return response.json();
}

export async function getDiscordUser( accessToken: string ): Promise<DiscordUser> {
    const response = await fetch( `${ DISCORD_API_BASE }/users/@me`, {
        headers: {
            Authorization: `Bearer ${ accessToken }`
        }
    } );

    if ( !response.ok ) {
        throw new Error( "Failed to fetch Discord user" );
    }

    return response.json();
}

export async function getDiscordGuilds( accessToken: string ): Promise<DiscordGuild[]> {
    const response = await fetch( `${ DISCORD_API_BASE }/users/@me/guilds`, {
        headers: {
            Authorization: `Bearer ${ accessToken }`
        }
    } );

    if ( !response.ok ) {
        throw new Error( "Failed to fetch Discord guilds" );
    }

    return response.json();
}

export function formatDiscordUser( discordUser: DiscordUser ): AuthUser {
    return {
        id: discordUser.id,
        username: discordUser.username,
        displayName: discordUser.global_name || discordUser.username,
        avatar: discordUser.avatar
            ? `https://cdn.discordapp.com/avatars/${ discordUser.id }/${ discordUser.avatar }.png`
            : null,
        email: discordUser.email
    };
}

export function generateState(): string {
    return Math.random().toString( 36 ).substring( 2, 15 ) + Math.random().toString( 36 ).substring( 2, 15 );
}

// Database operations

export async function upsertUser( discordUser: DiscordUser ): Promise<AuthUser> {
    const client = getClient();

    const user = await client.user.upsert( {
        where: { discordId: discordUser.id },
        update: {
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar || "",
            email: discordUser.email || ""
        },
        create: {
            discordId: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar || "",
            email: discordUser.email || ""
        }
    } );

    return {
        id: user.discordId,
        username: user.username,
        displayName: discordUser.global_name || user.username,
        avatar: user.avatar
            ? `https://cdn.discordapp.com/avatars/${ user.discordId }/${ user.avatar }.png`
            : null,
        email: user.email
    };
}

export async function upsertToken( userId: string, tokenData: TokenResponse ): Promise<void> {
    const client = getClient();

    const expiresAt = new Date( Date.now() + tokenData.expires_in * 1000 );

    await client.token.upsert( {
        where: { discordId: userId },
        update: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt,
            userId
        },
        create: {
            discordId: userId,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt,
            userId
        }
    } );
}

export async function getTokenByUserId( userId: string ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date } | null> {
    const client = getClient();

    const token = await client.token.findUnique( {
        where: { userId }
    } );

    return token;
}

export async function getUserById( userId: string ): Promise<AuthUser | null> {
    const client = getClient();

    const user = await client.user.findUnique( {
        where: { discordId: userId }
    } );

    if ( !user ) {
        return null;
    }

    return {
        id: user.discordId,
        username: user.username,
        displayName: user.username,
        avatar: user.avatar
            ? `https://cdn.discordapp.com/avatars/${ user.discordId }/${ user.avatar }.png`
            : null,
        email: user.email
    };
}

export async function refreshAccessToken( userId: string ): Promise<string | null> {
    const token = await getTokenByUserId( userId );

    if ( !token ) {
        return null;
    }

    // Check if token is still valid (with 5 min buffer)
    if ( token.expiresAt > new Date( Date.now() + 5 * 60 * 1000 ) ) {
        return token.accessToken;
    }

    // Refresh the token
    const response = await fetch( `${ DISCORD_API_BASE }/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams( {
            client_id: discordConfig.getClientId(),
            client_secret: discordConfig.getClientSecret(),
            grant_type: "refresh_token",
            refresh_token: token.refreshToken
        } )
    } );

    if ( !response.ok ) {
        return null;
    }

    const newTokenData = await response.json() as TokenResponse;

    await upsertToken( userId, newTokenData );

    return newTokenData.access_token;
}

export async function deleteUserToken( userId: string ): Promise<void> {
    const client = getClient();

    await client.token.deleteMany( {
        where: { userId }
    } );
}
