import { AI_CHANNEL_PROMPT_MAX_LENGTH } from "@vertix.gg/definitions/src/ai-prompt-ipc-definitions";

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const CHANNEL_ID_DESCRIPTION =
    "Discord channel id. Leave empty for the channel this conversation is happening in";

/**
 * Reading a channel's prompt is safe anywhere; changing one is not, so only the read tool
 * survives read-only mode - which is what keeps the public, read-only assistant out of this.
 */
export const aiPromptReadOnlyToolDefinitions: Tool[] = [
    {
        name: "ai_get_channel_prompt",
        description:
            "Read the extra instruction this bot follows in one channel, on top of its base " +
            "system prompt. Call this before ai_set_channel_prompt whenever the user wants to " +
            "add to, amend or remove part of what is already there - the set tool replaces the " +
            "whole text, so you need the current one to send back a merged version rather than " +
            "silently dropping it",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: CHANNEL_ID_DESCRIPTION }
            }
        }
    }
];

export const aiPromptToolDefinitions: Tool[] = [
    ...aiPromptReadOnlyToolDefinitions,
    {
        name: "ai_set_channel_prompt",
        description:
            "Set the extra instruction this bot follows in one channel - use it when someone " +
            "asks you to change how you behave there (\"in this channel always answer in " +
            "Hebrew\", \"stop adding summaries here\"). The text you send REPLACES the channel's " +
            "current prompt entirely, so read it first with ai_get_channel_prompt and send the " +
            "merged result unless the user asked to start over. It is appended to the base " +
            `system prompt, never replacing it. Maximum ${ AI_CHANNEL_PROMPT_MAX_LENGTH } ` +
            "characters. Requires Manage Server in that channel's server; the change applies " +
            "from the next message onwards",
        inputSchema: {
            type: "object",
            properties: {
                prompt: {
                    type: "string",
                    description: "The complete instruction for this channel, written as instructions to yourself"
                },
                channelId: { type: "string", description: CHANNEL_ID_DESCRIPTION }
            },
            required: [ "prompt" ]
        }
    },
    {
        name: "ai_reset_channel_prompt",
        description:
            "Remove a channel's extra instruction, returning the bot there to its base system " +
            "prompt alone. Requires Manage Server in that channel's server",
        inputSchema: {
            type: "object",
            properties: {
                channelId: { type: "string", description: CHANNEL_ID_DESCRIPTION }
            }
        }
    }
];

const readOnlyToolNames = new Set( aiPromptReadOnlyToolDefinitions.map( ( tool ) => tool.name ) );

export function isReadOnlyAIPromptTool( name: string ): boolean {
    return readOnlyToolNames.has( name );
}
