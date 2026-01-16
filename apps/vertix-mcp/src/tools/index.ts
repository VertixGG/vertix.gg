import { discordTools, executeDiscordTool } from "@vertix.gg/mcp/src/tools/discord";

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export function getAllTools(): Tool[] {
    return discordTools;
}

export async function executeTool( name: string, args: Record<string, unknown> | undefined ): Promise<unknown> {
    if ( name.startsWith( "discord_" ) ) {
        return executeDiscordTool( name, args );
    }

    throw new Error( `Unknown tool: ${ name }` );
}
