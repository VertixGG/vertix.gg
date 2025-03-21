import app from "./app";

const server = app();

const start = async () => {
    try {
        // Use port 3000 for the backend API server to avoid conflict with Vite
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        const host = process.env.HOST || "0.0.0.0";

        await server.listen({ host, port });
        console.log(`Server is running at http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

// Only start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    start();
}

export default server;
