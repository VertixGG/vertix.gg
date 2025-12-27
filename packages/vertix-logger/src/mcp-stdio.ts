#!/usr/bin/env bun

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const LOGGER_SERVER_HTTP_PORT = process.env.LOGGER_SERVER_HTTP_PORT ? parseInt( process.env.LOGGER_SERVER_HTTP_PORT, 10 ) : 3090;
const LOGGER_SERVER_HOST = process.env.LOGGER_SERVER_HOST || "localhost";
const LOGGER_SERVER_URL = `http://${ LOGGER_SERVER_HOST }:${ LOGGER_SERVER_HTTP_PORT }`;

const server = new Server(
    {
        name: "VertixLoggerServer",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

async function fetchLogs( limit: number = 50, startTime?: number, endTime?: number ): Promise<any[]> {
    const params = new URLSearchParams( { limit: limit.toString() } );
    if ( startTime ) params.set( "startTime", startTime.toString() );
    if ( endTime ) params.set( "endTime", endTime.toString() );

    const response = await fetch( `${ LOGGER_SERVER_URL }/logs?${ params.toString() }` );
    if ( !response.ok ) {
        throw new Error( `Failed to fetch logs: ${ response.status } ${ response.statusText }` );
    }
    return response.json() as Promise<any[]>;
}

async function fetchLogsInfo(): Promise<{ logCount: number; httpPort: number }> {
    const response = await fetch( `${ LOGGER_SERVER_URL }/health` );
    if ( !response.ok ) {
        throw new Error( `Failed to fetch logs info: ${ response.status } ${ response.statusText }` );
    }
    return response.json() as Promise<{ logCount: number; httpPort: number }>;
}

server.setRequestHandler( ListToolsRequestSchema, async() => {
    return {
        tools: [
            {
                name: "getRecentLogs",
                description: "Retrieves the most recent logs from the centralized logger server, optionally filtered by time range.",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            description: "Maximum number of logs to return",
                            default: 50,
                        },
                        startTime: {
                            type: "number",
                            description: "Optional start timestamp (ms) to filter logs after",
                        },
                        endTime: {
                            type: "number",
                            description: "Optional end timestamp (ms) to filter logs before",
                        },
                    },
                },
            },
            {
                name: "getLogsInfo",
                description: "Provides information about stored logs, including count, and first/last timestamps.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "getLogsRange",
                description: "Retrieves logs within a specific time range.",
                inputSchema: {
                    type: "object",
                    properties: {
                        startTime: {
                            type: "number",
                            description: "Required start timestamp (ms) to filter logs after",
                        },
                        endTime: {
                            type: "number",
                            description: "Required end timestamp (ms) to filter logs before",
                        },
                    },
                    required: [ "startTime", "endTime" ],
                },
            },
        ],
    };
} );

server.setRequestHandler( CallToolRequestSchema, async( request ) => {
    const { name, arguments: args } = request.params;

    if ( name === "getRecentLogs" ) {
        const limit = ( args as Record<string, unknown> )?.limit as number || 50;
        const startTime = ( args as Record<string, unknown> )?.startTime as number | undefined;
        const endTime = ( args as Record<string, unknown> )?.endTime as number | undefined;
        const logs = await fetchLogs( limit, startTime, endTime );
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify( logs, null, 2 ),
                },
            ],
        };
    }

    if ( name === "getLogsInfo" ) {
        const info = await fetchLogsInfo();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify( info, null, 2 ),
                },
            ],
        };
    }

    if ( name === "getLogsRange" ) {
        const startTime = ( args as Record<string, unknown> ).startTime as number;
        const endTime = ( args as Record<string, unknown> ).endTime as number;
        if ( startTime >= endTime ) {
            throw new Error( "Start time must be before end time." );
        }
        const logs = await fetchLogs( 10000, startTime, endTime );
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify( logs, null, 2 ),
                },
            ],
        };
    }

    throw new Error( `Unknown tool: ${ name }` );
} );

const transport = new StdioServerTransport();
await server.connect( transport );

