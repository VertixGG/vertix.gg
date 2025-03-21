import { resolve } from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig( {
  plugins: [ react() ],
  resolve: {
    alias: {
      "@": resolve( __dirname, "src" )
    }
  },
  server: {
    port: 3000,
    open: true
  }
} );
