import path from "path";

import { fileURLToPath } from "url";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

const REPO_ROOT = path.resolve( __dirname, "../../../../" );

const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";
const DEFAULT_OLLAMA_MODEL = "qwen3.5:35b-a3b-int4";
const DEFAULT_OLLAMA_NUM_CTX = 32768;
const DEFAULT_OLLAMA_KEEP_ALIVE = "30m";
const DEFAULT_OLLAMA_REQUEST_TIMEOUT_MS = 600000;

const DEFAULT_PROMPT_UPLOAD_WINDOW_MS = 300000;
const DEFAULT_PROMPT_MAX_BYTES = 65536;

const DEFAULT_HISTORY_LIMIT = 1000;
// Measured: prefill runs at ~12,600 tok/s on this model, so 30K tokens of
// history costs about 2.4s - cheap. Generation is the slow part, not context.
const DEFAULT_HISTORY_MAX_CHARS = 120000;

// How many bot-only messages in a row before this bot stops answering another
// bot, so two bots addressing each other cannot talk forever with no human.
const DEFAULT_BOT_CONVERSATION_MAX_TURNS = 6;

const DEFAULT_MCP_COMMAND = "bun";

/**
 * Tool name prefixes withheld from the model.
 *
 * `ui_*` drives Vertix's own UI runtime over IPC, so calling one makes a
 * DIFFERENT bot render and post - this app reached across and made
 * VoiceChannels AI publish its welcome embeds. Those tools belong to the bot
 * that owns that runtime, not to this one.
 */
const DEFAULT_EXCLUDED_TOOL_PREFIXES = "ui_";
const DEFAULT_MAX_TOOL_ITERATIONS = 6;

/**
 * How long a proposed destructive action stays approvable.
 *
 * 15 minutes, not 2. The bot itself takes 30s+ to reply, and people answer a
 * Discord message when they get to it - a 2-minute window expired before most
 * confirmations arrived, so each "yes" found nothing pending and started a
 * fresh proposal, looping forever. Length is not what makes this safe: the
 * approval is bound to one exact tool call, for one person, and is single-use.
 */
const DEFAULT_DESTRUCTIVE_CONFIRM_WINDOW_MS = 900000;

/**
 * Sized to fit a full 100-message fetch (~24K chars).
 *
 * Set to 6000 originally, on the mistaken belief that prefill was slow. It is
 * not - ~12,600 tok/s - but clipping mid-list made the model answer counting
 * questions with the number of rows it happened to see. Truncating a list
 * silently corrupts the answer; the cost of not truncating is about half a
 * second.
 */
const DEFAULT_TOOL_RESULT_MAX_CHARS = 28000;
const VERTIX_MCP_ENTRYPOINT = "apps/vertix-mcp/src/index.ts";

/** A command that has not returned by then is killed; the bot must not hang on it. */
const DEFAULT_SHELL_TIMEOUT_MS = 30000;
/** Enough for a directory listing or a log tail; anything larger is clipped. */
const DEFAULT_SHELL_MAX_OUTPUT_CHARS = 8000;

/**
 * Every value the app reads from the environment lives here, so nothing else
 * touches `process.env` directly and no limit is written as a literal at its
 * call site.
 */
export class AIConfig extends InitializeBase {
    private static instance: AIConfig;

    public static getName() {
        return "VertixAI/Config/AIConfig";
    }

    public static getInstance(): AIConfig {
        if ( !AIConfig.instance ) {
            AIConfig.instance = new AIConfig();
        }

        return AIConfig.instance;
    }

    public static get $() {
        return AIConfig.getInstance();
    }

    public getDiscordToken(): string {
        const token = process.env.VERTIX_AI_DISCORD_TOKEN;

        if ( !token ) {
            throw new Error( "VERTIX_AI_DISCORD_TOKEN environment variable is required" );
        }

        return token;
    }

    /**
     * When set, commands register to this one guild instead of globally.
     *
     * Global commands can take up to an hour to propagate to clients, which
     * makes iterating on a command definition unusable; guild-scoped ones are
     * visible immediately. Leave empty in production.
     */
    public getDevGuildId(): string | null {
        return process.env.VERTIX_AI_DEV_GUILD_ID?.trim() || null;
    }

