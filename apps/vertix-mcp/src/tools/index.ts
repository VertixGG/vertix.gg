import { discordTools, executeDiscordTool } from "@vertix.gg/mcp/src/tools/discord";
import { discordReadOnlyToolDefinitions, isReadOnlyTool } from "@vertix.gg/mcp/src/tools/discord/definitions-readonly";

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const isReadOnlyMode = process.env.VERTIX_MCP_READONLY === "true";

export function getAllTools(): Tool[] {
    if ( isReadOnlyMode ) {
        return discordReadOnlyToolDefinitions;
    }

    return discordTools;
}

export async function executeTool( name: string, args: Record<string, unknown> | undefined ): Promise<unknown> {
    if ( isReadOnlyMode && ! isReadOnlyTool( name ) ) {
        throw new Error( `Tool "${ name }" is not available in read-only mode` );
    }

    if ( name.startsWith( "discord_" ) ) {
        return executeDiscordTool( name, args );
    }

    throw new Error( `Unknown tool: ${ name }` );
}
