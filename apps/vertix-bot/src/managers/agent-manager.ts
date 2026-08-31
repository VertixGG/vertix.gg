import * as fsNative from "fs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

import { spawn } from "child_process";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const REPO_ROOT = path.resolve( __dirname, "../../../../" );

const MAX_DISCORD_RESPONSE_LENGTH = 1900;
const MAX_LOG_BUFFER_LENGTH = 8000;
const HELP_TIMEOUT_MS = 3000;
const AGENT_TIMEOUT_MS = 600000;
const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_CHAT_COMPLETIONS_PATH = "/chat/completions";

type AgentProvider = "codex" | "deepseek" | "claude";
type ReasoningEffort = "low" | "medium" | "high" | "xhigh";
type DeepSeekReasoningEffort = "low" | "high";
type DeepSeekThinkingType = "enabled" | "disabled";
type ClaudeEffort = "low" | "medium" | "high";

const DEFAULT_AGENT_PROVIDER: AgentProvider = "codex";
const DEFAULT_OPENAI_CODEX_MODEL = "gpt-5.6-luna";
const DEFAULT_OSS_CODEX_MODEL = "gpt-oss:20b";
const DEFAULT_OSS_PROVIDER = "ollama";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";
const DEFAULT_CLAUDE_MODEL = "sonnet";
// Claude Code prompts for permission on anything else, which would hang a non-interactive run.
const DEFAULT_CLAUDE_TOOLS = "Read,Grep,Glob";
const CLAUDE_MCP_SERVER_NAME = "vertix-mcp";
const DEFAULT_CLAUDE_MCP_ALLOWED_TOOLS = `mcp__${ CLAUDE_MCP_SERVER_NAME }`;
const VERTIX_MCP_ENTRYPOINT = "apps/vertix-mcp/src/index.ts";
const DEFAULT_REASONING_EFFORT: ReasoningEffort = "low";
const ENABLED_VALUES = [ "1", "true", "yes", "on" ];
const AGENT_PROVIDERS: readonly AgentProvider[] = [ "codex", "deepseek", "claude" ];
const REASONING_EFFORTS: readonly ReasoningEffort[] = [ "low", "medium", "high", "xhigh" ];
const AVAILABLE_AGENT_MODELS = [
    DEFAULT_OPENAI_CODEX_MODEL,
    "gpt-5.6-terra",
    "gpt-5.6-sol",
    "gpt-5.5",
    DEFAULT_OSS_CODEX_MODEL,
    "gpt-oss:120b",
    DEFAULT_DEEPSEEK_MODEL,
    "deepseek-v4-pro",
    "opus",
    DEFAULT_CLAUDE_MODEL,
    "haiku"
] as const;

const EMPTY_LOGS = Buffer.alloc( 0 );

// Dropped from the child env: the first three make Claude Code refuse to launch (nested-session
// guard), the rest would divert it to an API key / gateway instead of the CLI subscription login.
const CLAUDE_STRIPPED_ENV_VARS = [
    "CLAUDECODE",
    "CLAUDE_CODE_ENTRYPOINT",
    "CLAUDE_CODE_SSE_PORT",
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_AUTH_TOKEN",
    "ANTHROPIC_BASE_URL",
    "CLAUDE_CODE_USE_BEDROCK",
    "CLAUDE_CODE_USE_VERTEX"
];

export type AgentRunResult = {
    response: string;
    logs: Buffer;
    conversationId?: string;
};

export type AgentRunOptions = {
    includeLogs?: boolean;
    conversationId?: string;
    readOnly?: boolean;
    model?: string;
    reasoningEffort?: ReasoningEffort;
};

export type AgentChatOptions = Omit<AgentRunOptions, "includeLogs">;

type CliBinarySpec = {
    envName: string;
    baseName: string;
    label: string;
    verify: ( binaryPath: string ) => Promise<boolean>;
};

type ClaudeCliResult = {
    result?: string;
    session_id?: string;
    is_error?: boolean;
    subtype?: string;
};

type DeepSeekChatCompletionMessage = {
    content?: string | null;
    reasoning_content?: string | null;
};

