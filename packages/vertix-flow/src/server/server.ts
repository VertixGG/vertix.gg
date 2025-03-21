import app from "./app";

const server = app();

const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        const host = process.env.HOST || "0.0.0.0";
        
        await server.listen({ host, port });
        console.log(`Server running at http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    start();
}

export default server;