    /**
     * GuildMembers is a privileged intent: requesting it while it is switched
     * off in the Developer Portal makes login fail outright, so it stays opt-in
     * rather than being requested just because an event might want it.
     */
    public isMemberIntentEnabled(): boolean {
        return "true" === process.env.VERTIX_AI_ENABLE_MEMBER_INTENT?.trim();
    }

    /**
     * The bot owner's Discord user id, from `OWNERD_ID`.
     *
     * That is the repo's existing variable (misspelling included) - reused so a
     * single value serves every app, rather than a second correctly-spelt one
     * that would drift out of sync with it.
     */
    public getOwnerId(): string | null {
        return process.env.OWNERD_ID?.trim() || null;
    }

    public isOwner( userId: string ): boolean {
        const ownerId = this.getOwnerId();

        return null !== ownerId && ownerId === userId;
    }

    public getOllamaBaseUrl(): string {
        const baseUrl = process.env.VERTIX_AI_OLLAMA_BASE_URL ?? DEFAULT_OLLAMA_BASE_URL;

        return baseUrl.replace( /\/+$/, "" );
    }

    public getOllamaModel(): string {
        return process.env.VERTIX_AI_OLLAMA_MODEL ?? DEFAULT_OLLAMA_MODEL;
    }

    /**
     * Ollama defaults this to 4096, which silently truncates the tool schemas
     * rather than failing - so it is always sent explicitly.
     */
    public getOllamaNumCtx(): number {
        return this.readPositiveInteger( process.env.VERTIX_AI_OLLAMA_NUM_CTX, DEFAULT_OLLAMA_NUM_CTX );
    }

    public getOllamaKeepAlive(): string {
        return process.env.VERTIX_AI_OLLAMA_KEEP_ALIVE ?? DEFAULT_OLLAMA_KEEP_ALIVE;
    }

    public getOllamaRequestTimeoutMs(): number {
        return this.readPositiveInteger(
            process.env.VERTIX_AI_OLLAMA_REQUEST_TIMEOUT_MS,
            DEFAULT_OLLAMA_REQUEST_TIMEOUT_MS
        );
    }

    /** How long an armed "send me your file" window stays open. */
    public getPromptUploadWindowMs(): number {
        return this.readPositiveInteger(
            process.env.VERTIX_AI_PROMPT_UPLOAD_WINDOW_MS,
            DEFAULT_PROMPT_UPLOAD_WINDOW_MS
        );
    }

    /** Upper bound on an uploaded prompt, so one file cannot fill the context window. */
    public getPromptMaxBytes(): number {
        return this.readPositiveInteger( process.env.VERTIX_AI_PROMPT_MAX_BYTES, DEFAULT_PROMPT_MAX_BYTES );
    }

    /**
     * Ceiling on how many prior channel messages are replayed to the model.
     *
     * Discord returns at most 100 per request, so this is paginated. The real
     * limit is usually `getHistoryMaxChars`, not this.
     */
    public getHistoryLimit(): number {
        return this.readPositiveInteger( process.env.VERTIX_AI_HISTORY_LIMIT, DEFAULT_HISTORY_LIMIT );
    }

    /**
     * The budget that actually binds: history stops being collected once it
     * would exceed this many characters.
     *
     * Roughly 4 chars per token, so the 160K default is about 40K tokens -
     * comfortably inside a 64K window while leaving room for the system prompt,
     * the reply, and the tool schemas that are coming.
     */
    public getHistoryMaxChars(): number {
        return this.readPositiveInteger( process.env.VERTIX_AI_HISTORY_MAX_CHARS, DEFAULT_HISTORY_MAX_CHARS );
    }

    /** Consecutive bot-only messages before this bot stops answering a bot. */
    public getBotConversationMaxTurns(): number {
        return this.readPositiveInteger(
            process.env.VERTIX_AI_BOT_CONVERSATION_MAX_TURNS,
            DEFAULT_BOT_CONVERSATION_MAX_TURNS
        );
    }

