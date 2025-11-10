import path from "path";

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig( {
    plugins: [ react(), tailwindcss() ],
    resolve: {
        alias: {
            "@": path.resolve( __dirname, "./src" ),
        },
    },
    server: {
        host: "0.0.0.0", // Expose to all network interfaces
        port: 5173,
        strictPort: true, // Fail if port is already in use
        proxy: {
            // Proxy API requests to the Fastify server
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
} );
