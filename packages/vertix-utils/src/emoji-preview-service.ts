import { REST } from "discord.js";
import { Routes } from "discord-api-types/v10";

import { setEmojiPreviewCache } from "@vertix.gg/utils/src/emoji-preview-cache";

import type { EmojiPreviewEntry } from "@vertix.gg/utils/src/emoji-preview-cache";

import type { APIApplication } from "discord-api-types/v10";
import type { RESTGetAPIApplicationEmojisResult } from "discord-api-types/v9";

const CACHE_TTL_MS = 15 * 60 * 1000;

class EmojiPreviewService {
    private cachePromise: Promise<void> | null = null;
    private cachedAt = 0;
    private cache: Record<string, EmojiPreviewEntry> | null = null;

    /**
     * Function ensureCache() :: The application's emoji, refetched once the held copy is stale.
     *
     * This used to latch on the first success and never look again, so an emoji uploaded after
     * the process started stayed invisible to it until someone restarted - which is how a button
     * could ship with artwork nobody could see. A window rather than a fetch per call: the list
     * changes when a release adds a button, not between two page loads.
     */
    public async ensureCache() {
        if ( this.cache && Date.now() - this.cachedAt < CACHE_TTL_MS ) {
            return;
        }

        if ( !this.cachePromise ) {
            this.cachePromise = this.fetchAndCache()
                .catch( ( error ) => {
                    console.error( "[EmojiPreviewService] Failed to fetch emojis:", error );
                } )
                .finally( () => {
                    this.cachePromise = null;
                } );
        }

        await this.cachePromise;
    }

    public getCacheSnapshot() {
        return this.cache ? { ...this.cache } : null;
    }

    private async fetchAndCache() {
        // These are APPLICATION emojis - the artwork the main bot's buttons are drawn with - so
        // the token has to belong to that application or the fetch succeeds against the wrong one
        // and comes back empty. `DISCORD_MCP_TOKEN` is whatever bot vertix-mcp was told to act as,
        // commonly the AI Chat bot, so it sits last: a fallback for a single-bot setup rather than
        // a preference. Reading it first is what silently emptied the button sheet.
        const token = process.env.FLOW_EMOJI_TOKEN
            ?? process.env.DISCORD_BOT_TOKEN
            ?? process.env.DISCORD_TOKEN
            ?? process.env.DISCORD_MCP_TOKEN;

        if ( !token ) {
            console.warn( "[EmojiPreviewService] Missing FLOW_EMOJI_TOKEN/DISCORD_BOT_TOKEN/DISCORD_TOKEN/DISCORD_MCP_TOKEN; previews will use placeholders." );
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
            this.cachedAt = Date.now();
            setEmojiPreviewCache( cache );
            console.info( `[EmojiPreviewService] Cached ${ Object.keys( cache ).length } emojis for previews.` );
        } else {
            console.warn( "[EmojiPreviewService] No emojis fetched for previews." );
        }
    }
}

export const emojiPreviewService = new EmojiPreviewService();

