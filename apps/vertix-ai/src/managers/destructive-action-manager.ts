import crypto from "crypto";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { PrismaAIClient } from "@vertix.gg/prisma/ai-client";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

import type { JsonObject } from "@vertix.gg/ai/src/definitions/ollama-definitions";

export type ProposedAction = {
    toolName: string;
    fingerprint: string;
    argsJson: string;
};

/**
 * Holds the destructive actions the model proposed, until the person agrees.
 *
 * Two things this has to get right, both learned the hard way:
 *
 * The model cannot resolve "yes" itself - with a channel's history replayed to
 * it, a "yes" meant for one thing gets attached to a request made an hour ago.
 * So agreement is bound to specific calls, not to the model's reading of it.
 *
 * And a request is often several calls: "delete every channel except welcome"
 * is ten. Keying one action per person meant each call overwrote the last, so a
 * confirmation could only ever release one of them and the bot fell into asking
 * channel by channel. Proposals from one turn are therefore kept together.
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
     * Records one proposed call.
     *
     * Calls sharing a `turnId` accumulate into the same batch; a different turn
     * replaces the batch, so an abandoned proposal never lingers to be confirmed
     * by accident later.
     */
    public async propose(
        guildId: string,
        userId: string,
        turnId: string,
        toolName: string,
        args: JsonObject
    ): Promise<void> {
        const existing = await this.findFresh( guildId, userId );

        const action: ProposedAction = {
            toolName,
            fingerprint: this.fingerprint( args ),
            argsJson: JSON.stringify( args )
        };

        const actions = existing && existing.turnId === turnId
            ? [ ...this.parseActions( existing.actionsJson ), action ]
            : [ action ];

        const data = {
            guildId,
            userId,
            turnId,
            actionsJson: JSON.stringify( actions ),
            expiresAt: new Date( Date.now() + AIConfig.$.getDestructiveConfirmWindowMs() )
        };

        await PrismaAIClient.$.getClient().aIPendingAction.upsert( {
            where: { guildId_userId: { guildId, userId } },
            create: data,
            update: data
        } );

        this.logger.log(
            this.propose,
            `Proposed '${ toolName }' to user '${ userId }' in '${ guildId }' (${ actions.length } in this batch)`
        );
    }

    /** Every action awaiting agreement, or an empty list. */
    public async getPending( guildId: string, userId: string ): Promise<ProposedAction[]> {
        const entry = await this.findFresh( guildId, userId );

        return entry ? this.parseActions( entry.actionsJson ) : [];
    }

    /**
     * Releases the whole batch. Single-use, so one agreement can never authorise
     * a second round.
     */
    public async consumeAll( guildId: string, userId: string ): Promise<ProposedAction[]> {
        const actions = await this.getPending( guildId, userId );

        if ( !actions.length ) {
            return [];
        }

        await this.clear( guildId, userId );

        this.logger.log( this.consumeAll, `Approved '${ actions.length }' action(s) for user '${ userId }'` );

        return actions;
    }

    /**
     * True when this exact call is in the pending batch.
     *
     * Removes only the matched action and keeps the rest queued. Clearing the
     * whole batch here meant that when the model made all thirteen approved
     * calls in one turn, the first consumed the queue and the other twelve
     * found nothing pending - so they were re-proposed and the bot asked again,
     * deleting one channel per round indefinitely.
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

        const actions = this.parseActions( entry.actionsJson );

        const fingerprint = this.fingerprint( args );

        const index = actions.findIndex(
            ( action ) => action.toolName === toolName && action.fingerprint === fingerprint
        );

        if ( -1 === index ) {
            return false;
        }

        const remaining = actions.filter( ( _action, position ) => position !== index );

        if ( remaining.length ) {
            await PrismaAIClient.$.getClient().aIPendingAction.update( {
                where: { guildId_userId: { guildId, userId } },
                data: { actionsJson: JSON.stringify( remaining ) }
            } );
        } else {
            await this.clear( guildId, userId );
        }

        this.logger.log(
            this.consumeApproval,
            `Approved '${ toolName }' for user '${ userId }' ('${ remaining.length }' still queued)`
        );

        return true;
    }

    public async clear( guildId: string, userId: string ): Promise<void> {
        await PrismaAIClient.$.getClient().aIPendingAction.deleteMany( { where: { guildId, userId } } );
    }

    /**
     * Expired rows are deleted on read rather than swept - there are never many.
     *
     * A read failure is swallowed on purpose. MongoDB does not rewrite documents
     * when the schema changes, so a row written under an older shape makes the
     * typed client throw - and this is on the path of every single message, so
     * that turned one stale row into a bot that could not reply at all. Losing a
     * pending confirmation is recoverable; losing the bot is not.
     */
    private async findFresh( guildId: string, userId: string ) {
        const entry = await PrismaAIClient.$.getClient().aIPendingAction
            .findUnique( { where: { guildId_userId: { guildId, userId } } } )
            .catch( async( error: unknown ) => {
                this.logger.error( this.findFresh, "Could not read the pending action; discarding it", error );

                await this.clear( guildId, userId ).catch( () => undefined );

                return null;
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

    private parseActions( actionsJson: string ): ProposedAction[] {
        try {
            const parsed: unknown = JSON.parse( actionsJson );

            return Array.isArray( parsed ) ? parsed as ProposedAction[] : [];
        } catch {
            return [];
        }
    }

    private fingerprint( args: JsonObject ): string {
        // Key order varies between model turns; sort so the same call matches.
        const stable = JSON.stringify( args, Object.keys( args ).sort() );

        return crypto.createHash( "sha256" ).update( stable ).digest( "hex" );
    }
}

export default DestructiveActionManager;