type DeepSeekChatCompletionChoice = {
    message?: DeepSeekChatCompletionMessage;
};

type DeepSeekChatCompletionError = {
    message?: string;
    type?: string;
    code?: string;
};

type DeepSeekChatCompletionResponse = {
    choices?: DeepSeekChatCompletionChoice[];
    error?: DeepSeekChatCompletionError;
};

type DeepSeekChatCompletionRequest = {
    model: string;
    messages: {
        role: "user";
        content: string;
    }[];
    thinking: {
        type: DeepSeekThinkingType;
    };
    stream: false;
    reasoning_effort?: DeepSeekReasoningEffort;
};

/**
 * Runs the AI assistant behind the mention handlers: the local Codex or Claude Code CLI, or the
 * DeepSeek cloud API, picked with AI_CHAT_PROVIDER. Every provider answers with the same shape, so
 * the callers never need to know which one is configured.
 */
export class AgentManager extends InitializeBase {
    private static instance: AgentManager;

    // Resolving a CLI means spawning it to check its signature - done once per process.
    private codexBinaryPromise: Promise<string | null> | null = null;

    private claudeBinaryPromise: Promise<string | null> | null = null;

    private readonly codexBinarySpec: CliBinarySpec = {
        envName: "AI_CHAT_CODEX_BIN",
        baseName: "codex",
        label: "OpenAI Codex CLI",
        verify: ( binaryPath ) => this.isOpenAICodexCli( binaryPath )
    };

    private readonly claudeBinarySpec: CliBinarySpec = {
        envName: "AI_CHAT_CLAUDE_BIN",
        baseName: "claude",
        label: "Claude Code CLI",
        verify: ( binaryPath ) => this.isClaudeCodeCli( binaryPath )
    };

    public static getName() {
        return "VertixBot/Managers/Agent";
    }

    public static get $() {
        if ( ! AgentManager.instance ) {
            AgentManager.instance = new AgentManager();
        }

        return AgentManager.instance;
    }

    public getAvailableModels() {
        return [ ...AVAILABLE_AGENT_MODELS ];
    }

    public getModel( modelEnvName?: string ): string {
        if ( modelEnvName ) {
            const model = this.getConfiguredValue( [ modelEnvName ] );

            if ( model ) {
                return model;
            }
        }

        const provider = this.getProvider();

        if ( provider === "deepseek" ) {
            return this.getConfiguredValue( [ "AI_CHAT_DEEPSEEK_MODEL" ] ) ?? DEFAULT_DEEPSEEK_MODEL;
        }

        if ( provider === "claude" ) {
            return this.getConfiguredValue( [ "AI_CHAT_CLAUDE_MODEL" ] ) ?? DEFAULT_CLAUDE_MODEL;
        }

        if ( this.isCodexOssEnabled() ) {
            return this.getConfiguredValue( [ "AI_CHAT_CODEX_OSS_MODEL" ] ) ?? DEFAULT_OSS_CODEX_MODEL;
        }

        return this.getConfiguredValue( [ "AI_CHAT_MODEL", "OPENAI_CHAT_MODEL" ] ) ?? DEFAULT_OPENAI_CODEX_MODEL;
    }

    public getPublicModel(): string {
        return this.getModel( "AI_CHAT_PUBLIC_MODEL" );
    }

    public getPrivateModel(): string {
        return this.getModel( "AI_CHAT_PRIVATE_MODEL" );
    }

    public async runChat( prompt: string, options: AgentChatOptions = {} ): Promise<AgentRunResult> {
        return await this.runAgent( prompt, { includeLogs: false, ...options } );
    }

    public async runChatWithLogs( prompt: string, conversationId?: string ): Promise<AgentRunResult> {
        return await this.runAgent( prompt, { includeLogs: true, conversationId } );
    }

    public sanitizeResponse( text?: string | null ) {
        if ( ! text ) {
            return "I wasn't able to generate a reply.";
        }

        const trimmed = text.trim();

        if ( trimmed.length <= MAX_DISCORD_RESPONSE_LENGTH ) {
            return trimmed;
        }

        return `${ trimmed.slice( 0, MAX_DISCORD_RESPONSE_LENGTH ) }\n... (truncated)`;
    }

