import path from "path";

import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig( ( { mode } ) => {
    const rootEnv = loadEnv( mode, path.resolve( __dirname, "../.." ), "" );
    const localEnv = loadEnv( mode, process.cwd(), "" );
    const env = { ...rootEnv, ...localEnv, ...process.env };

    const apiPort = env.FLOW_API_PORT || "3021";
    const apiHost = env.FLOW_API_HOST || "0.0.0.0";

    const frontendPort = env.FLOW_FRONTEND_PORT || "3020";
    const frontendHost = env.FLOW_FRONTEND_HOST || "0.0.0.0";

    console.log( `[Vite Config] Proxy target: http://${ apiHost }:${ apiPort }` );
    console.log( `[Vite Config] PORT: ${ frontendPort }, HOST: ${ frontendHost }` );

    return {
        plugins: [ react(), tailwindcss() ],
        resolve: {
            alias: {
                "@": path.resolve( __dirname, "./src" ),
            },
        },
        define: {
            "VITE_FLOW_API_PORT": JSON.stringify( apiPort ),
            "VITE_FLOW_API_HOST": JSON.stringify( apiHost ),
        },
        server: {
            host: frontendHost,
            port: frontendPort,
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
