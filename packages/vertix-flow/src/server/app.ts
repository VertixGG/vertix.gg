import { FastifyInstance } from "fastify";
import fastify from "fastify";
import cors from "@fastify/cors";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { createUIModulesRoute } from "./routes/ui-modules";

export default () => {
    const app = fastify({
        logger: true,
        disableRequestLogging: process.env.NODE_ENV === "production",
    }).withTypeProvider<TypeBoxTypeProvider>();

    // Register plugins
    app.register(cors, {
        origin: true, // Allow all origins in development
    });

    // Register API routes - remove the duplicate /api prefix
    app.register(createUIModulesRoute);

    // Add health check endpoint
    app.get("/api/health", async () => {
        return { status: "ok" };
    });

    // Add a root route for frontend
    app.get("/", async (request, reply) => {
        // When using vite-plugin-fastify, this will be handled by Vite
        // But we need this route defined to prevent 404
        return { message: "Frontend should be handled by Vite" };
    });

    return app;
};
