import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@internal': resolve(__dirname, './src'),
      '@vertix': resolve(__dirname, './src/vertix'),
    },
  },
  css: {},
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
})
