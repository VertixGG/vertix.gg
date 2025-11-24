import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import { McpServer } from "@vertix.gg/base/src/modules/mcp-server/mcp-server"; // Assuming mcp-server.ts is in the same directory

// TODO: Get port/host from configuration/environment variables
const MCP_HOST = "0.0.0.0";
const MCP_PORT_MIN = 45000;
const MCP_PORT_MAX = 46000;
const MCP_PORT_ATTEMPTS = 8;

export class MCPService extends ServiceBase {
    private static mcpServer: McpServer;
    private static currentPort: number | null = null;

    public static getName(): string {
        return "VertixBase/Modules/MCPService";
    }

    public constructor() {
        super();

        // Initialization logic is handled in the initialize method by ServiceBase
    }

    protected async initialize(): Promise<void> {
        this.logger.log( this.initialize, "Initializing MCP Service..." );

        MCPService.mcpServer = new McpServer();

        let lastError: unknown = null;

        for ( let attempt = 0; attempt < MCP_PORT_ATTEMPTS; attempt += 1 ) {
            const candidatePort = MCPService.getRandomPort();

            try {
                await MCPService.mcpServer.start( candidatePort, MCP_HOST );
                MCPService.currentPort = candidatePort;
                EventBus.$.on( "VertixBase/Modules/Logger", "outputInternal", this.onLoggerOutput.bind( this ) );
                this.logger.info( this.initialize, `MCP Server started on http://${ MCP_HOST }:${ candidatePort }` );
                return;
            } catch( error ) {
                lastError = error;
                this.logger.warn(
                    this.initialize,
                    `Failed to start MCP Server on port ${ candidatePort }, attempt ${ attempt + 1 }/${ MCP_PORT_ATTEMPTS }`,
                    error
                );
            }
        }

        this.logger.error( this.initialize, "Failed to start MCP Server after exhausting port attempts", lastError );
        throw lastError instanceof Error ? lastError : new Error( "Failed to start MCP Server" );
    }

    /**
     * Optional: Add a method to explicitly stop the server if needed.
     * ServiceBase doesn't seem to have a standard shutdown hook, so manual call might be necessary.
     */
    public async stopServer(): Promise<void> {
        if ( MCPService.mcpServer ) {
            this.logger.log( this.stopServer, "Stopping MCP Server..." );
            await MCPService.mcpServer.stop();
            MCPService.currentPort = null;
            this.logger.info( this.stopServer, "MCP Server stopped." );
        }
    }

    // You can add methods here to interact with McpServer if needed,
    // e.g., retrieving logs or status, although tools will likely handle log retrieval.
    private onLoggerOutput( prefix: string, timeDiff: string, source: string, messagePrefix: string, message: string, params: any[] ) {
        // Create a log entry with all the relevant information
        const logEntry = {
            timestamp: new Date().getTime(),
            prefix,
            timeDiff,
            source,
            messagePrefix,
            message,
            params: params && params.length ? params : [],
            formatted: `${ prefix }[+${ timeDiff }ms][${ source }]${ messagePrefix }: ${ message }`
        };

        if ( MCPService.mcpServer ) {
            // Call the addLog method directly on the static McpServer instance
            try {
                MCPService.mcpServer.addLog( logEntry );
            } catch( error ) {
                console.error( "MCPService.onLoggerOutput: Failed to add log via addLog method:", error );
            }
        }
    }

    private static getRandomPort(): number {
        const range = MCP_PORT_MAX - MCP_PORT_MIN + 1;
        return MCP_PORT_MIN + Math.floor( Math.random() * range );
    }
}
