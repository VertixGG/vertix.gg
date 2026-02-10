import { join } from "path";

import { deploy } from "../../../scripts/base-deploy.js";

deploy( {
    envPrefix: "DASHBOARD_DEPLOY",
    appDir: join( import.meta.dirname, ".." ),
    buildCommand: "bun run vertix-dashboard:build",
} );
