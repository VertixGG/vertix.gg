# Vertix Flow

This package contains the API server and frontend UI for Vertix Flow.

## Servers

The package includes two server implementations:

### Original Fastify Server
The original server is based on Fastify and can be started with:

```bash
# Using Bun
bun run vertix-flow:dev

# Using npm/tsx
npm run vertix-flow:tsx
```

### Next.js API Server (with HMR)
A migrated version of the server using Next.js API routes that provides Hot Module Replacement for API routes:

```bash
# Development with HMR for API routes
bun run vertix-flow:nextjs:dev

# Build for production
bun run vertix-flow:nextjs:build

# Run in production
bun run vertix-flow:nextjs:start
```

## Available API Endpoints

Both server implementations provide the same API endpoints:

- `/api/health` - Health check endpoint
- `/api/ui-modules` - Get all available UI modules
- `/api/ui-flows` - Get flow data for a specific UI module and flow

## Migrating from Fastify to Next.js

The Next.js API routes implementation provides Hot Module Replacement for development, allowing changes to API routes to be instantly reflected without server restarts.

The API routes are located in `nextjs-server/pages/api/` and follow Next.js conventions for API routes.
