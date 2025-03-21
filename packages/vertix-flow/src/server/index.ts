import Fastify from "fastify";
import cors from "@fastify/cors";
import middie from "@fastify/middie";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { ViteDevServer } from "vite";

// Routes
import healthRoute from "./routes/health";

const createServer = async (vite?: ViteDevServer) => {
    const fastify = Fastify({
        logger: true,
        // Disable request logging in production
        disableRequestLogging: process.env.NODE_ENV === "production",
    }).withTypeProvider<TypeBoxTypeProvider>();

    // Register plugins
    await fastify.register(cors, {
        origin: true, // Allow all origins in development
    });

    // Register routes
    await fastify.register(healthRoute, { prefix: "/api" });

    // Add Vite middleware in development
    if (vite) {
        await fastify.register(middie);
        await fastify.use(vite.middlewares);
    }

    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        await fastify.listen({ port, host: "0.0.0.0" });
        console.log(`Server listening at http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }

    return fastify;
};

export { createServer };
