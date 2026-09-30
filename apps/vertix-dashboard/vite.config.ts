import path from "path";

import fs from "node:fs/promises";
import { createReadStream } from "node:fs";

import { createRequire } from "module";

import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

import type { Plugin } from "vite";

const require = createRequire( import.meta.url );

/** Where `@vertix.gg/discord-ui` reads the bot's screens from - its own fixed address. */
const UI_COMPONENTS_URL_PATH = "/exports/ui/components.json";

/**
 * Serves the bot's exported screens at the address the Discord previews read them from, and puts
 * them beside the build.
 *
 * Only the one file the previews read: the Events page draws the board the bot posts, from the same
 * export the website draws its guides from. Built into `dist/` so the deploy's rsync carries it - a
 * dashboard deployed from a commit shows that commit's screens.
 */
function uiComponentsPlugin(): Plugin {
    const sourcePath = path.resolve( __dirname, "../../exports/ui/components.json" );

    let outDir = "";

    return {
        name: "vertix:dashboard-ui-components",
        configResolved( config ) {
            outDir = path.resolve( config.root, config.build.outDir );
        },
        configureServer( server ) {
            server.middlewares.use( UI_COMPONENTS_URL_PATH, ( _request, response ) => {
                response.setHeader( "Content-Type", "application/json; charset=utf-8" );
                response.setHeader( "Cache-Control", "no-cache" );

                createReadStream( sourcePath ).pipe( response );
            } );
        },
        async closeBundle() {
            const targetPath = path.join( outDir, UI_COMPONENTS_URL_PATH );

            await fs.mkdir( path.dirname( targetPath ), { recursive: true } );
            await fs.copyFile( sourcePath, targetPath );
        }
    };
}

export default defineConfig( ( { mode } ) => {
    const rootEnv = loadEnv( mode, path.resolve( __dirname, "../.." ), "" );
    const localEnv = loadEnv( mode, process.cwd(), "" );
    const env = { ...rootEnv, ...localEnv, ...process.env };

    const apiPort = env.API_PORT || "3021";
    const apiHost = env.API_HOST || "0.0.0.0";
    const apiBaseUrl = env.API_PUBLIC_URL || `http://${ apiHost }:${ apiPort }/api`;

    const frontendPort = env.DASHBOARD_PORT || "3020";
    const frontendHost = env.DASHBOARD_HOST || "0.0.0.0";

    console.log( `[Vite Config] Proxy target: http://${ apiHost }:${ apiPort }` );
    console.log( `[Vite Config] PORT: ${ frontendPort }, HOST: ${ frontendHost }` );

    const workspaceRoot = path.resolve( __dirname, "../.." );

    const resolveWorkspaceDependency = ( dependency: string ) => {
        const resolved = require.resolve( dependency, { paths: [ __dirname, workspaceRoot ] } );

        if ( dependency === "react" || dependency === "react-dom" ) {
            return path.dirname( resolved );
        }

        return resolved;
    };

    return {
        plugins: [ react(), tailwindcss(), uiComponentsPlugin() ],
        resolve: {
            alias: [
                {
                    find: "react",
                    replacement: resolveWorkspaceDependency( "react" ),
                },
                {
                    find: "react-dom",
                    replacement: resolveWorkspaceDependency( "react-dom" ),
                },
                {
                    find: "react/jsx-runtime",
                    replacement: resolveWorkspaceDependency( "react/jsx-runtime" ),
                },
                {
                    find: "react/jsx-dev-runtime",
                    replacement: resolveWorkspaceDependency( "react/jsx-dev-runtime" ),
                },
                {
                    find: /^eventemitter3$/,
                    replacement: require.resolve( "eventemitter3" ).replace( /index\.js$/, "index.mjs" ),
                },
            ],
        },
        optimizeDeps: {
            include: [
                "@zenflux/react-commander",
                "@xyflow/react",
                "eventemitter3",
                // `@zenflux/core` ships raw `src`, and its deep subpaths are served unbundled,
                // so its CommonJS `picocolors` needs prebundling to get an ESM default export.
                "picocolors"
            ],
            exclude: [
            ]
        },
        define: {
            "import.meta.env.API_PUBLIC_URL": JSON.stringify( apiBaseUrl ),

            // Paddle's own public configuration. The client token is meant to be in the page - it is
            // what their script authenticates with - and the price ids are not secret either; the
            // api key, which is, never comes near this bundle.
            "import.meta.env.PADDLE_CLIENT_TOKEN": JSON.stringify( env.PADDLE_CLIENT_TOKEN || "" ),
            "import.meta.env.PADDLE_ENVIRONMENT": JSON.stringify( env.PADDLE_ENVIRONMENT || "sandbox" ),
            "import.meta.env.PADDLE_PRICE_PRO": JSON.stringify( env.PADDLE_PRICE_PRO || "" ),

            // The api's install callback - empty keeps the invite the plain one and counts nothing.
            "import.meta.env.INSTALL_CALLBACK_URL": JSON.stringify( env.INSTALL_CALLBACK_URL || "" ),
            "VITE_API_PORT": JSON.stringify( apiPort ),
            "VITE_API_HOST": JSON.stringify( apiHost ),
            "__ZENFLUX_DEBUG__": JSON.stringify( true ),
            "process.env.LOGGER_LOG_LEVEL": JSON.stringify( 6 ),
            "process.env.NODE_ENV": JSON.stringify( mode ),
            "process.env": JSON.stringify( {} ),
            "process": JSON.stringify( { env: {} } ),
        },
        server: {
            host: frontendHost,
            port: Number( frontendPort ),
            strictPort: true,
            proxy: {
                "/api": {
                    target: `http://${ apiHost }:${ apiPort }`,
                    changeOrigin: true,
                },
            },
        },
    };
} );
