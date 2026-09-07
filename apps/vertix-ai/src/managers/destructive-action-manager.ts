import crypto from "crypto";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { PrismaAIClient } from "@vertix.gg/prisma/ai-client";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import type { JsonObject } from "@vertix.gg/ai/src/definitions/ollama-definitions";

export type PendingAction = {
    toolName: string;
    argsJson: string;
};

/**
 * Holds a destructive action between the model proposing it and the person
 * agreeing to it.
 *
 * The model cannot be trusted to resolve "yes" itself: with a channel's history
 * replayed to it, a "yes" meant for one thing gets matched to a different
 * request made an hour earlier. This binds a confirmation to one exact tool
 * call - same tool, same arguments - proposed to the same person, within a
 * short window.
 *
 * Stored in the database, not in memory: a restart between the proposal and the
 * answer would otherwise drop the approval silently, and the person would just
 * see their confirmation ignored.
 */
export class DestructiveActionManager extends InitializeBase {
    private static instance: DestructiveActionManager;

    public static getName() {
        return "VertixAI/Managers/DestructiveAction";
    }

    public static getInstance(): DestructiveActionManager {
        if ( !DestructiveActionManager.instance ) {
            DestructiveActionManager.instance = new DestructiveActionManager();
        }

        return DestructiveActionManager.instance;
    }

    public static get $() {
        return DestructiveActionManager.getInstance();
    }

    /**
     * Returns true only when this exact call was proposed to this person and is
     * still within the window. Consumes the approval, so one confirmation can
     * never authorise two executions.
     */
    public async consumeApproval(
        guildId: string,
        userId: string,
        toolName: string,
        args: JsonObject
    ): Promise<boolean> {
        const entry = await this.findFresh( guildId, userId );

        if ( !entry ) {
            return false;
        }

        if ( entry.toolName !== toolName || entry.fingerprint !== this.fingerprint( args ) ) {
            return false;
        }

        await this.clear( guildId, userId );

        this.logger.log( this.consumeApproval, `Approved '${ toolName }' for user '${ userId }' in '${ guildId }'` );

        return true;
    }

    /** Records what the model wants to do, replacing any earlier proposal. */
    public async propose( guildId: string, userId: string, toolName: string, args: JsonObject ): Promise<string> {
        const argsJson = JSON.stringify( args );

        const data = {
            guildId,
            userId,
            toolName,
            fingerprint: this.fingerprint( args ),
            argsJson,
            expiresAt: new Date( Date.now() + AIConfig.$.getDestructiveConfirmWindowMs() )
        };

        await PrismaAIClient.$.getClient().aIPendingAction.upsert( {
            where: { guildId_userId: { guildId, userId } },
            create: data,
            update: data
        } );

        this.logger.log( this.propose, `Proposed '${ toolName }' to user '${ userId }' in '${ guildId }'` );

        return `${ toolName } with ${ argsJson }`;
    }

    /** The live proposal for this person, if one is still open. */
    public async getPending( guildId: string, userId: string ): Promise<PendingAction | null> {
        const entry = await this.findFresh( guildId, userId );

        return entry ? { toolName: entry.toolName, argsJson: entry.argsJson } : null;
    }

    public async clear( guildId: string, userId: string ): Promise<void> {
        await PrismaAIClient.$.getClient().aIPendingAction.deleteMany( { where: { guildId, userId } } );
    }

    /** Expired rows are deleted on read rather than swept - there are never many. */
    private async findFresh( guildId: string, userId: string ) {
        const entry = await PrismaAIClient.$.getClient().aIPendingAction.findUnique( {
            where: { guildId_userId: { guildId, userId } }
        } );

        if ( !entry ) {
            return null;
        }

        if ( entry.expiresAt.getTime() < Date.now() ) {
            await this.clear( guildId, userId );

            return null;
        }

        return entry;
    }

    private fingerprint( args: JsonObject ): string {
        // Key order varies between model turns; sort so the same call matches.
        const stable = JSON.stringify( args, Object.keys( args ).sort() );

        return crypto.createHash( "sha256" ).update( stable ).digest( "hex" );
    }
}

export default DestructiveActionManager;
