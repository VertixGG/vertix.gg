import { FastifyPluginAsync } from "fastify";

export const createUIModulesRoute: FastifyPluginAsync = async (fastify) => {
    fastify.get("/ui-modules", async (request, reply) => {
        return {
            modules: [
                { id: "dashboard", name: "Dashboard" },
                { id: "settings", name: "Settings" },
                { id: "users", name: "Users" }
            ]
        };
    });
};
