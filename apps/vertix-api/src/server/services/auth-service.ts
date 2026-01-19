import { discordConfig } from "@vertix.gg/api/src/server/config/discord";

const DISCORD_API_BASE = "https://discord.com/api/v10";

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
