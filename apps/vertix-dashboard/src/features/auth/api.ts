import { API_CONFIG } from "@vertix.gg/dashboard/src/lib/config";

import type { AuthUser, Guild, SelectedGuild } from "@vertix.gg/dashboard/src/features/auth/types";

const AUTH_BASE_URL = `${ API_CONFIG.BASE_URL }/auth`;

interface AuthMeResponse {
    user: AuthUser;
    selectedGuild: SelectedGuild | null;
    isOwner: boolean;
}

export async function fetchCurrentUser(): Promise<AuthMeResponse | null> {
    try {
        const response = await fetch( `${ AUTH_BASE_URL }/me`, {
            credentials: "include"
        } );

        if ( !response.ok ) {
            if ( response.status === 401 ) {
                return null;
            }
            throw new Error( "Failed to fetch user" );
        }

        return response.json();
    } catch {
        return null;
    }
}

export async function fetchGuilds(): Promise<Guild[]> {
    const response = await fetch( `${ AUTH_BASE_URL }/guilds`, {
        credentials: "include"
    } );

    if ( !response.ok ) {
        throw new Error( "Failed to fetch guilds" );
    }

    const data = await response.json();
    return data.guilds;
}

export async function selectGuild( guild: Guild ): Promise<SelectedGuild> {
    const response = await fetch( `${ AUTH_BASE_URL }/select-guild`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify( {
            guildId: guild.id,
            guildName: guild.name,
            guildIcon: guild.icon
        } )
    } );

    if ( !response.ok ) {
        throw new Error( "Failed to select guild" );
    }

    const data = await response.json();
    return data.selectedGuild;
}

export async function logout(): Promise<void> {
    await fetch( `${ AUTH_BASE_URL }/logout`, {
        method: "POST",
        credentials: "include"
    } );
}

export function getDiscordLoginUrl(): string {
    return `${ AUTH_BASE_URL }/discord`;
}
