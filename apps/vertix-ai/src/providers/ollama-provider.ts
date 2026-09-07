import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import type {
    JsonObject,
    OllamaChatRequest,
    OllamaChatResponse,
    OllamaMessage,
    OllamaToolDefinition
} from "@vertix.gg/ai/src/definitions/ollama-definitions";

export type OllamaChatOptions = {
    messages: OllamaMessage[];
    tools?: OllamaToolDefinition[];
    /** JSON Schema constraining the reply. */
    format?: JsonObject;
    /** Hard cap on generated tokens. */
    numPredict?: number;
    /**
     * Reasoning is off by default: it costs tokens the tool loop needs and the
     * output is not shown to Discord users anyway.
     */
    think?: boolean;
};

/**
 * The only place in this app that knows Ollama exists. Everything above it
 * speaks in messages and tool calls, so swapping the backend is a one-file job.
 */
export class OllamaProvider extends InitializeBase {
    private static instance: OllamaProvider;

    public static getName() {
        return "VertixAI/Providers/OllamaProvider";
    }

    public static getInstance(): OllamaProvider {
        if ( !OllamaProvider.instance ) {
            OllamaProvider.instance = new OllamaProvider();
        }

        return OllamaProvider.instance;
    }

    public static get $() {
        return OllamaProvider.getInstance();
    }

    public async chat( options: OllamaChatOptions ): Promise<OllamaChatResponse> {
        const config = AIConfig.$;

        const request: OllamaChatRequest = {
            model: config.getOllamaModel(),
            messages: options.messages,
            stream: false,
            think: options.think ?? false,
            keep_alive: config.getOllamaKeepAlive(),
            // Sent on every request: Ollama's own default is 4096, which would
            // silently truncate the tool schemas instead of raising an error.
            options: {
                num_ctx: config.getOllamaNumCtx(),
                ...( options.numPredict ? { num_predict: options.numPredict } : {} )
            }
        };

        if ( options.tools?.length ) {
            request.tools = options.tools;
        }

        if ( options.format ) {
            request.format = options.format;
        }

        const response = await this.post( "/api/chat", request );

        this.logCompletion( response );

        return response;
    }

    /**
     * Confirms the daemon is reachable and the configured model is present, so
     * a bad model name surfaces at startup instead of on a user's first message.
     */
    public async isModelAvailable(): Promise<boolean> {
        const model = AIConfig.$.getOllamaModel();

        try {
            const response = await fetch( `${ AIConfig.$.getOllamaBaseUrl() }/api/tags`, {
                signal: AbortSignal.timeout( AIConfig.$.getOllamaRequestTimeoutMs() )
            } );

            if ( !response.ok ) {
                return false;
            }

            const body = await response.json() as { models?: { name: string }[] };

            return Boolean( body.models?.some( ( entry ) => entry.name === model ) );
        } catch( error ) {
            this.logger.error( this.isModelAvailable, `Cannot reach Ollama - ${ String( error ) }` );

            return false;
        }
    }

    private async post( endpoint: string, request: OllamaChatRequest ): Promise<OllamaChatResponse> {
        const url = `${ AIConfig.$.getOllamaBaseUrl() }${ endpoint }`;

        const response = await fetch( url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( request ),
            signal: AbortSignal.timeout( AIConfig.$.getOllamaRequestTimeoutMs() )
        } );

        if ( !response.ok ) {
            const details = await response.text();

            throw new Error( `Ollama request to '${ endpoint }' failed with '${ response.status }': ${ details }` );
        }

        return await response.json() as OllamaChatResponse;
    }

    private logCompletion( response: OllamaChatResponse ): void {
        const evalCount = response.eval_count ?? 0;
        const evalDuration = response.eval_duration ?? 0;
        const tokensPerSecond = evalDuration > 0
            ? ( evalCount / ( evalDuration / 1e9 ) ).toFixed( 1 )
            : "0.0";

        this.logger.debug(
            this.logCompletion,
            `model: '${ response.model }', prompt: '${ response.prompt_eval_count ?? 0 }', ` +
            `eval: '${ evalCount }' at '${ tokensPerSecond }' tok/s, ` +
            `tool_calls: '${ response.message.tool_calls?.length ?? 0 }'`
        );
    }
}

export default OllamaProvider;
