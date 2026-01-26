import { PrismaAPIClient } from "@vertix.gg/prisma/api-client";

import type { SessionStore } from "@fastify/session";

interface SessionData {
    [ key: string ]: unknown;
}

export class PrismaSessionStore implements SessionStore {
    private getClient() {
        return PrismaAPIClient.$.getClient();
    }

    async get( sessionId: string, callback: ( err: Error | null, session?: SessionData | null ) => void ): Promise<void> {
        try {
            const session = await this.getClient().session.findUnique( {
                where: { sid: sessionId }
            } );

            if ( !session ) {
                callback( null, null );
                return;
            }

            if ( session.expiresAt < new Date() ) {
                await this.getClient().session.delete( {
                    where: { sid: sessionId }
                } );
                callback( null, null );
                return;
            }

            const data = JSON.parse( session.data ) as SessionData;
            callback( null, data );
        } catch( error ) {
            callback( error instanceof Error ? error : new Error( String( error ) ) );
        }
    }

    async set( sessionId: string, session: SessionData, callback: ( err?: Error ) => void ): Promise<void> {
        try {
            const expiresAt = new Date( Date.now() + ( ( session.cookie as { maxAge?: number } )?.maxAge || 7 * 24 * 60 * 60 * 1000 ) );

            await this.getClient().session.upsert( {
                where: { sid: sessionId },
                update: {
                    data: JSON.stringify( session ),
                    expiresAt
                },
                create: {
                    id: crypto.randomUUID(),
                    sid: sessionId,
                    data: JSON.stringify( session ),
                    expiresAt
                }
            } );

            callback();
        } catch( error ) {
            callback( error instanceof Error ? error : new Error( String( error ) ) );
        }
    }

    async destroy( sessionId: string, callback: ( err?: Error ) => void ): Promise<void> {
        try {
            await this.getClient().session.deleteMany( {
                where: { sid: sessionId }
            } );

            callback();
        } catch( error ) {
            callback( error instanceof Error ? error : new Error( String( error ) ) );
        }
    }
}
