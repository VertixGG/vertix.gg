import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";

const healthRoute: FastifyPluginAsync = async (fastify) => {
    // Response schema
    const responseSchema = {
        response: {
            200: Type.Object({
                status: Type.String(),
                timestamp: Type.String(),
                version: Type.String(),
            }),
        },
    };

    fastify.get("/health", {
        schema: responseSchema,
        handler: async () => {
            return {
                status: "ok",
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || "0.0.0",
            };
        },
    });
};

export default healthRoute;
