/**
 * Wire types for Ollama's native `/api/chat` endpoint.
 *
 * The native endpoint is used rather than the OpenAI-compatible `/v1` one
 * because only it accepts `keep_alive` and `options.num_ctx`, both of which
 * this app has to control explicitly.
 */

/** A concrete JSON value - stands in for `any`/`unknown` in tool payloads. */
export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [ key: string ]: JsonValue };

export type JsonObject = { [ key: string ]: JsonValue };

export type OllamaRole = "system" | "user" | "assistant" | "tool";

export type OllamaToolCallFunction = {
    name: string;
    arguments: JsonObject;
    /** Present on responses; position of the call within the turn. */
    index?: number;
};

export type OllamaToolCall = {
    /** Ollama assigns this on responses - carry it back so results match calls. */
    id?: string;
    function: OllamaToolCallFunction;
};

export type OllamaMessage = {
    role: OllamaRole;
    content: string;
    /** Base64-encoded images, for the vision path. */
    images?: string[];
    tool_calls?: OllamaToolCall[];
    /** Set on `role: "tool"` replies so the model can match the result to its call. */
    tool_name?: string;
};

export type OllamaToolDefinition = {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: JsonObject;
    };
};

export type OllamaChatRequest = {
    model: string;
    messages: OllamaMessage[];
    tools?: OllamaToolDefinition[];
    stream: false;
    think?: boolean;
    keep_alive: string;
    /** A JSON Schema here constrains the reply to match it - used for decisions. */
    format?: JsonObject;
    options: {
        num_ctx: number;
        /** Caps the reply; a yes/no decision must not be allowed to ramble. */
        num_predict?: number;
    };
};

export type OllamaChatResponse = {
    model: string;
    created_at: string;
    message: OllamaMessage;
    done: boolean;
    done_reason?: string;
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    eval_count?: number;
    eval_duration?: number;
};

export type OllamaErrorResponse = {
    error: string;
};
