import { discordTools, executeDiscordTool } from "@vertix.gg/mcp/src/tools/discord";
import { discordReadOnlyToolDefinitions, isReadOnlyTool } from "@vertix.gg/mcp/src/tools/discord/definitions-readonly";

import { executeUITool, isReadOnlyUITool, uiReadOnlyToolDefinitions, uiTools } from "@vertix.gg/mcp/src/tools/ui";

import {
    aiPromptReadOnlyToolDefinitions,
    aiPromptTools,
    executeAIPromptTool,
    isReadOnlyAIPromptTool
} from "@vertix.gg/mcp/src/tools/ai-prompt";

import { captchaTools, executeCaptchaTool, isCaptchaTool } from "@vertix.gg/mcp/src/tools/captcha";

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const isReadOnlyMode = process.env.VERTIX_MCP_READONLY === "true";

export function getAllTools(): Tool[] {
    if ( isReadOnlyMode ) {
        return [ ...discordReadOnlyToolDefinitions, ...uiReadOnlyToolDefinitions, ...aiPromptReadOnlyToolDefinitions ];
    }

    return [ ...discordTools, ...uiTools, ...aiPromptTools, ...captchaTools ];
}

export async function executeTool( name: string, args: Record<string, unknown> | undefined ): Promise<unknown> {
    if ( isCaptchaTool( name ) ) {
        if ( isReadOnlyMode ) {
            throw new Error( `Tool "${ name }" is not available in read-only mode` );
        }

        return executeCaptchaTool( name, args );
    }

    if ( name.startsWith( "ai_" ) ) {
        if ( isReadOnlyMode && ! isReadOnlyAIPromptTool( name ) ) {
            throw new Error( `Tool "${ name }" is not available in read-only mode` );
        }

        return executeAIPromptTool( name, args );
    }

    if ( name.startsWith( "ui_" ) ) {
        if ( isReadOnlyMode && ! isReadOnlyUITool( name ) ) {
            throw new Error( `Tool "${ name }" is not available in read-only mode` );
        }

        return executeUITool( name, args );
    }

    if ( isReadOnlyMode && ! isReadOnlyTool( name ) ) {
        throw new Error( `Tool "${ name }" is not available in read-only mode` );
    }

    if ( name.startsWith( "discord_" ) ) {
        return executeDiscordTool( name, args );
    }

    throw new Error( `Unknown tool: ${ name }` );
}
