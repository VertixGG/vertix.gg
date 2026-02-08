import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { Logger } from "@vertix.gg/base/src/modules/logger";

import { environment } from "@vertix.gg/mcp/src/server/config/environment";
import { getAllTools, executeTool } from "@vertix.gg/mcp/src/tools";

const logger = new Logger( "VertixMCP/Server", { skipEventBusHook: true } );

export class MCPServer {
    private server: Server;
    private transport: StdioServerTransport;

    public constructor() {
        this.server = new Server(
            {
                name: environment.getServerName(),
                version: environment.getServerVersion()
            },
            {
                capabilities: {
                    tools: {}
                }
            }
        );

        this.transport = new StdioServerTransport();

        this.registerHandlers();
    }

    public async start(): Promise<void> {
        try {
            await this.server.connect( this.transport );

            logger.info( this.start, `MCP Server "${ environment.getServerName() }" started` );
        } catch( error ) {
            logger.error( this.start, "Failed to start MCP server", error );
            process.exit( 1 );
        }
    }

    public async stop(): Promise<void> {
        await this.server.close();
    }

    private registerHandlers(): void {
        this.server.setRequestHandler( ListToolsRequestSchema, async() => {
            return {
                tools: getAllTools()
            };
        } );

        this.server.setRequestHandler( CallToolRequestSchema, async( request ) => {
            const { name, arguments: args } = request.params;

            logger.info( this.registerHandlers, `Executing tool: ${ name }` );

            try {
                const result = await executeTool( name, args );

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: JSON.stringify( result, null, 2 )
                        }
                    ]
                };
            } catch( error ) {
                const errorMessage = error instanceof Error ? error.message : String( error );

                logger.error( this.registerHandlers, `Tool execution failed: ${ name }`, error );

                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `Error: ${ errorMessage }`
                        }
                    ],
                    isError: true
                };
            }
        } );
    }
}
