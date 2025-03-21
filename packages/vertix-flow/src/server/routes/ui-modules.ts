import { Type } from "@sinclair/typebox";
import { FastifyPluginAsync } from "fastify";
import path from "path";
import { readFile } from "fs/promises";
import { scanUIModules, type UIModuleFile } from "../utils/file-scanner";

export const createUIModulesRoute: FastifyPluginAsync = async (fastify, opts) => {
    // Add prefix to all routes
    fastify.register(
        async (instance) => {
            const responseSchema = {
                response: {
                    200: Type.Object({
                        files: Type.Array(
                            Type.Object({
                                name: Type.String(),
                                path: Type.String(),
                                moduleInfo: Type.Object({
                                    name: Type.String(),
                                    adapters: Type.Array(Type.String()),
                                }),
                            })
                        ),
                    }),
                },
            };

            instance.get("/ui-modules", {
                schema: responseSchema,
                handler: async (request, reply) => {
                    try {
                        // Get the absolute path to the UI modules directory
                        const uiModulesPath = path.resolve(__dirname, "../../../..", "vertix-bot/src/ui");

                        instance.log.info(`Scanning UI modules from: ${uiModulesPath}`);

                        const files = await scanUIModules(uiModulesPath);

                        if (!files || files.length === 0) {
                            instance.log.warn("No UI modules found");
                            return { files: [] };
                        }

                        instance.log.info(`Found ${files.length} UI modules`);
                        return { files };
                    } catch (error) {
                        instance.log.error("Error scanning UI modules:", error);
                        reply.status(500).send({
                            error: "Failed to scan UI modules",
                            message: error instanceof Error ? error.message : "Unknown error",
                        });
                    }
                },
            });

            // Add an endpoint to get a specific file
            const singleFileSchema = {
                params: Type.Object({
                    filePath: Type.String(),
                }),
                response: {
                    200: Type.Object({
                        name: Type.String(),
                        path: Type.String(),
                        content: Type.String(),
                    }),
                },
            };

            instance.get("/ui-modules/:filePath", {
                schema: singleFileSchema,
                handler: async (request, reply) => {
                    const { filePath } = request.params as { filePath: string };
                    const uiModulesPath = path.resolve(__dirname, "../../../..", "vertix-bot/src/ui");

                    try {
                        const fullPath = path.join(uiModulesPath, filePath);

                        // Security check: ensure the requested file is within the UI modules directory
                        if (!fullPath.startsWith(uiModulesPath)) {
                            reply.status(403).send({ error: "Access denied" });
                            return;
                        }

                        const content = await readFile(fullPath, "utf-8");
                        return {
                            name: path.basename(filePath),
                            path: filePath,
                            content,
                        };
                    } catch (error) {
                        reply.status(404).send({ error: "File not found" });
                    }
                },
            });
        },
        { prefix: "/api" }
    );
};
