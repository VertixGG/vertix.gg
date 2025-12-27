export const environment = {
    getPort(): number {
        return parseInt( process.env.API_PORT || "3021", 10 );
    },

    getHost(): string {
        return process.env.API_HOST || "0.0.0.0";
    },

    isDevelopment(): boolean {
        return process.env.NODE_ENV !== "production";
    }
};

