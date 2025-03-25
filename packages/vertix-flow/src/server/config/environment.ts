import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

/**
 * Environment configuration class
 * Handles loading and providing access to environment variables
 */
export class Environment extends InitializeBase {
    private readonly defaults = {
        port: 3000,
        host: "0.0.0.0",
        nodeEnv: "development"
    };

    /**
     * Get the name of the class
     */
    public static getName(): string {
        return "VertixFlow/Server/Config/Environment";
    }

    public constructor() {
        super();
    }

    protected initialize(): void {
        this.logger.info( "initialize", "Environment configuration initialized" );
    }

    /**
     * Get the server port
     */
    public getPort(): number {
        return process.env.PORT ? parseInt( process.env.PORT, 10 ) : this.defaults.port;
    }

    /**
     * Get the server host
     */
    public getHost(): string {
        return process.env.HOST || this.defaults.host;
    }

    /**
     * Get the node environment
     */
    public getNodeEnv(): string {
        return process.env.NODE_ENV || this.defaults.nodeEnv;
    }

    /**
     * Check if running in production
     */
    public isProduction(): boolean {
        return this.getNodeEnv() === "production";
    }

    /**
     * Check if running in development
     */
    public isDevelopment(): boolean {
        return this.getNodeEnv() === "development";
    }

    /**
     * Check if running in test
     */
    public isTest(): boolean {
        return this.getNodeEnv() === "test";
    }
}

// Singleton instance
export const environment = new Environment();