    private getConfiguredValue( names: readonly string[] ): string | null {
        for ( const name of names ) {
            const value = process.env[ name ]?.trim();

            if ( value ) {
                return value;
            }
        }

        return null;
    }

    private isEnabled( value: string | null ): boolean {
        return value ? ENABLED_VALUES.includes( value.toLowerCase() ) : false;
    }

    private isReasoningEffort( value: string ): value is ReasoningEffort {
        return REASONING_EFFORTS.some( ( effort ) => effort === value );
    }

    private isAgentProvider( value: string ): value is AgentProvider {
        return AGENT_PROVIDERS.some( ( provider ) => provider === value );
    }

    private getProvider(): AgentProvider {
        const configuredProvider = this.getConfiguredValue( [ "AI_CHAT_PROVIDER" ] );

        if ( ! configuredProvider ) {
            return DEFAULT_AGENT_PROVIDER;
        }

        const provider = configuredProvider.toLowerCase();

        if ( this.isAgentProvider( provider ) ) {
            return provider;
        }

        this.logger.error(
            this.getProvider,
            `Invalid AI_CHAT_PROVIDER '${ configuredProvider }', using '${ DEFAULT_AGENT_PROVIDER }'`
        );

        return DEFAULT_AGENT_PROVIDER;
    }

    private getReasoningEffort(): ReasoningEffort {
        const configuredReasoningEffort = this.getConfiguredValue( [ "AI_CHAT_REASONING_EFFORT" ] );

        if ( configuredReasoningEffort && this.isReasoningEffort( configuredReasoningEffort ) ) {
            return configuredReasoningEffort;
        }

        if ( configuredReasoningEffort ) {
            this.logger.error(
                this.getReasoningEffort,
                `Invalid AI_CHAT_REASONING_EFFORT '${ configuredReasoningEffort }', using '${ DEFAULT_REASONING_EFFORT }'`
            );
        }

        return DEFAULT_REASONING_EFFORT;
    }

    private async runAgent( prompt: string, options: AgentRunOptions = {} ): Promise<AgentRunResult> {
        switch ( this.getProvider() ) {
            case "deepseek":
                return await this.runDeepSeekCloud( prompt, options );

            case "claude":
                return await this.runClaude( prompt, options );

            default:
                return await this.runCodex( prompt, options );
        }
    }

    private appendToLimitedBuffer( current: string, chunk: string ) {
        if ( current.length >= MAX_LOG_BUFFER_LENGTH ) {
            return current;
        }

        const remaining = MAX_LOG_BUFFER_LENGTH - current.length;

        return current + chunk.slice( 0, remaining );
    }

    private async matchesCliSignature( binaryPath: string, args: string[], needles: readonly string[] ): Promise<boolean> {
        return await new Promise( ( resolve ) => {
            const child = spawn( binaryPath, args, {
                cwd: REPO_ROOT,
                env: {
                    ...process.env,
                    NODE_OPTIONS: "",
                    NODE_PATH: ""
                }
            } );

            const timeout = setTimeout( () => {
                child.kill();
                resolve( false );
            }, HELP_TIMEOUT_MS );

            let stdout = "";
            let stderr = "";

            child.stdout.on( "data", ( data ) => {
                stdout = this.appendToLimitedBuffer( stdout, data.toString() );
            } );

            child.stderr.on( "data", ( data ) => {
                stderr = this.appendToLimitedBuffer( stderr, data.toString() );
            } );

            child.on( "error", () => {
                clearTimeout( timeout );
                resolve( false );
            } );

            child.on( "close", ( code ) => {
                clearTimeout( timeout );

                if ( code !== 0 ) {
                    return resolve( false );
                }

                const combined = `${ stdout }\n${ stderr }`;

                resolve( needles.some( ( needle ) => combined.includes( needle ) ) );
            } );
        } );
    }

