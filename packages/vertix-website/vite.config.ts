import { resolve } from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig( {
    plugins: [ react() ],
    resolve: {
        alias: {
            "@internal": resolve( __dirname, "./src" ),
            "@vertix": resolve( __dirname, "./src/vertix" ),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
                silenceDeprecations: [ "legacy-js-api" ],
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: "build",
    },
} );
