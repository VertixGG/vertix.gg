export const discordConfig = {
    getClientId(): string {
        const clientId = process.env.DASHBOARD_DISCORD_CLIENT_ID;
        if ( !clientId ) {
            throw new Error( "DASHBOARD_DISCORD_CLIENT_ID is not set" );
        }
        return clientId;
    },

    getClientSecret(): string {
        const clientSecret = process.env.DASHBOARD_DISCORD_CLIENT_SECRET;
        if ( !clientSecret ) {
            throw new Error( "DASHBOARD_DISCORD_CLIENT_SECRET is not set" );
        }
        return clientSecret;
    },

    getRedirectUri(): string {
        return process.env.DASHBOARD_DISCORD_REDIRECT_URI || "http://localhost:3021/api/auth/discord/callback";
    },

    getSessionSecret(): string {
        return process.env.DASHBOARD_SESSION_SECRET || "vertix-dashboard-session-secret-change-in-production";
    },

    getScopes(): string[] {
        return [ "identify", "email", "guilds" ];
    },

    getAuthorizationUrl( state: string ): string {
        const params = new URLSearchParams( {
            client_id: this.getClientId(),
            redirect_uri: this.getRedirectUri(),
            response_type: "code",
            scope: this.getScopes().join( " " ),
            state
        } );

        return `https://discord.com/api/oauth2/authorize?${ params.toString() }`;
    }
};
