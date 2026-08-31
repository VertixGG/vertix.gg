import path from "path";

import { fileURLToPath } from "url";

import dotenv from "dotenv";

import { entryPoint } from "@vertix.gg/mcp/src/entrypoint";

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

// Resolved from this file, not from cwd - the server is also spawned from the repo root
// (Codex/Claude MCP configs), where a cwd-relative path misses the .env entirely.
dotenv.config( { path: path.resolve( __dirname, "../../../.env" ) } );

// Kept for the `vertix-mcp:start:dev` script, which runs with cwd=apps/vertix-mcp.
dotenv.config( { path: path.resolve( process.cwd(), "../../.env" ) } );

entryPoint();
