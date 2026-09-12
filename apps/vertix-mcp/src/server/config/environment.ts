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

    // This server acts as whatever bot the process that spawns it hands down in
    // DISCORD_MCP_TOKEN. It is deliberately unaware of any specific bot's token:
    // the parent process decides which identity this server runs as.
    public getDiscordToken(): string {
        const token = process.env.DISCORD_MCP_TOKEN;

        if ( ! token ) {
            throw new Error(
                "DISCORD_MCP_TOKEN is not set. The process that spawns this MCP server must pass, in "
                + "DISCORD_MCP_TOKEN, the Discord bot token this server should act as."
            );
        }

        return token;
    }

    public hasDiscordToken(): boolean {
        return Boolean( process.env.DISCORD_MCP_TOKEN );
    }
}

export const environment = new Environment();
