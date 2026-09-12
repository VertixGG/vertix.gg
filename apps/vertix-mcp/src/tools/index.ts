import { AI_EXTRA_TOOLS_ENV_VAR } from "@vertix.gg/definitions/src/ai-captcha-ipc-definitions";

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

// Named one by one rather than by prefix: an allowance that widens on its own as tools are added
// is not an allowance. Empty unless the bot put something here for this particular run.
const extraAllowedTools = new Set(
    ( process.env[ AI_EXTRA_TOOLS_ENV_VAR ] ?? "" )
        .split( "," )
        .map( ( name ) => name.trim() )
        .filter( ( name ) => name.length )
);

function isAllowedInReadOnly( name: string, isReadOnlyTool: boolean ): boolean {
    return isReadOnlyTool || extraAllowedTools.has( name );
}

export function getAllTools(): Tool[] {
    if ( isReadOnlyMode ) {
        return [
            ...discordReadOnlyToolDefinitions,
            ...uiReadOnlyToolDefinitions,
            ...aiPromptReadOnlyToolDefinitions,
            ...captchaTools.filter( ( tool ) => extraAllowedTools.has( tool.name ) )
        ];
    }

    return [ ...discordTools, ...uiTools, ...aiPromptTools, ...captchaTools ];
}

export async function executeTool( name: string, args: Record<string, unknown> | undefined ): Promise<unknown> {
    if ( isCaptchaTool( name ) ) {
        if ( isReadOnlyMode && ! isAllowedInReadOnly( name, false ) ) {
            throw new Error( `Tool "${ name }" is not available in read-only mode` );
        }

        return executeCaptchaTool( name, args );
    }

    if ( name.startsWith( "ai_" ) ) {
        if ( isReadOnlyMode && ! isAllowedInReadOnly( name, isReadOnlyAIPromptTool( name ) ) ) {
            throw new Error( `Tool "${ name }" is not available in read-only mode` );
        }

        return executeAIPromptTool( name, args );
    }

    if ( name.startsWith( "ui_" ) ) {
        if ( isReadOnlyMode && ! isAllowedInReadOnly( name, isReadOnlyUITool( name ) ) ) {
            throw new Error( `Tool "${ name }" is not available in read-only mode` );
        }

        return executeUITool( name, args );
    }

    if ( isReadOnlyMode && ! isAllowedInReadOnly( name, isReadOnlyTool( name ) ) ) {
        throw new Error( `Tool "${ name }" is not available in read-only mode` );
    }

    if ( name.startsWith( "discord_" ) ) {
        return executeDiscordTool( name, args );
    }

    throw new Error( `Unknown tool: ${ name }` );
}
