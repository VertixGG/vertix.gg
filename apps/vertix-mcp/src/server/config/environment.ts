const DEFAULT_MCP_SERVER_NAME = "vertix-mcp";
const DEFAULT_MCP_SERVER_VERSION = "1.0.0";

class Environment {
    public getServerName(): string {
        return process.env.MCP_SERVER_NAME || DEFAULT_MCP_SERVER_NAME;
    }

    public getServerVersion(): string {
        return process.env.MCP_SERVER_VERSION || DEFAULT_MCP_SERVER_VERSION;
    }

    public getDiscordToken(): string {
        const token = process.env.AI_CHAT_DISCORD_TOKEN;

        if ( ! token ) {
            throw new Error( "AI_CHAT_DISCORD_TOKEN environment variable is required" );
        }

        return token;
    }

    public hasDiscordToken(): boolean {
        return !! process.env.AI_CHAT_DISCORD_TOKEN;
    }
}

export const environment = new Environment();
