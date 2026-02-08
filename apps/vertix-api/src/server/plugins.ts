/**
 * Fastify plugin registration module.
 *
 * Centralizes @fastify/cors, @fastify/cookie, and @fastify/session registration.
 *
 * In this workspace, `@zenflux/cli → verdaccio → @verdaccio/server-fastify` ships
 * `fastify@4` as a dependency. On CI, bun may hoist that version so the
 * `@fastify/session` (and similar) type declarations reference `fastify@4` types
 * instead of `fastify@5` that this app actually uses. The type mismatch causes
 * `register()` calls to fail with:
 *
 *   FastifyInstance<..., FastifyTypeProvider> is missing properties from
 *   FastifyInstance<..., FastifyTypeProviderDefault>
 *
 * By isolating plugin registration here with `require()`, we avoid TypeScript
 * resolving the plugin's exported type declarations (which reference the wrong
 * fastify version) while still getting full type safety from our own local
 * `fastify-session.d.ts` augmentation.
 */

import type { FastifyInstance, SessionStore } from "fastify";

interface CorsConfig {
    origin: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
}

interface SessionConfig {
    secret: string;
    store: SessionStore;
    cookie: {
        secure: boolean;
        httpOnly: boolean;
        sameSite: "lax" | "strict" | "none";
        maxAge: number;
    };
    saveUninitialized: boolean;
}

interface PluginOptions {
    cors: CorsConfig;
    session: SessionConfig;
}

export async function registerFastifyPlugins( fastify: FastifyInstance, options: PluginOptions ): Promise<void> {
    // Using require() to bypass the TypeScript type declarations that may resolve
    // against the wrong fastify version. The runtime behavior is identical.
    const cors = require( "@fastify/cors" );
    const cookie = require( "@fastify/cookie" );
    const session = require( "@fastify/session" );

    await fastify.register( cors, options.cors );
    await fastify.register( cookie );
    await fastify.register( session, options.session );
}
