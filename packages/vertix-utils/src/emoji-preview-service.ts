import { REST } from "discord.js";
import { Routes } from "discord-api-types/v10";

import { setEmojiPreviewCache } from "@vertix.gg/utils/src/emoji-preview-cache";

import type { EmojiPreviewEntry } from "@vertix.gg/utils/src/emoji-preview-cache";

import type { APIApplication } from "discord-api-types/v10";
import type { RESTGetAPIApplicationEmojisResult } from "discord-api-types/v9";

class EmojiPreviewService {
    private cachePromise: Promise<void> | null = null;
    private isReady = false;
    private cache: Record<string, EmojiPreviewEntry> | null = null;

    public async ensureCache() {
        if ( this.isReady ) {
            return;
        }

        if ( !this.cachePromise ) {
            this.cachePromise = this.fetchAndCache().catch( ( error ) => {
                console.error( "[EmojiPreviewService] Failed to fetch emojis:", error );
            } );
        }

        await this.cachePromise;
    }

    public getCacheSnapshot() {
        return this.cache ? { ...this.cache } : null;
    }

    private async fetchAndCache() {
        const token = process.env.FLOW_EMOJI_TOKEN ?? process.env.DISCORD_TEST_TOKEN;

        if ( !token ) {
            console.warn( "[EmojiPreviewService] Missing FLOW_EMOJI_TOKEN/DISCORD_TEST_TOKEN; previews will use placeholders." );
            return;
        }

        const rest = new REST( { version: "10" } ).setToken( token );

        const application = await rest.get( Routes.oauth2CurrentApplication() ) as APIApplication;
        const emojis = await rest.get( Routes.applicationEmojis( application.id ) ) as RESTGetAPIApplicationEmojisResult;

        const cache: Record<string, EmojiPreviewEntry> = {};

        emojis?.items?.forEach( ( emoji ) => {
            if ( emoji.name && emoji.id ) {
                const markdown = `<:${ emoji.name }:${ emoji.id }>`;
                const extension = emoji.animated ? "gif" : "webp";
                const url = `https://cdn.discordapp.com/emojis/${ emoji.id }.${ extension }?size=96&quality=lossless`;

                cache[ emoji.name ] = { markdown, url };
            }
        } );

        if ( Object.keys( cache ).length ) {
            this.cache = cache;
            setEmojiPreviewCache( cache );
            this.isReady = true;
            console.info( `[EmojiPreviewService] Cached ${ Object.keys( cache ).length } emojis for previews.` );
        } else {
            console.warn( "[EmojiPreviewService] No emojis fetched for previews." );
        }
    }
}

export const emojiPreviewService = new EmojiPreviewService();

