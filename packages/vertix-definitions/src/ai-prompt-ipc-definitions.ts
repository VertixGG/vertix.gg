export const AI_PROMPT_IPC_CHANNELS = {
    AI_PROMPT_REQUEST: "vertix:ai-prompt:request",
    AI_PROMPT_RESPONSE: "vertix:ai-prompt:response"
} as const;

export const AI_PROMPT_IPC_ACTIONS = {
    GET_CHANNEL_PROMPT: "ai_get_channel_prompt",
    SET_CHANNEL_PROMPT: "ai_set_channel_prompt",
    RESET_CHANNEL_PROMPT: "ai_reset_channel_prompt"
} as const;

/**
 * Ceiling on a stored prompt.
 *
 * It is prepended to every turn in the channel, so an unbounded one would quietly eat the
 * agent's context window instead of failing where someone can see it.
 */
export const AI_CHANNEL_PROMPT_MAX_LENGTH = 4000;

/**
 * How the bot hands the agent's MCP server the caller for this turn.
 *
 * Named here so the writer and the reader cannot disagree about the spelling - the bot writes
 * these into the MCP server's environment, and the MCP server reads them back out of its own.
 */
export const AI_PROMPT_CALLER_ENV_VARS = {
    GUILD_ID: "VERTIX_AI_CALLER_GUILD_ID",
    CHANNEL_ID: "VERTIX_AI_CALLER_CHANNEL_ID",
    USER_ID: "VERTIX_AI_CALLER_USER_ID"
} as const;

/**
 * Who is asking, as the bot reported it when it spawned the agent for this turn.
 *
 * Never supplied by the model: it reaches the MCP server through its own environment, so a
 * conversation cannot talk its way into claiming to be somebody else.
 */
export interface AIPromptCaller {
    guildId: string;
    channelId: string;
    userId: string;
}

export interface AIPromptScopedRequest {
    caller: AIPromptCaller;
    /** The channel being read or changed. Defaults to the one the caller is speaking in. */
    channelId?: string;
}

export interface AIGetChannelPromptRequest extends AIPromptScopedRequest {
    action: typeof AI_PROMPT_IPC_ACTIONS.GET_CHANNEL_PROMPT;
}

export interface AISetChannelPromptRequest extends AIPromptScopedRequest {
    action: typeof AI_PROMPT_IPC_ACTIONS.SET_CHANNEL_PROMPT;
    /** Replaces whatever the channel had - the caller composes the merge, not the store. */
    prompt: string;
}

export interface AIResetChannelPromptRequest extends AIPromptScopedRequest {
    action: typeof AI_PROMPT_IPC_ACTIONS.RESET_CHANNEL_PROMPT;
}

export type AIPromptIPCRequestPayload =
    | AIGetChannelPromptRequest
    | AISetChannelPromptRequest
    | AIResetChannelPromptRequest;

export interface AIPromptTarget {
    channelId: string;
    channelName: string;
}

export interface AIGetChannelPromptResponse extends AIPromptTarget {
    prompt: string | null;
}

export interface AISetChannelPromptResponse extends AIPromptTarget {
    previous: string | null;
    current: string;
}

export interface AIResetChannelPromptResponse extends AIPromptTarget {
    previous: string | null;
    cleared: boolean;
}

export type AIPromptIPCResponsePayload =
    | AIGetChannelPromptResponse
    | AISetChannelPromptResponse
    | AIResetChannelPromptResponse;
