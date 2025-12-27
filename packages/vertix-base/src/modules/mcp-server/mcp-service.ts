import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

const LOGGER_SERVER_HTTP_PORT = process.env.LOGGER_SERVER_HTTP_PORT ? parseInt( process.env.LOGGER_SERVER_HTTP_PORT, 10 ) : 3090;
const LOGGER_SERVER_HOST = process.env.LOGGER_SERVER_HOST || "localhost";

export class MCPService extends ServiceBase {
    private static loggerServerUrl: string;
    private static isServerAvailable: boolean = false;

    public static getName(): string {
        return "VertixBase/Modules/MCPService";
    }

    public static getLoggerServerUrl(): string | null {
        return MCPService.loggerServerUrl || null;
    }

    private options?: { loggerServerUrl?: string };
    private healthCheckInterval: NodeJS.Timeout | null = null;

    public constructor( options?: { loggerServerUrl?: string } ) {
        super();
        this.options = options;
    }

    protected async initialize(): Promise<void> {
        this.logger.log( this.initialize, "Initializing MCP Service (Logger Client)..." );

        // Determine logger server URL
        const loggerServerUrl = this.options?.loggerServerUrl ||
            `http://${ LOGGER_SERVER_HOST }:${ LOGGER_SERVER_HTTP_PORT }`;

        MCPService.loggerServerUrl = loggerServerUrl;

        // Start periodic health checks (will detect when server becomes available)
        this.startHealthChecks( loggerServerUrl );

        // Try to connect to logger server in background (non-blocking)
        this.waitForLoggerServer( loggerServerUrl ).catch( () => {
            // Already logged in waitForLoggerServer, just continue
        } );

        // Register event listener to send logs to logger server
        EventBus.$.on( "VertixBase/Modules/Logger", "outputEvent", this.onLoggerOutput.bind( this ) );

        this.logger.info( this.initialize, `MCP Service initialized, sending logs to ${ loggerServerUrl }` );
    }

    private async waitForLoggerServer( url: string, maxAttempts: number = 3, delayMs: number = 500 ): Promise<void> {
        for ( let attempt = 1; attempt <= maxAttempts; attempt++ ) {
            try {
                const response = await fetch( `${ url }/health`, {
                    method: "GET",
                    signal: AbortSignal.timeout( 2000 )
                } );

                if ( response.ok ) {
                    MCPService.isServerAvailable = true;
                    this.logger.info( this.waitForLoggerServer, `Logger server is available at ${ url }` );
                    return;
                }
            } catch {
                if ( attempt < maxAttempts ) {
                    this.logger.warn(
                        this.waitForLoggerServer,
                        `Logger server not available (attempt ${ attempt }/${ maxAttempts }), retrying in ${ delayMs }ms...`
                    );
                    await new Promise( resolve => setTimeout( resolve, delayMs ) );
                } else {
                    this.logger.error(
                        this.waitForLoggerServer,
                        `Logger server not available after ${ maxAttempts } attempts. Logs will be sent when server becomes available.`
                    );
                }
            }
        }
    }

    private startHealthChecks( url: string ): void {
        // Perform initial health check immediately
        this.performHealthCheck( url );

        // Then check every 5 seconds
        this.healthCheckInterval = setInterval( () => {
            this.performHealthCheck( url );
        }, 5000 );
    }

    private async performHealthCheck( url: string ): Promise<void> {
        try {
            const response = await fetch( `${ url }/health`, {
                method: "GET",
                signal: AbortSignal.timeout( 2000 )
            } );

            MCPService.isServerAvailable = response.ok;
        } catch {
            MCPService.isServerAvailable = false;
        }
    }

    public async stop(): Promise<void> {
        if ( this.healthCheckInterval ) {
            clearInterval( this.healthCheckInterval );
            this.healthCheckInterval = null;
        }
    }

    private async onLoggerOutput( prefix: string, timeDiff: string, source: string, messagePrefix: string, message: string, params: any[] ): Promise<void> {
        // Skip sending if server is known to be unavailable (health check will retry)
        if ( !MCPService.isServerAvailable ) {
            return;
        }

        const processName = process.env.LOGGER_PROCESS_NAME ||
            process.env.npm_package_name ||
            "unknown";

        // Create a log entry with all the relevant information
        const logEntry = {
            timestamp: new Date().getTime(),
            process: processName,
            prefix,
            timeDiff,
            source,
            messagePrefix,
            message,
            params: params && params.length ? params : [],
            formatted: `${ prefix }[+${ timeDiff }ms][${ source }]${ messagePrefix }: ${ message }`
        };

        // Send log to logger server via HTTP
        try {
            const response = await fetch( `${ MCPService.loggerServerUrl }/logs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify( logEntry ),
                signal: AbortSignal.timeout( 1000 )
            } );

            if ( !response.ok ) {
                MCPService.isServerAvailable = false;
                if ( process.env.DEBUG_LOGGER_CLIENT === "true" ) {
                    console.error( `Failed to send log to logger server: ${ response.status } ${ response.statusText }` );
                }
            }
        } catch( error ) {
            MCPService.isServerAvailable = false;
            // Silently fail to avoid log spam if logger server is not available
            // Only log error in debug mode
            if ( process.env.DEBUG_LOGGER_CLIENT === "true" ) {
                console.error( "MCPService.onLoggerOutput: Failed to send log to logger server:", error );
            }
        }
    }
}