    private async isOpenAICodexCli( binaryPath: string ): Promise<boolean> {
        return await this.matchesCliSignature( binaryPath, [ "--help" ], [ "Codex CLI", "OpenAI Codex" ] );
    }

    private async isClaudeCodeCli( binaryPath: string ): Promise<boolean> {
        return await this.matchesCliSignature( binaryPath, [ "--version" ], [ "Claude Code" ] );
    }

    private async resolveCliBinary( spec: CliBinarySpec ): Promise<string | null> {
        const configured = process.env[ spec.envName ]?.trim();

        if ( configured ) {
            const isValid = await spec.verify( configured );

            if ( isValid ) {
                return configured;
            }

            this.logger.error(
                this.resolveCliBinary,
                `${ spec.envName } is set but does not look like ${ spec.label }: '${ configured }'`
            );

            return null;
        }

        const pathValue = process.env.PATH ?? "";
        const entries = pathValue
            .split( path.delimiter )
            .map( ( entry ) => entry.trim() )
            .filter( ( entry ) => entry.length > 0 );

        const repoNodeModulesPrefix = path.join( REPO_ROOT, "node_modules" ) + path.sep;

        const names = process.platform === "win32"
            ? [ `${ spec.baseName }.exe`, `${ spec.baseName }.cmd`, `${ spec.baseName }.bat`, spec.baseName ]
            : [ spec.baseName ];

        for ( const dir of entries ) {
            for ( const name of names ) {
                const candidate = path.join( dir, name );

                const realPath = await fs.realpath( candidate ).catch( () => null );

                if ( ! realPath ) {
                    continue;
                }

                if ( realPath.startsWith( repoNodeModulesPrefix ) ) {
                    continue;
                }

                const isValid = await spec.verify( candidate );

                if ( isValid ) {
                    return candidate;
                }
            }
        }

        return null;
    }

    private async getCodexBinary(): Promise<string | null> {
        if ( ! this.codexBinaryPromise ) {
            this.codexBinaryPromise = this.resolveCliBinary( this.codexBinarySpec );
        }

        return await this.codexBinaryPromise;
    }

    private async getClaudeBinary(): Promise<string | null> {
        if ( ! this.claudeBinaryPromise ) {
            this.claudeBinaryPromise = this.resolveCliBinary( this.claudeBinarySpec );
        }

        return await this.claudeBinaryPromise;
    }

    private isCodexOssEnabled(): boolean {
        return this.isEnabled( this.getConfiguredValue( [ "AI_CHAT_CODEX_OSS" ] ) );
    }

    private getCodexProviderArgs(): string[] {
        if ( ! this.isCodexOssEnabled() ) {
            return [];
        }

        const provider = this.getConfiguredValue( [ "AI_CHAT_CODEX_LOCAL_PROVIDER" ] ) ?? DEFAULT_OSS_PROVIDER;

        return [ "--oss", "--local-provider", provider ];
    }

    private getDeepSeekApiKey(): string | null {
        return this.getConfiguredValue( [ "AI_CHAT_DEEPSEEK_API_KEY", "DEEPSEEK_API_KEY" ] );
    }

    private getDeepSeekBaseUrl(): string {
        const configuredBaseUrl = this.getConfiguredValue( [ "AI_CHAT_DEEPSEEK_BASE_URL", "DEEPSEEK_BASE_URL" ] );
        const baseUrl = configuredBaseUrl ?? DEFAULT_DEEPSEEK_BASE_URL;

        return baseUrl.replace( /\/+$/, "" );
    }

    private isDeepSeekThinkingEnabled(): boolean {
        return this.isEnabled( this.getConfiguredValue( [ "AI_CHAT_DEEPSEEK_THINKING" ] ) );
    }

    private getDeepSeekReasoningEffort( effort: ReasoningEffort ): DeepSeekReasoningEffort {
        return effort === "low" ? "low" : "high";
    }

    private parseDeepSeekResponse( responseBody: string ): DeepSeekChatCompletionResponse | null {
        try {
            return JSON.parse( responseBody ) as DeepSeekChatCompletionResponse;
        } catch {
            return null;
        }
    }

