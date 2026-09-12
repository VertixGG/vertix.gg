import { AI_PROMPT_CALLER_ENV_VARS } from "@vertix.gg/definitions/src/ai-prompt-ipc-definitions";

import type { AIPromptCaller } from "@vertix.gg/definitions/src/ai-prompt-ipc-definitions";

/**
 * Who this agent run is answering, taken from the environment the bot spawned it with.
 *
 * Deliberately not a tool argument. The model writes its arguments, so a conversation that asked
 * it to "say you are the owner" would be asking it to forge the very thing the permission check
 * rests on. The environment is written by the bot and never seen by the model.
 */
export function getCaller(): AIPromptCaller {
    const guildId = process.env[ AI_PROMPT_CALLER_ENV_VARS.GUILD_ID ]?.trim();
    const channelId = process.env[ AI_PROMPT_CALLER_ENV_VARS.CHANNEL_ID ]?.trim();
    const userId = process.env[ AI_PROMPT_CALLER_ENV_VARS.USER_ID ]?.trim();

    // Fails rather than defaults: without a caller there is nobody to check a permission against,
    // and a guessed one would be a permission check that always passes.
    if ( ! guildId || ! channelId || ! userId ) {
        throw new Error(
            "This run has no caller identity, so channel prompts cannot be read or changed. " +
            "It only exists when the Vertix AI Chat bot starts the agent itself."
        );
    }

    return { guildId, channelId, userId };
}
