import { PrismaAPIClient } from "@vertix.gg/prisma/api-client";

import type { SessionStore } from "@fastify/session";
import type { Session } from "fastify";

export class PrismaSessionStore implements SessionStore {
    private getClient() {
        return PrismaAPIClient.$.getClient();
    }

    public get( sessionId: string, callback: ( err: Error | null, session?: Session | null ) => void ): void {
        this.getClient().session.findUnique( {
            where: { sid: sessionId }
        } ).then( ( session ) => {
            if ( !session ) {
                callback( null, null );
                return;
            }

            if ( session.expiresAt < new Date() ) {
                this.getClient().session.delete( {
                    where: { sid: sessionId }
                } ).then( () => {
                    callback( null, null );
                } ).catch( ( error ) => {
                    callback( error instanceof Error ? error : new Error( String( error ) ) );
                } );
                return;
            }

            const data = JSON.parse( session.data ) as unknown as Session;
            callback( null, data );
        } ).catch( ( error ) => {
            callback( error instanceof Error ? error : new Error( String( error ) ) );
        } );
    }

    public set( sessionId: string, session: Session, callback: ( err?: Error ) => void ): void {
        const maxAge = ( session.cookie as { maxAge?: number } | undefined )?.maxAge || 7 * 24 * 60 * 60 * 1000;
        const expiresAt = new Date( Date.now() + maxAge );

        this.getClient().session.upsert( {
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
        } ).then( () => {
            callback();
        } ).catch( ( error ) => {
            callback( error instanceof Error ? error : new Error( String( error ) ) );
        } );
    }

    public destroy( sessionId: string, callback: ( err?: Error ) => void ): void {
        this.getClient().session.deleteMany( {
            where: { sid: sessionId }
        } ).then( () => {
            callback();
        } ).catch( ( error ) => {
            callback( error instanceof Error ? error : new Error( String( error ) ) );
        } );
    }
}
