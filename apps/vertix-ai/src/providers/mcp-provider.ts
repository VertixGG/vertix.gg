import path from "path";

import { fileURLToPath } from "url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport, getDefaultEnvironment } from "@modelcontextprotocol/sdk/client/stdio.js";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import type { JsonObject, OllamaToolDefinition } from "@vertix.gg/ai/src/definitions/ollama-definitions";

type MCPToolResult = Awaited<ReturnType<Client[ "callTool" ]>>;

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

const REPO_ROOT = path.resolve( __dirname, "../../../../" );

const CLIENT_NAME = "vertix-ai";
const CLIENT_VERSION = "0.0.0";

/**
 * Speaks MCP to `vertix-mcp` on this app's behalf.
 *
 * Ollama has no notion of MCP, so this owns both halves of the bridge: it
 * spawns the server over stdio, and translates its tool list into the
 * OpenAI-shaped `tools` array Ollama expects.
 */
export class MCPProvider extends InitializeBase {
    private static instance: MCPProvider;

    private client: Client | null = null;

    private tools: OllamaToolDefinition[] = [];

    private shutdownHooksRegistered = false;

    /** The spawned server's pid, so it can be killed synchronously on exit. */
    private childPid: number | null = null;

    public static getName() {
        return "VertixAI/Providers/MCPProvider";
    }

    public static getInstance(): MCPProvider {
        if ( !MCPProvider.instance ) {
            MCPProvider.instance = new MCPProvider();
        }

        return MCPProvider.instance;
    }

    public static get $() {
        return MCPProvider.getInstance();
    }

    public async connect(): Promise<void> {
        if ( this.client ) {
            return;
        }

        const config = AIConfig.$;

        const transport = new StdioClientTransport( {
            command: config.getMcpCommand(),
            args: [ "run", "--bun", path.join( REPO_ROOT, config.getMcpEntrypoint() ) ],
            env: {
                ...getDefaultEnvironment(),
                LOGGER_DISABLED: "true",
                VERTIX_MCP_READONLY: config.isMcpReadOnly() ? "true" : "false",
                // vertix-mcp acts as whatever token it is handed in DISCORD_TEST_TOKEN.
                // Handing it this app's own token is what makes the tools act as this
                // bot, in the guilds this bot was actually invited to.
                DISCORD_TEST_TOKEN: config.getDiscordToken()
            }
        } );

        const client = new Client( { name: CLIENT_NAME, version: CLIENT_VERSION } );

        await client.connect( transport );

        this.client = client;
        this.childPid = transport.pid;

        this.tools = await this.loadTools( client );

        this.registerShutdownHooks();

        this.logger.log(
            this.connect,
            `Connected to vertix-mcp - '${ this.tools.length }' tools, readOnly: '${ config.isMcpReadOnly() }'`
        );
    }

    public getTools(): OllamaToolDefinition[] {
        return this.tools;
    }

    public async callTool( name: string, args: JsonObject ): Promise<string> {
        try {
            return await this.invoke( name, args );
        } catch( error ) {
            if ( !this.isDisconnected( error ) ) {
                throw error;
            }

            // The server is a child process - it can be killed, crash, or be
            // restarted out from under us. Losing it silently means every tool
            // fails for the rest of the process lifetime, so reconnect once and
            // retry rather than reporting a dead connection to the user.
            this.logger.warn( this.callTool, "MCP connection lost - reconnecting and retrying once" );

            await this.reconnect();

            return await this.invoke( name, args );
        }
    }

    private async invoke( name: string, args: JsonObject ): Promise<string> {
        if ( !this.client ) {
            throw new Error( "Not connected" );
        }

        const result = await this.client.callTool( { name, arguments: args } );

        return this.stringifyResult( result );
    }

    private isDisconnected( error: unknown ): boolean {
        const message = error instanceof Error ? error.message : String( error );

        return /not connected|connection closed|epipe|transport/i.test( message );
    }

    private async reconnect(): Promise<void> {
        // Drop the dead handle without awaiting close - the peer is already gone.
        this.client = null;
        this.tools = [];

        await this.connect();
    }

    /**
     * Kills the MCP subprocess when this process goes away.
     *
     * The spawned server logs into Discord as this bot and holds a gateway
     * connection. Without this, every restart leaves one behind - after a few
     * development restarts there are several bots on one token, competing for
     * the same session and rate limit.
     */
    private registerShutdownHooks(): void {
        if ( this.shutdownHooksRegistered ) {
            return;
        }

        this.shutdownHooksRegistered = true;

        // Must be synchronous. An `exit` handler cannot await, and `bun --watch`
        // does not wait either - an async disconnect never completes, which is
        // why every reload used to leave an orphan reparented to launchd, each
        // still holding a Discord gateway session on this bot's token.
        const killChild = () => {
            if ( null === this.childPid ) {
                return;
            }

            try {
                process.kill( this.childPid, "SIGTERM" );
            } catch {
                // Already gone - nothing to do.
            }

            this.childPid = null;
        };

        process.once( "exit", killChild );
        process.once( "SIGINT", () => {
            killChild();
            process.exit( 0 );
        } );
        process.once( "SIGTERM", () => {
            killChild();
            process.exit( 0 );
        } );
    }

    public async disconnect(): Promise<void> {
        await this.client?.close();

        this.client = null;
        this.tools = [];
        this.childPid = null;
    }

    private async loadTools( client: Client ): Promise<OllamaToolDefinition[]> {
        const listed = await client.listTools();

        const excluded = AIConfig.$.getExcludedToolPrefixes();

        const allowed = listed.tools.filter(
            ( tool ) => !excluded.some( ( prefix ) => tool.name.startsWith( prefix ) )
        );

        if ( allowed.length < listed.tools.length ) {
            this.logger.log(
                this.loadTools,
                `Withheld '${ listed.tools.length - allowed.length }' tool(s) matching: ${ excluded.join( ", " ) }`
            );
        }

        return allowed.map( ( tool ) => ( {
            type: "function" as const,
            function: {
                name: tool.name,
                description: tool.description ?? tool.name,
                // MCP calls it `inputSchema`; Ollama calls it `parameters`. Same
                // JSON Schema either way.
                parameters: ( tool.inputSchema ?? { type: "object", properties: {} } ) as JsonObject
            }
        } ) );
    }

    /**
     * Tool results come back as content blocks; the model only reads text.
     *
     * The SDK types this as a union - a content-block result or a legacy
     * `toolResult` - so both shapes are narrowed rather than cast.
     */
    private stringifyResult( result: MCPToolResult ): string {
        if ( !( "content" in result ) || !Array.isArray( result.content ) ) {
            return JSON.stringify( result );
        }

        const content = result.content;

        const text = content
            .map( ( block ) => {
                if ( block && "object" === typeof block && "text" in block && "string" === typeof block.text ) {
                    return block.text;
                }

                return JSON.stringify( block );
            } )
            .join( "\n" );

        return ( "isError" in result && true === result.isError ) ? `Tool error: ${ text }` : text;
    }
}

export default MCPProvider;
