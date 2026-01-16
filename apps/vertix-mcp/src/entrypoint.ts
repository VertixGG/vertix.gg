import { Logger } from "@vertix.gg/base/src/modules/logger";

import { MCPServer } from "@vertix.gg/mcp/src/server/mcp-server";

const logger = new Logger( "VertixMCP/Entrypoint", { skipEventBusHook: true } );

export async function entryPoint() {
    logger.info( entryPoint, "Starting Vertix MCP Server..." );

    const server = new MCPServer();
    await server.start();
}