    private resolveDeepSeekResponseContent( response: DeepSeekChatCompletionResponse ): string | null {
        const content = response.choices?.[ 0 ]?.message?.content?.trim();

        return content || null;
    }

    private getClaudeEffort( effort: ReasoningEffort ): ClaudeEffort {
        return effort === "xhigh" ? "high" : effort;
    }

    private getClaudeTools(): string {
        return this.getConfiguredValue( [ "AI_CHAT_CLAUDE_TOOLS" ] ) ?? DEFAULT_CLAUDE_TOOLS;
    }

    private isClaudeMcpEnabled(): boolean {
        const value = this.getConfiguredValue( [ "AI_CHAT_CLAUDE_MCP" ] );

        return value ? this.isEnabled( value ) : true;
    }

    // Discord credentials are intentionally left out: the server inherits them from this process,
    // so they never end up in the command line where `ps` would expose them.
    private buildClaudeMcpConfig( readOnly: boolean ): string {
        const configured = this.getConfiguredValue( [ "AI_CHAT_CLAUDE_MCP_CONFIG" ] );

        if ( configured ) {
            return configured;
        }

        return JSON.stringify( {
            mcpServers: {
                [ CLAUDE_MCP_SERVER_NAME ]: {
                    command: this.getConfiguredValue( [ "AI_CHAT_MCP_COMMAND" ] ) ?? "bun",
                    args: [ "run", "--bun", path.join( REPO_ROOT, VERTIX_MCP_ENTRYPOINT ) ],
                    env: {
                        LOGGER_DISABLED: "true",
                        VERTIX_MCP_READONLY: readOnly ? "true" : "false"
                    }
                }
            }
        } );
    }

    private getClaudeMcpArgs( readOnly: boolean ): string[] {
        if ( ! this.isClaudeMcpEnabled() ) {
            return [];
        }

        const allowedTools = this.getConfiguredValue( [ "AI_CHAT_CLAUDE_MCP_ALLOWED_TOOLS" ] ) ?? DEFAULT_CLAUDE_MCP_ALLOWED_TOOLS;

        return [
            // Strict, so the bot never inherits the developer's personal MCP servers.
            "--mcp-config", this.buildClaudeMcpConfig( readOnly ),
            "--strict-mcp-config",
            "--allowedTools", allowedTools
        ];
    }

    private parseClaudeResult( responseBody: string ): ClaudeCliResult | null {
        try {
            return JSON.parse( responseBody ) as ClaudeCliResult;
        } catch {
            return null;
        }
    }

