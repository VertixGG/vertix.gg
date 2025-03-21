import fastify from "fastify";
import cors from "@fastify/cors";
import { createUIModulesRoute } from "./routes/ui-modules";

export default () => {
    const app = fastify({
        logger: true,
    });

    // Register plugins
    app.register(cors, {
        origin: true,
    });

    // Register API routes
    app.register(createUIModulesRoute, { prefix: "/api" });

    // Add health check endpoint
    app.get("/api/health", async () => {
        return { status: "ok" };
    });

    return app;
};
