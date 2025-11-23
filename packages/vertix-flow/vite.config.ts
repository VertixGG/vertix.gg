import path from "path";

import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig( ( { mode } ) => {
    const rootEnv = loadEnv( mode, path.resolve( __dirname, "../.." ), "" );
    const localEnv = loadEnv( mode, process.cwd(), "" );
    const env = { ...rootEnv, ...localEnv, ...process.env };

    const apiPort = env.PORT || "3000";
    const apiHost = env.HOST === "0.0.0.0" ? "localhost" : ( env.HOST || "localhost" );

    console.log( `[Vite Config] Proxy target: http://${ apiHost }:${ apiPort }` );
    console.log( `[Vite Config] PORT: ${ apiPort }, HOST: ${ apiHost }` );

    return {
        plugins: [ react(), tailwindcss() ],
        resolve: {
            alias: {
                "@": path.resolve( __dirname, "./src" ),
            },
        },
        server: {
            host: "0.0.0.0",
            port: 5173,
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
