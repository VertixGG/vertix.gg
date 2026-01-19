const DEFAULT_MCP_SERVER_NAME = "vertix-mcp";
const DEFAULT_MCP_SERVER_VERSION = "1.0.0";

class Environment {
    public getServerName(): string {
        return process.env.MCP_SERVER_NAME || DEFAULT_MCP_SERVER_NAME;
    }

    public getServerVersion(): string {
        return process.env.MCP_SERVER_VERSION || DEFAULT_MCP_SERVER_VERSION;
    }

    public isReadOnlyMode(): boolean {
        return process.env.VERTIX_MCP_READONLY === "true";
    }

    public getDiscordToken(): string {
        const isReadOnly = this.isReadOnlyMode();

        const token = isReadOnly
            ? process.env.DISCORD_TEST_TOKEN
            : process.env.AI_CHAT_DISCORD_TOKEN;

        if ( ! token ) {
            const envVar = isReadOnly ? "DISCORD_TEST_TOKEN" : "AI_CHAT_DISCORD_TOKEN";
            throw new Error( `${ envVar } environment variable is required for ${ isReadOnly ? "read-only" : "full" } mode` );
        }

        return token;
    }

    public hasDiscordToken(): boolean {
        const isReadOnly = this.isReadOnlyMode();

        return isReadOnly
            ? !! process.env.DISCORD_TEST_TOKEN
            : !! process.env.AI_CHAT_DISCORD_TOKEN;
    }
}

export const environment = new Environment();
