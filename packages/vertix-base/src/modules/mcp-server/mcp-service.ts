import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import { McpServer } from "@vertix.gg/base/src/modules/mcp-server/mcp-server"; // Assuming mcp-server.ts is in the same directory

// TODO: Get port/host from configuration/environment variables
const MCP_PORT = 3090;
const MCP_HOST = "0.0.0.0";

export class MCPService extends ServiceBase {
    private static mcpServer: McpServer;

    public static getName(): string {
        return "VertixBase/Modules/MCPService";
    }

    public constructor() {
        super();

        // Initialization logic is handled in the initialize method by ServiceBase
    }

    protected async initialize(): Promise<void> {
        this.logger.log( this.initialize, "Initializing MCP Service..." );

        try {
            MCPService.mcpServer = new McpServer();

            // Start the MCP server (Fastify instance)
            // Consider adding error handling or status checking
            await MCPService.mcpServer.start( MCP_PORT, MCP_HOST );

            EventBus.$.on( "VertixBase/Modules/Logger", "outputInternal", this.onLoggerOutput.bind( this ) );

            this.logger.info( this.initialize, `MCP Server started on http://${ MCP_HOST }:${ MCP_PORT }` );
        } catch ( error ) {
            this.logger.error( this.initialize, "Failed to start MCP Server", error );
            // Rethrow or handle appropriately - ServiceBase might catch this
            throw error;
        }
    }

    /**
     * Optional: Add a method to explicitly stop the server if needed.
     * ServiceBase doesn't seem to have a standard shutdown hook, so manual call might be necessary.
     */
    public async stopServer(): Promise<void> {
        if ( MCPService.mcpServer ) {
            this.logger.log( this.stopServer, "Stopping MCP Server..." );
            await MCPService.mcpServer.stop();
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
            } catch ( error ) {
                console.error( "MCPService.onLoggerOutput: Failed to add log via addLog method:", error );
            }
        }
    }
}