    private async runDeepSeekCloud( prompt: string, options: AgentRunOptions = {} ): Promise<AgentRunResult> {
        const { includeLogs = false, model = this.getModel(), reasoningEffort = this.getReasoningEffort() } = options;
        const apiKey = this.getDeepSeekApiKey();

        if ( ! apiKey ) {
            return {
                response: "DeepSeek is not configured. Set AI_CHAT_DEEPSEEK_API_KEY or DEEPSEEK_API_KEY.",
                logs: EMPTY_LOGS
            };
        }

        const thinkingType: DeepSeekThinkingType = this.isDeepSeekThinkingEnabled() ? "enabled" : "disabled";
        const requestBody: DeepSeekChatCompletionRequest = {
            model,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            thinking: {
                type: thinkingType
            },
            stream: false
        };

        if ( thinkingType === "enabled" ) {
            requestBody.reasoning_effort = this.getDeepSeekReasoningEffort( reasoningEffort );
        }

        const controller = new AbortController();
        const timeout = setTimeout( () => controller.abort(), AGENT_TIMEOUT_MS );
        const url = `${ this.getDeepSeekBaseUrl() }${ DEEPSEEK_CHAT_COMPLETIONS_PATH }`;

        try {
            const response = await fetch( url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ apiKey }`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify( requestBody ),
                signal: controller.signal
            } );

            const responseBody = await response.text();
            const logs = includeLogs ? Buffer.from( responseBody ) : EMPTY_LOGS;
            const parsedResponse = this.parseDeepSeekResponse( responseBody );

            if ( ! response.ok ) {
                this.logger.error(
                    this.runDeepSeekCloud,
                    `DeepSeek exited with status ${ response.status }.\nResponse: ${ responseBody.slice( 0, MAX_LOG_BUFFER_LENGTH ) }`
                );

                return {
                    response: parsedResponse?.error?.message ?? "I couldn't generate a reply. DeepSeek failed to run.",
                    logs
                };
            }

            if ( ! parsedResponse ) {
                this.logger.error( this.runDeepSeekCloud, `DeepSeek returned invalid JSON: ${ responseBody.slice( 0, MAX_LOG_BUFFER_LENGTH ) }` );

                return {
                    response: "I couldn't generate a reply. DeepSeek returned invalid JSON.",
                    logs
                };
            }

            const content = this.resolveDeepSeekResponseContent( parsedResponse );

            if ( ! content ) {
                this.logger.error( this.runDeepSeekCloud, `DeepSeek returned no content: ${ responseBody.slice( 0, MAX_LOG_BUFFER_LENGTH ) }` );

                return {
                    response: "I couldn't generate a reply. DeepSeek didn't provide any output.",
                    logs
                };
            }

            this.logger.log( this.runDeepSeekCloud, `DeepSeek response received [model: ${ model }].` );

            return {
                response: this.sanitizeResponse( content ),
                logs
            };
        } catch( error ) {
            const message = error instanceof Error ? error.message : String( error );

            this.logger.error( this.runDeepSeekCloud, "Failed to call DeepSeek", error );

            return {
                response: `Error calling DeepSeek: ${ message }`,
                logs: EMPTY_LOGS
            };
        } finally {
            clearTimeout( timeout );
        }
    }

    private async runClaude( prompt: string, options: AgentRunOptions = {} ): Promise<AgentRunResult> {
        const { includeLogs = false, conversationId, readOnly = false, model = this.getModel(), reasoningEffort = this.getReasoningEffort() } = options;
        const claudeBinary = await this.getClaudeBinary();

        if ( ! claudeBinary ) {
            return {
                response: "Claude Code CLI is not configured. Set AI_CHAT_CLAUDE_BIN to the Claude Code CLI path.",
                logs: EMPTY_LOGS
            };
        }

        const baseArgs = [
            "--print",
            "--output-format", "json",
            "--model", model,
            "--effort", this.getClaudeEffort( reasoningEffort ),
            "--tools", this.getClaudeTools(),
            ...this.getClaudeMcpArgs( readOnly )
        ];

        const args = conversationId
            ? [ ...baseArgs, "--resume", conversationId ]
            : baseArgs;

        const env: NodeJS.ProcessEnv = {
            ...process.env,
            NODE_OPTIONS: "",
            NODE_PATH: "",
            ... ( readOnly ? { VERTIX_MCP_READONLY: "true" } : {} )
        };

        for ( const name of CLAUDE_STRIPPED_ENV_VARS ) {
            delete env[ name ];
        }

        return await new Promise<AgentRunResult>( ( resolve ) => {
            const child = spawn( claudeBinary, args, {
                cwd: REPO_ROOT,
                env
            } );

            this.logger.log( this.runClaude, `Executing Claude (${ claudeBinary }) [model: ${ model }]${ this.isClaudeMcpEnabled() ? " [mcp]" : "" }${ readOnly ? " [read-only]" : "" }${ conversationId ? ` [session: ${ conversationId.slice( 0, 8 ) }...]` : "" }...` );

            let hasTimedOut = false;

            const timeout = setTimeout( () => {
                hasTimedOut = true;
                this.logger.error( this.runClaude, `Claude timed out after ${ AGENT_TIMEOUT_MS }ms.` );
                child.kill();
            }, AGENT_TIMEOUT_MS );

            // Kept uncapped, the JSON payload holds the whole reply.
            const stdoutChunks: string[] = [];
            let stderr = "";
            let settled = false;

            const settle = ( response: string, sessionId?: string ) => {
                if ( settled ) {
                    return;
                }

                settled = true;
                clearTimeout( timeout );

                const logs = includeLogs
                    ? Buffer.from( `${ stdoutChunks.join( "" ) }\n${ stderr }` )
                    : EMPTY_LOGS;

                resolve( { response, logs, conversationId: sessionId || conversationId } );
            };

            child.stdout.on( "data", ( data: Buffer ) => {
                stdoutChunks.push( data.toString() );
            } );

            child.stderr.on( "data", ( data: Buffer ) => {
                stderr = this.appendToLimitedBuffer( stderr, data.toString() );
            } );

            child.on( "error", ( error ) => {
                this.logger.error( this.runClaude, "Failed to spawn Claude", error );
                settle( `Error spawning Claude: ${ error.message }` );
            } );

            child.on( "close", ( code ) => {
                if ( hasTimedOut ) {
                    settle( "I couldn't generate a reply. Claude timed out." );
                    return;
                }

                const stdout = stdoutChunks.join( "" );

                if ( code !== 0 ) {
                    this.logger.error(
                        this.runClaude,
                        `Claude exited with code ${ code }.\nStdout: ${ stdout.slice( 0, MAX_LOG_BUFFER_LENGTH ) }\nStderr: ${ stderr }`
                    );

                    settle( "I couldn't generate a reply. Claude failed to run." );
                    return;
                }

                const parsedResult = this.parseClaudeResult( stdout );

                if ( ! parsedResult ) {
                    this.logger.error( this.runClaude, `Claude returned invalid JSON: ${ stdout.slice( 0, MAX_LOG_BUFFER_LENGTH ) }` );

                    if ( stdout.trim() ) {
                        settle( this.sanitizeResponse( stdout ) );
                        return;
                    }

                    settle( "I couldn't generate a reply. Claude didn't provide any output." );
                    return;
                }

                const content = parsedResult.result?.trim();

                if ( parsedResult.is_error ) {
                    this.logger.error( this.runClaude, `Claude returned an error: ${ stdout.slice( 0, MAX_LOG_BUFFER_LENGTH ) }` );

                    settle(
                        content ? this.sanitizeResponse( content ) : "I couldn't generate a reply. Claude failed to run.",
                        parsedResult.session_id
                    );
                    return;
                }

                // A turn that only used tools - it posted a UI, ran an action - legitimately has no
                // text to say. The caller decides whether that deserves a message.
                if ( ! content ) {
                    this.logger.log( this.runClaude, `Claude finished without text output [model: ${ model }].` );

                    settle( "", parsedResult.session_id );
                    return;
                }

                this.logger.log( this.runClaude, `Claude response received [model: ${ model }].` );

                settle( this.sanitizeResponse( content ), parsedResult.session_id );
            } );

            child.stdin.write( prompt );
            child.stdin.end();
        } );
    }

    private async runCodex( prompt: string, options: AgentRunOptions = {} ): Promise<AgentRunResult> {
        const { includeLogs = false, conversationId, readOnly = false, model = this.getModel(), reasoningEffort = this.getReasoningEffort() } = options;
        const codexBinary = await this.getCodexBinary();

        if ( ! codexBinary ) {
            return {
                response: "Codex CLI is not configured. Set AI_CHAT_CODEX_BIN to the OpenAI Codex CLI path.",
                logs: EMPTY_LOGS
            };
        }

        const outputFile = path.join( os.tmpdir(), `codex-reply-${ crypto.randomUUID() }.txt` );
        const logsFile = includeLogs
            ? path.join( os.tmpdir(), `codex-logs-${ crypto.randomUUID() }.txt` )
            : null;

        return await new Promise<AgentRunResult>( ( resolve ) => {
            const logsStream = logsFile ? fsNative.createWriteStream( logsFile, { flags: "w" } ) : null;

            const baseArgs = [
                "exec", "-",
                "--sandbox", "read-only",
                "-o", outputFile,
                ...this.getCodexProviderArgs(),
                "-c", `model_reasoning_effort="${ reasoningEffort }"`,
                "--model", model
            ];

            const args = conversationId
                ? [ ...baseArgs, "-c", conversationId ]
                : baseArgs;

            const child = spawn( codexBinary, args, {
                cwd: REPO_ROOT,
                env: {
                    ...process.env,
                    NODE_OPTIONS: "",
                    NODE_PATH: "",
                    ... ( readOnly ? { VERTIX_MCP_READONLY: "true" } : {} )
                }
            } );

            this.logger.log( this.runCodex, `Executing Codex (${ codexBinary }) [model: ${ model }]${ readOnly ? " [read-only]" : "" }${ conversationId ? ` [session: ${ conversationId.slice( 0, 8 ) }...]` : "" }...` );

            let hasTimedOut = false;

            const timeout = setTimeout( () => {
                hasTimedOut = true;
                this.logger.error( this.runCodex, `Codex timed out after ${ AGENT_TIMEOUT_MS }ms.` );
                child.kill();
            }, AGENT_TIMEOUT_MS );

            let stdout = "";
            let stderr = "";
            let settled = false;
            let extractedConversationId: string | undefined;

            const settle = async( response: string ) => {
                if ( settled ) {
                    return;
                }

                settled = true;
                clearTimeout( timeout );

                const finalizeLogs = async() => {
                    if ( ! logsStream || ! logsFile ) {
                        return EMPTY_LOGS;
                    }

                    logsStream.end();

                    await new Promise<void>( ( done ) => {
                        logsStream.once( "finish", () => done() );
                    } );

                    return await fs.readFile( logsFile ).catch( () => EMPTY_LOGS );
                };

                const logs = await finalizeLogs();

                if ( await fs.stat( outputFile ).catch( () => null ) ) {
                    await fs.unlink( outputFile );
                }

                if ( logsFile && await fs.stat( logsFile ).catch( () => null ) ) {
                    await fs.unlink( logsFile );
                }

                resolve( { response, logs, conversationId: extractedConversationId || conversationId } );
            };

            const onStdout = ( data: Buffer ) => {
                if ( logsStream ) {
                    logsStream.write( data );
                }

                const chunk = data.toString();
                stdout = this.appendToLimitedBuffer( stdout, chunk );

                if ( ! extractedConversationId ) {
                    const match = chunk.match( /conversation[:\s]+([a-f0-9-]{36})/i );

                    if ( match ) {
                        extractedConversationId = match[ 1 ];
                    }
                }
            };

            const onStderr = ( data: Buffer ) => {
                if ( logsStream ) {
                    logsStream.write( data );
                }

                stderr = this.appendToLimitedBuffer( stderr, data.toString() );
            };

            child.stdout.on( "data", onStdout );
            child.stderr.on( "data", onStderr );

            child.on( "error", ( error ) => {
                this.logger.error( this.runCodex, "Failed to spawn Codex", error );
                void settle( `Error spawning Codex: ${ error.message }` );
            } );

            child.on( "close", ( code ) => {
                void ( async() => {
                    if ( hasTimedOut ) {
                        await settle( "I couldn't generate a reply. Codex timed out." );
                        return;
                    }

                    if ( code !== 0 ) {
                        this.logger.error(
                            this.runCodex,
                            `Codex exited with code ${ code }.\nStdout: ${ stdout }\nStderr: ${ stderr }`
                        );

                        await settle( "I couldn't generate a reply. Codex failed to run." );
                        return;
                    }

                    const exists = await fs.stat( outputFile ).then( () => true ).catch( () => false );

                    if ( ! exists ) {
                        this.logger.error(
                            this.runCodex,
                            `Codex finished but reply file was not created.\nStdout: ${ stdout }\nStderr: ${ stderr }`
                        );

                        if ( stdout.trim() ) {
                            await settle( this.sanitizeResponse( stdout ) );
                            return;
                        }

                        await settle( "I couldn't generate a reply. Codex didn't provide any output." );
                        return;
                    }

                    const responseContent = await fs.readFile( outputFile, "utf-8" ).catch( () => "" );

                    this.logger.log( this.runCodex, "Codex response received." );

                    await settle( this.sanitizeResponse( responseContent ) );
                } )();
            } );

            child.stdin.write( prompt );
            child.stdin.end();
        } );
    }
}

export default AgentManager;
