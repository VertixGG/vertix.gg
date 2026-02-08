/**
 * Local session type augmentation for Fastify v5.
 *
 * `@fastify/session` ships its type augmentation against its own resolved `fastify`
 * dependency. In workspaces with multiple `fastify` versions (e.g. verdaccio pulls v4),
 * TypeScript may resolve the wrong `fastify` on CI, causing the `Session` /
 * `SessionStore` types to mismatch. By declaring the augmentation locally, we guarantee
 * it targets the `fastify` version actually used by this application.
 */

import type { CookieSerializeOptions } from "@fastify/cookie";

declare module "fastify" {

    interface Session {
        /** The cookie properties */
        cookie: {
            originalMaxAge: number | null;
            maxAge?: number;
            signed?: boolean;
            expires?: Date | null;
            httpOnly?: boolean;
            path?: string;
            domain?: string;
            secure?: boolean | "auto";
            sameSite?: boolean | "lax" | "strict" | "none";
        };
    }

    interface FastifySessionObject extends Session {
        sessionId: string;
        encryptedSessionId: string;

        touch(): void;

        regenerate( callback: ( err?: Error ) => void ): void;
        regenerate( ignoreFields: string[], callback: ( err?: Error ) => void ): void;
        regenerate(): Promise<void>;
        regenerate( ignoreFields: string[] ): Promise<void>;

        options( opts: Partial<CookieOptions> ): void;

        destroy( callback: ( err?: Error ) => void ): void;
        destroy(): Promise<void>;

        reload( callback: ( err?: Error ) => void ): void;
        reload(): Promise<void>;

        save( callback: ( err?: Error ) => void ): void;
        save(): Promise<void>;

        set<K extends keyof Session>( key: K, value: Session[ K ] ): void;
        get<K extends keyof Session>( key: K ): Session[ K ] | undefined;

        isModified(): boolean;
        isSaved(): boolean;
    }

    interface CookieOptions extends Omit<CookieSerializeOptions, "signed" | "maxAge"> {
        maxAge?: number;
    }

    interface FastifyRequest {
        session: FastifySessionObject;
        sessionStore: Readonly<SessionStore>;
    }

    interface FastifyInstance {
        decryptSession<Request extends Record<string, unknown> = FastifyRequest>(
            sessionId: string,
            request: Request,
            cookieOpts: CookieOptions,
            callback: ( err?: Error ) => void
        ): void;
        decryptSession<Request extends Record<string, unknown> = FastifyRequest>(
            sessionId: string,
            request: Request,
            callback: ( err?: Error ) => void
        ): void;
    }

    interface SessionStore {
        set(
            sessionId: string,
            session: Session,
            callback: ( err?: Error ) => void
        ): void;
        get(
            sessionId: string,
            callback: ( err: Error | null, result?: Session | null ) => void
        ): void;
        destroy(
            sessionId: string,
            callback: ( err?: Error ) => void
        ): void;
    }
}

export {};
