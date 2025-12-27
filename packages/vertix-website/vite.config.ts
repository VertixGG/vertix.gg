import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig( {
    plugins: [ react() ],
    resolve: {
        alias: {
            "@vertix.gg/website": path.resolve( __dirname, "./" ),
            "@": path.resolve( __dirname, "./src/vertix" ),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                // Ensure SASS variables are available globally if needed,
                // though explicit imports are preferred for modularity.
            }
        }
    }
} );
