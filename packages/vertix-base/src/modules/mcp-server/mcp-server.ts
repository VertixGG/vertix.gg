// Placeholder for the MCP server logic that will receive logs
// and expose tools to the AI model.

import { FastMCP } from "fastmcp";
import { z } from "zod";

import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";

// Keep logs in memory (simple approach)
const MAX_LOGS = 5000; // Define a maximum number of logs to store
const logs: any[] = [];

export class McpServer extends ObjectBase {
    private server: FastMCP;

    public static getName(): string {
        return "VertixBase/Modules/McpServer";
    }

    public constructor() {
        super();

        // Create the fastmcp server instance
        this.server = new FastMCP( {
            name: "VertixBackendLogger",
            version: "0.1.0",
            // Add other config like authentication if needed
        } );

        this.defineMcpTools();
    }

    private defineMcpTools(): void {
        // Define the getRecentLogs tool using the fastmcp API
        this.server.addTool( {
            name: "getRecentLogs",
            description: "Retrieves the most recent logs received by the MCP server, optionally filtered by time range.",
            parameters: z.object( {
                limit: z.number().optional().default( 50 ).describe( "Maximum number of logs to return" ),
                startTime: z.number().optional().describe( "Optional start timestamp (ms) to filter logs after" ),
                endTime: z.number().optional().describe( "Optional end timestamp (ms) to filter logs before" ),
            } ),
            execute: async( args ) => {
                const { limit, startTime, endTime } = args;

                // Get initial slice based on limit (most recent)
                let recentLogs = logs.slice( -limit );

                // Apply time filters if provided
                if ( startTime ) {
                    recentLogs = recentLogs.filter( log => log.timestamp >= startTime );
                }
                if ( endTime ) {
                    recentLogs = recentLogs.filter( log => log.timestamp <= endTime );
                }

                return JSON.stringify( recentLogs, null, 2 );
            },
        } );

        // Define the getLogsInfo tool
        this.server.addTool( {
            name: "getLogsInfo",
            description: "Provides information about stored logs, including count, and first/last timestamps.",
            parameters: z.object( {} ), // No parameters
            execute: async() => {
                const logCount = logs.length;
                const firstTimestamp = logCount > 0 ? logs[ 0 ]?.timestamp : null;
                const lastTimestamp = logCount > 0 ? logs[ logCount - 1 ]?.timestamp : null;

                const info = {
                    logCount,
                    firstTimestamp,
                    lastTimestamp
                };
                return JSON.stringify( info, null, 2 );
            },
        } );

        // Define the getLogsRange tool
        this.server.addTool( {
            name: "getLogsRange",
            description: "Retrieves logs within a specific time range.",
            parameters: z.object( {
                startTime: z.number().describe( "Required start timestamp (ms) to filter logs after" ),
                endTime: z.number().describe( "Required end timestamp (ms) to filter logs before" ),
            } ),
            execute: async( args ) => {
                const { startTime, endTime } = args;

                // Validate timestamps
                if ( startTime >= endTime ) {
                    throw new Error( "Start time must be before end time." );
                }

                const filteredLogs = logs.filter( log =>
                    log.timestamp >= startTime && log.timestamp <= endTime
                );

                // Consider adding a safety limit here if the range could be huge
                // const MAX_RANGE_RESULTS = 1000;
                // if (filteredLogs.length > MAX_RANGE_RESULTS) {
                //    throw new Error(`Log range too large (${filteredLogs.length} logs). Maximum allowed: ${MAX_RANGE_RESULTS}`);
                // }

                return JSON.stringify( filteredLogs, null, 2 );
            },
        } );

        console.log( "MCP Tools defined: getRecentLogs, getLogsInfo, getLogsRange" );
    }

    // Start the fastmcp server
    public async start( port: number = 3000, _host?: string ): Promise<void> {
        // Note: fastmcp defaults to stdio if transportType isn't SSE
        // We need to configure it for SSE explicitly if needed for Cursor integration
        try {
            // Removed server name from log as config access is different
            console.log( "Attempting to start fastmcp server..." );
            await this.server.start( {
                transportType: "sse", // Explicitly use SSE
                sse: {
                    port: port,
                    // host: _host, // Add host if needed
                    endpoint: "/mcp" // Standard MCP endpoint
                }
            } );
            // fastmcp logs its start message, e.g.:
            // [FastMCP] My Server v1.0.0 started on http://localhost:8080/sse
        } catch ( err ) {
            console.error( "Error starting fastmcp server:", err );
            process.exit( 1 );
        }
    }

    // Stop the fastmcp server
    public async stop(): Promise<void> {
       console.log( "Stopping fastmcp server..." );
       // fastmcp v1.21.0 seems to lack an explicit stop method in the public API
       // This might require managing the underlying server manually or process exit.
       // For now, just log.
       // await this.server.stop(); // Hypothetical stop method
    }

    // Method to add a log entry, now with capping
    public addLog( logEntry: any ): void {
        if ( logs.length >= MAX_LOGS ) {
            logs.shift(); // Remove the oldest log if the limit is reached
        }
        logs.push( logEntry );
        // console.log('MCP Server received log directly:', logEntry);
    }
}