    /** The small "12k/64k tok" line under each reply. */
    public isUsageFooterEnabled(): boolean {
        return "false" !== process.env.VERTIX_AI_USAGE_FOOTER?.trim();
    }

    public isMcpEnabled(): boolean {
        return "false" !== process.env.VERTIX_AI_MCP_ENABLED?.trim();
    }

    /**
     * Read-only swaps the 58 mutating tools for the 24 in
     * `definitions-readonly.ts` - the difference between a bot that can answer
     * questions about the server and one that can ban people.
     */
    public isMcpReadOnly(): boolean {
        return "true" === process.env.VERTIX_AI_MCP_READONLY?.trim();
    }

    /**
     * How many times the model may call tools before it must answer.
     *
     * Without a ceiling a confused model can loop on the same tool forever,
     * holding a Discord typing indicator open the whole time.
     */
    public getMaxToolIterations(): number {
        return this.readPositiveInteger( process.env.VERTIX_AI_MAX_TOOL_ITERATIONS, DEFAULT_MAX_TOOL_ITERATIONS );
    }

    /**
     * Tool results are clipped before going back to the model.
     *
     * One `discord_get_messages` call returns ~6K tokens - more than the entire
     * conversation around it - and the model needs the shape of the data, not
     * every field of every row.
     */
    public getToolResultMaxChars(): number {
        return this.readPositiveInteger(
            process.env.VERTIX_AI_TOOL_RESULT_MAX_CHARS,
            DEFAULT_TOOL_RESULT_MAX_CHARS
        );
    }

    public getDestructiveConfirmWindowMs(): number {
        return this.readPositiveInteger(
            process.env.VERTIX_AI_DESTRUCTIVE_CONFIRM_WINDOW_MS,
            DEFAULT_DESTRUCTIVE_CONFIRM_WINDOW_MS
        );
    }

    /** Comma-separated prefixes; empty string disables the filter. */
    public getExcludedToolPrefixes(): string[] {
        const configured = process.env.VERTIX_AI_EXCLUDED_TOOL_PREFIXES ?? DEFAULT_EXCLUDED_TOOL_PREFIXES;

        return configured
            .split( "," )
            .map( ( prefix ) => prefix.trim() )
            .filter( ( prefix ) => prefix.length );
    }

    /**
     * Shell access for the owner. On by default because it was asked for;
     * `VERTIX_AI_SHELL_ENABLED=false` is the kill switch.
     */
    public isShellEnabled(): boolean {
        return "false" !== process.env.VERTIX_AI_SHELL_ENABLED?.trim();
    }

    public getShellTimeoutMs(): number {
        return this.readPositiveInteger( process.env.VERTIX_AI_SHELL_TIMEOUT_MS, DEFAULT_SHELL_TIMEOUT_MS );
    }

    public getShellMaxOutputChars(): number {
        return this.readPositiveInteger( process.env.VERTIX_AI_SHELL_MAX_OUTPUT_CHARS, DEFAULT_SHELL_MAX_OUTPUT_CHARS );
    }

    /** Where commands run. The repo root, unless pointed elsewhere. */
    public getShellCwd(): string {
        return process.env.VERTIX_AI_SHELL_CWD?.trim() || REPO_ROOT;
    }

    public getMcpCommand(): string {
        return process.env.VERTIX_AI_MCP_COMMAND?.trim() || DEFAULT_MCP_COMMAND;
    }

    public getMcpEntrypoint(): string {
        return VERTIX_MCP_ENTRYPOINT;
    }

    private readPositiveInteger( value: string | undefined, fallback: number ): number {
        if ( !value ) {
            return fallback;
        }

        const parsed = Number.parseInt( value, 10 );

        if ( !Number.isFinite( parsed ) || parsed <= 0 ) {
            this.logger.warn( this.readPositiveInteger, `Invalid value '${ value }', falling back to '${ fallback }'` );

            return fallback;
        }

        return parsed;
    }
}

export default AIConfig;
