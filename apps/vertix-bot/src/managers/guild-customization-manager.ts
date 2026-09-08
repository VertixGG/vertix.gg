import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { DEFAULT_CUSTOMIZATION_GUILD_ID } from "@vertix.gg/definitions/src/ui-customization-definitions";

import type {
    ComponentCustomization,
    CustomizationTarget,
    GuildCustomizationRow
} from "@vertix.gg/definitions/src/ui-customization-definitions";

const client = PrismaBotClient.$.getClient();

// Default cache TTL: 1 hour
const DEFAULT_CACHE_TTL = 60 * 60 * 1000;

interface CacheEntry {
    rows: GuildCustomizationRow[];
    expiresAt: number;
}

/**
 * The overrides a guild has stored, and the resolution of which of them apply to what is being
 * rendered.
 *
 * Each override is a row saying what it applies to - a component, optionally narrowed to a state
 * and a language - so nothing here parses a key apart to find out.
 */
export class GuildCustomizationManager extends InitializeBase {
    private static instance: GuildCustomizationManager;

    private cache: Map<string, CacheEntry> = new Map();

    private cacheTTL: number = DEFAULT_CACHE_TTL;

    public static getName(): string {
        return "VertixBot/Managers/GuildCustomization";
    }

    public static get $() {
        if ( !GuildCustomizationManager.instance ) {
            GuildCustomizationManager.instance = new GuildCustomizationManager();
        }

        return GuildCustomizationManager.instance;
    }

    public constructor() {
        super();

        // Start cache cleanup interval
        this.startCacheCleanup();
    }

    /**
     * Function getGuildCustomizations() :: Every override a guild holds.
     */
    public async getGuildCustomizations( guildId: string ): Promise<GuildCustomizationRow[]> {
        const cached = this.cache.get( guildId );

        if ( cached && cached.expiresAt > Date.now() ) {
            this.logger.debug( this.getGuildCustomizations, `Cache hit for guild: ${ guildId }` );

            return cached.rows;
        }

        this.logger.debug( this.getGuildCustomizations, `Cache miss, fetching from DB for guild: ${ guildId }` );

        try {
            const records = await client.guildCustomization.findMany( {
                where: { guildId }
            } );

            const rows = records.map( ( record ) => ( {
                guildId: record.guildId,
                component: record.component,
                state: record.state,
                language: record.language,
                embedOverrides: ( record.embedOverrides ?? undefined ) as GuildCustomizationRow[ "embedOverrides" ],
                elementOverrides: ( record.elementOverrides ?? undefined ) as GuildCustomizationRow[ "elementOverrides" ],
                modalOverrides: ( record.modalOverrides ?? undefined ) as GuildCustomizationRow[ "modalOverrides" ],
                variables: ( record.variables ?? undefined ) as GuildCustomizationRow[ "variables" ]
            } ) );

            // A guild with nothing stored is cached too, so an untouched guild does not query on
            // every render.
            this.cache.set( guildId, {
                rows,
                expiresAt: Date.now() + this.cacheTTL
            } );

            this.logger.debug( this.getGuildCustomizations, `Loaded customization for guild: ${ guildId }`, {
                rowCount: rows.length
            } );

            return rows;
        } catch( error ) {
            this.logger.error( this.getGuildCustomizations, `Error fetching customization for guild ${ guildId }:`, error );

            return [];
        }
    }

    /**
     * Function getComponentCustomization() :: What applies to one component, resolved.
     *
     * Everything that matches is merged, broadest first: the default guild under the guild's own,
     * a component-wide row under a state-specific one, a language-agnostic row under one written
     * for this language. So a colour set for the whole component survives a state that only
     * renames a button.
     */
    public async getComponentCustomization(
        guildId: string,
        target: CustomizationTarget
    ): Promise<ComponentCustomization | null> {
        this.logger.debug( this.getComponentCustomization, "Looking up component", { guildId, ...target } );

        const isDefaultGuild = DEFAULT_CUSTOMIZATION_GUILD_ID === guildId;

        const [ defaultRows, guildRows ] = await Promise.all( [
            this.getGuildCustomizations( DEFAULT_CUSTOMIZATION_GUILD_ID ),
            isDefaultGuild ? Promise.resolve( [] ) : this.getGuildCustomizations( guildId )
        ] );

        // Broadest first, so the more specific layers overwrite what they mean to.
        const applicable = [ ...defaultRows, ...guildRows ]
            .filter( ( row ) => row.component === target.component )
            .filter( ( row ) => !row.state || row.state === target.state )
            .filter( ( row ) => !row.language || row.language === target.language )
            .sort( ( a, b ) => this.specificity( a ) - this.specificity( b ) );

        if ( !applicable.length ) {
            this.logger.debug( this.getComponentCustomization, "No customization found", { guildId, ...target } );

            return null;
        }

        return applicable.reduce<ComponentCustomization>( ( merged, row ) => ( {
            embedOverrides: { ...merged.embedOverrides, ...row.embedOverrides },
            elementOverrides: { ...merged.elementOverrides, ...row.elementOverrides },
            modalOverrides: { ...merged.modalOverrides, ...row.modalOverrides },
            variables: { ...merged.variables, ...row.variables }
        } ), {} );
    }

    /**
     * Invalidate cache for a guild.
     * Call this when customizations are updated externally (e.g., from dashboard).
     */
    public invalidateCache( guildId: string ): void {
        this.cache.delete( guildId );
        this.logger.debug( this.invalidateCache, `Invalidated cache for guild: ${ guildId }` );
    }

    /**
     * Invalidate all cache entries.
     */
    public invalidateAllCache(): void {
        this.cache.clear();
        this.logger.debug( this.invalidateAllCache, "Invalidated all cache entries" );
    }

    /**
     * Set cache TTL in milliseconds.
     */
    public setCacheTTL( ttl: number ): void {
        this.cacheTTL = ttl;
    }

    /**
     * Get current cache size.
     */
    public getCacheSize(): number {
        return this.cache.size;
    }

    /**
     * Preload customization for a guild into cache.
     * Useful for warming up cache when bot joins a guild or on startup.
     */
    public async preloadGuild( guildId: string ): Promise<void> {
        await this.getGuildCustomizations( guildId );
    }

    /**
     * Function specificity() :: How narrowly a row applies, for ordering the merge.
     *
     * A row written for this guild outranks the default layer, a state outranks the whole
     * component, and a language outranks every language.
     */
    private specificity( row: GuildCustomizationRow ): number {
        let score = 0;

        if ( DEFAULT_CUSTOMIZATION_GUILD_ID !== row.guildId ) {
            score += 4;
        }

        if ( row.state ) {
            score += 2;
        }

        if ( row.language ) {
            score += 1;
        }

        return score;
    }

    /**
     * Start periodic cache cleanup to remove expired entries.
     */
    private startCacheCleanup(): void {
        // Clean up every minute
        setInterval( () => {
            const now = Date.now();
            let cleaned = 0;

            for ( const [ guildId, entry ] of this.cache.entries() ) {
                if ( entry.expiresAt < now ) {
                    this.cache.delete( guildId );
                    cleaned++;
                }
            }

            if ( cleaned > 0 ) {
                this.logger.debug( this.startCacheCleanup, `Cleaned ${ cleaned } expired cache entries` );
            }
        }, 60 * 1000 );
    }
}

export default GuildCustomizationManager;
