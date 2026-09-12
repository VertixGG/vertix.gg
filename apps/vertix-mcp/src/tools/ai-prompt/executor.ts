import { z } from "zod";

import { AI_PROMPT_IPC_ACTIONS } from "@vertix.gg/definitions/src/ai-prompt-ipc-definitions";

import { getCaller } from "@vertix.gg/mcp/src/tools/ai-prompt/caller";
import { requestAIPrompt } from "@vertix.gg/mcp/src/tools/ai-prompt/ipc-client";

import type {
    AIGetChannelPromptResponse,
    AIResetChannelPromptResponse,
    AISetChannelPromptResponse
} from "@vertix.gg/definitions/src/ai-prompt-ipc-definitions";

const ChannelPromptSchema = z.object( {
    channelId: z.string().optional()
} );

const SetChannelPromptSchema = z.object( {
    prompt: z.string(),
    channelId: z.string().optional()
} );

export async function executeAIPromptTool( name: string, args: Record<string, unknown> | undefined ): Promise<unknown> {
    const caller = getCaller();

    switch ( name ) {
        case AI_PROMPT_IPC_ACTIONS.GET_CHANNEL_PROMPT: {
            const { channelId } = ChannelPromptSchema.parse( args ?? {} );

            const response = await requestAIPrompt<AIGetChannelPromptResponse>( {
                action: AI_PROMPT_IPC_ACTIONS.GET_CHANNEL_PROMPT,
                caller,
                channelId
            } );

            return {
                ...response,
                // Said plainly, because "prompt: null" reads to a model like a failure rather than
                // like a channel that simply has nothing set.
                state: null === response.prompt
                    ? "This channel has no prompt of its own; the bot uses its base system prompt here."
                    : "This channel's prompt is appended to the base system prompt."
            };
        }

        case AI_PROMPT_IPC_ACTIONS.SET_CHANNEL_PROMPT: {
            const { prompt, channelId } = SetChannelPromptSchema.parse( args ?? {} );

            const response = await requestAIPrompt<AISetChannelPromptResponse>( {
                action: AI_PROMPT_IPC_ACTIONS.SET_CHANNEL_PROMPT,
                caller,
                channelId,
                prompt
            } );

            return {
                ...response,
                state: `Saved. From the next message in #${ response.channelName } onwards, this is appended ` +
                    "to the base system prompt."
            };
        }

        case AI_PROMPT_IPC_ACTIONS.RESET_CHANNEL_PROMPT: {
            const { channelId } = ChannelPromptSchema.parse( args ?? {} );

            const response = await requestAIPrompt<AIResetChannelPromptResponse>( {
                action: AI_PROMPT_IPC_ACTIONS.RESET_CHANNEL_PROMPT,
                caller,
                channelId
            } );

            return {
                ...response,
                state: response.cleared
                    ? `Removed. #${ response.channelName } is back to the base system prompt.`
                    : `#${ response.channelName } had no prompt of its own; nothing was changed.`
            };
        }

        default:
            throw new Error( `Unknown AI prompt tool: ${ name }` );
    }
}
