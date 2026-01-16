import path from "path";

import dotenv from "dotenv";

import { entryPoint } from "@vertix.gg/mcp/src/entrypoint";

dotenv.config( { path: path.resolve( process.cwd(), "../../.env" ) } );

entryPoint();
