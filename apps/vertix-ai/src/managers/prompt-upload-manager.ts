import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { AIConfig } from "@vertix.gg/ai/src/config/ai-config";

type PendingUpload = {
    channelId: string;
    expiresAt: number;
};

/**
 * Tracks who has asked to replace a guild's prompt.
 *
 * Discord modals cannot carry file attachments, so an upload cannot be a
 * button-then-modal round trip. Instead the button arms a short window and the
 * message listener consumes the next file that person posts in that channel.
 */
export class PromptUploadManager extends InitializeBase {
    private static instance: PromptUploadManager;

    private readonly pending = new Map<string, PendingUpload>();

    public static getName() {
        return "VertixAI/Managers/PromptUpload";
    }

    public static getInstance(): PromptUploadManager {
        if ( !PromptUploadManager.instance ) {
            PromptUploadManager.instance = new PromptUploadManager();
        }

        return PromptUploadManager.instance;
    }

    public static get $() {
        return PromptUploadManager.getInstance();
    }

    public arm( guildId: string, userId: string, channelId: string ): number {
        const windowMs = AIConfig.$.getPromptUploadWindowMs();

        this.pending.set( this.getKey( guildId, userId ), {
            channelId,
            expiresAt: Date.now() + windowMs
        } );

        this.logger.debug( this.arm, `Armed upload for guildId: '${ guildId }' userId: '${ userId }'` );

        return windowMs;
    }

    /** Returns true only for the person who armed it, in the channel they armed it from. */
    public isArmed( guildId: string, userId: string, channelId: string ): boolean {
        const key = this.getKey( guildId, userId );
        const entry = this.pending.get( key );

        if ( !entry ) {
            return false;
        }

        if ( Date.now() > entry.expiresAt ) {
            this.pending.delete( key );

            return false;
        }

        return entry.channelId === channelId;
    }

    public disarm( guildId: string, userId: string ): void {
        this.pending.delete( this.getKey( guildId, userId ) );
    }

    private getKey( guildId: string, userId: string ): string {
        return `${ guildId }-${ userId }`;
    }
}

export default PromptUploadManager;
