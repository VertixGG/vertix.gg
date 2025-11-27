import { createServer } from "http";

import { FastMCP } from "fastmcp";
import { z } from "zod";

import { ObjectBase } from "@vertix.gg/base/src/bases/object-base";

import type { IncomingMessage, ServerResponse } from "http";

const MAX_LOGS = 10000;
const logs: any[] = [];

export interface LoggerServerOptions {
    httpPort?: number;
    host?: string;
}

export class LoggerServer extends ObjectBase {
    private mcpServer: FastMCP;
    private httpServer: ReturnType<typeof createServer> | null = null;
    private httpPort: number;
    private host: string;

    public static getName(): string {
        return "VertixLogger/LoggerServer";
    }

    public constructor( options: LoggerServerOptions = {} ) {
        super();

        this.httpPort = options.httpPort || 3090;
        this.host = options.host || "0.0.0.0";

        this.mcpServer = new FastMCP( {
            name: "VertixLoggerServer",
            version: "0.1.0",
        } );

        this.defineMcpTools();
    }

    private defineMcpTools(): void {
        this.mcpServer.addTool( {
            name: "getRecentLogs",
            description: "Retrieves the most recent logs from the centralized logger server, optionally filtered by time range.",
            parameters: z.object( {
                limit: z.number().optional().default( 50 ).describe( "Maximum number of logs to return" ),
                startTime: z.number().optional().describe( "Optional start timestamp (ms) to filter logs after" ),
                endTime: z.number().optional().describe( "Optional end timestamp (ms) to filter logs before" ),
            } ),
            execute: async( args ) => {
                const { limit, startTime, endTime } = args;

                let recentLogs = logs.slice( -limit );

                if ( startTime ) {
                    recentLogs = recentLogs.filter( log => log.timestamp >= startTime );
                }
                if ( endTime ) {
                    recentLogs = recentLogs.filter( log => log.timestamp <= endTime );
                }

                return JSON.stringify( recentLogs, null, 2 );
            },
        } );

        this.mcpServer.addTool( {
            name: "getLogsInfo",
            description: "Provides information about stored logs, including count, and first/last timestamps.",
            parameters: z.object( {} ),
            execute: async() => {
                const logCount = logs.length;
                const firstTimestamp = logCount > 0 ? logs[ 0 ]?.timestamp : null;
                const lastTimestamp = logCount > 0 ? logs[ logCount - 1 ]?.timestamp : null;

                const info = {
                    logCount,
                    firstTimestamp,
                    lastTimestamp,
                    httpPort: this.httpPort
                };
                return JSON.stringify( info, null, 2 );
            },
        } );

        this.mcpServer.addTool( {
            name: "getLogsRange",
            description: "Retrieves logs within a specific time range.",
            parameters: z.object( {
                startTime: z.number().describe( "Required start timestamp (ms) to filter logs after" ),
                endTime: z.number().describe( "Required end timestamp (ms) to filter logs before" ),
            } ),
            execute: async( args ) => {
                const { startTime, endTime } = args;

                if ( startTime >= endTime ) {
                    throw new Error( "Start time must be before end time." );
                }

                const filteredLogs = logs.filter( log =>
                    log.timestamp >= startTime && log.timestamp <= endTime
                );

                return JSON.stringify( filteredLogs, null, 2 );
            },
        } );

        console.log( "Logger Server MCP Tools defined: getRecentLogs, getLogsInfo, getLogsRange" );
    }

    private createHttpServer(): void {
        this.httpServer = createServer( async( req: IncomingMessage, res: ServerResponse ) => {
            res.setHeader( "Access-Control-Allow-Origin", "*" );
            res.setHeader( "Access-Control-Allow-Methods", "POST, GET, OPTIONS" );
            res.setHeader( "Access-Control-Allow-Headers", "Content-Type" );

            if ( req.method === "OPTIONS" ) {
                res.writeHead( 200 );
                res.end();
                return;
            }

            if ( req.method === "POST" && req.url === "/logs" ) {
                let body = "";

                req.on( "data", chunk => {
                    body += chunk.toString();
                } );

                    req.on( "end", () => {
                    try {
                        const logEntry = JSON.parse( body );

                        if ( !logEntry.timestamp ) {
                            logEntry.timestamp = new Date().getTime();
                        }

                        if ( logs.length >= MAX_LOGS ) {
                            logs.shift();
                        }
                        logs.push( logEntry );

                        const processName = logEntry.process || "unknown";
                        const timestamp = new Date( logEntry.timestamp ).toISOString();

                        if ( logEntry.formatted ) {
                            console.log( `[${ processName }][${ timestamp }] ${ logEntry.formatted }` );
                        } else {
                            console.log( `[${ processName }][${ timestamp }][${ logEntry.source || "unknown" }] ${ logEntry.message || JSON.stringify( logEntry ) }` );
                        }

                        res.writeHead( 200, { "Content-Type": "application/json" } );
                        res.end( JSON.stringify( { success: true } ) );
                    } catch( error ) {
                        res.writeHead( 400, { "Content-Type": "application/json" } );
                        res.end( JSON.stringify( {
                            success: false,
                            error: error instanceof Error ? error.message : "Invalid JSON"
                        } ) );
                    }
                } );
            } else if ( req.method === "GET" && req.url === "/health" ) {
                res.writeHead( 200, { "Content-Type": "application/json" } );
                res.end( JSON.stringify( {
                    status: "ok",
                    logCount: logs.length,
                    httpPort: this.httpPort
                } ) );
            } else if ( req.method === "GET" && req.url?.startsWith( "/logs" ) ) {
                const url = new URL( req.url || "/", `http://${ req.headers.host }` );
                const limit = url.searchParams.get( "limit" ) ? parseInt( url.searchParams.get( "limit" )!, 10 ) : 50;
                const startTime = url.searchParams.get( "startTime" ) ? parseInt( url.searchParams.get( "startTime" )!, 10 ) : undefined;
                const endTime = url.searchParams.get( "endTime" ) ? parseInt( url.searchParams.get( "endTime" )!, 10 ) : undefined;

                let recentLogs = logs.slice( -limit );

                if ( startTime ) {
                    recentLogs = recentLogs.filter( log => log.timestamp >= startTime );
                }
                if ( endTime ) {
                    recentLogs = recentLogs.filter( log => log.timestamp <= endTime );
                }

                res.writeHead( 200, { "Content-Type": "application/json" } );
                res.end( JSON.stringify( recentLogs ) );
            } else {
                res.writeHead( 404, { "Content-Type": "application/json" } );
                res.end( JSON.stringify( { error: "Not found" } ) );
            }
        } );
    }

    public async start(): Promise<void> {
        this.createHttpServer();

        await new Promise<void>( ( resolve, reject ) => {
            if ( !this.httpServer ) {
                reject( new Error( "HTTP server not created" ) );
                return;
            }

            this.httpServer.listen( this.httpPort, this.host, () => {
                console.log( `Logger Server HTTP endpoint started on http://${ this.host }:${ this.httpPort }` );
                resolve();
            } );

            this.httpServer.on( "error", reject );
        } );

        console.log( "Logger Server MCP tools ready (stdio transport)" );
    }

    public async stop(): Promise<void> {
        return new Promise<void>( ( resolve ) => {
            if ( this.httpServer ) {
                this.httpServer.close( () => {
                    console.log( "Logger Server HTTP endpoint stopped" );
                    resolve();
                } );
            } else {
                resolve();
            }
        } );
    }

    public getHttpPort(): number {
        return this.httpPort;
    }

    public getMcpServer(): FastMCP {
        return this.mcpServer;
    }
}

