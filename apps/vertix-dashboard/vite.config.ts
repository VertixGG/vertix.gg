import path from "path";

import { createRequire } from "module";

import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

const require = createRequire( import.meta.url );

export default defineConfig( ( { mode } ) => {
    const rootEnv = loadEnv( mode, path.resolve( __dirname, "../.." ), "" );
    const localEnv = loadEnv( mode, process.cwd(), "" );
    const env = { ...rootEnv, ...localEnv, ...process.env };

    const isProd = mode === "production";

    const apiPort = env.API_PORT || "3021";
    const apiHost = env.API_HOST || "0.0.0.0";
    const prodHost = env.API_HOST_PROD || `http://${ apiHost }:${ apiPort }`;
    const apiBaseUrl = `${ prodHost }/api`;

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
        plugins: [ react(), tailwindcss() ],
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
                "eventemitter3"
            ],
            exclude: [
            ]
        },
        define: {
            "import.meta.env.VITE_API_BASE_URL": JSON.stringify( apiBaseUrl ),
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
