import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import type { ComponentCustomization, GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

const client = PrismaBotClient.$.getClient();

// Default cache TTL: 1 hour
const DEFAULT_CACHE_TTL = 60 * 60 * 1000;

interface CacheEntry {
    data: GuildCustomizationData;
    expiresAt: number;
}

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
     * Get all customizations for a guild.
     * Uses cache if available and not expired.
     */
    public async getGuildCustomization( guildId: string ): Promise<GuildCustomizationData | null> {
        // Check cache first
        const cached = this.cache.get( guildId );

        if ( cached && cached.expiresAt > Date.now() ) {
            this.logger.debug( this.getGuildCustomization, `Cache hit for guild: ${ guildId }` );
            return cached.data;
        }

        // Fetch from database
        this.logger.debug( this.getGuildCustomization, `Cache miss, fetching from DB for guild: ${ guildId }` );

        try {
            const customization = await client.guildCustomization.findUnique( {
                where: { guildId }
            } );

            if ( !customization ) {
                // Cache negative result too
                this.cache.set( guildId, {
                    data: { guildId, components: {} },
                    expiresAt: Date.now() + this.cacheTTL
                } );
                return null;
            }

            const data: GuildCustomizationData = {
                guildId: customization.guildId,
                components: ( customization.components as Record<string, ComponentCustomization> ) || {}
            };

            // Store in cache
            this.cache.set( guildId, {
                data,
                expiresAt: Date.now() + this.cacheTTL
            } );

            this.logger.debug( this.getGuildCustomization, `Loaded customization for guild: ${ guildId }`, {
                componentCount: Object.keys( data.components ).length
            } );

            return data;
        } catch ( error ) {
            this.logger.error( this.getGuildCustomization, `Error fetching customization for guild ${ guildId }:`, error );
            return null;
        }
    }

    /**
     * Get customization for a specific component/state.
     * Always fetches __default__ customization as base, then merges guild-specific on top.
     * @param guildId - The guild ID
     * @param customizationKey - The component/state key (e.g., "ComponentName/StateKey")
     */
    public async getComponentCustomization(
        guildId: string,
        customizationKey: string
    ): Promise<ComponentCustomization | null> {
        this.logger.debug( this.getComponentCustomization, `Looking up component`, { guildId, customizationKey } );

        // For __default__ guildId, just return the default directly
        if ( guildId === "__default__" ) {
            const defaultData = await this.getGuildCustomization( "__default__" );
            return defaultData?.components?.[ customizationKey ] || null;
        }

        // Fetch both default and guild-specific in parallel
        const [ defaultData, guildData ] = await Promise.all( [
            this.getGuildCustomization( "__default__" ),
            this.getGuildCustomization( guildId )
        ] );

        const defaultResult = defaultData?.components?.[ customizationKey ] || null;
        const guildResult = guildData?.components?.[ customizationKey ] || null;

        // No customization at all
        if ( !defaultResult && !guildResult ) {
            this.logger.debug( this.getComponentCustomization, `No customization found`, { guildId, customizationKey } );
            return null;
        }

        // Only default exists
        if ( !guildResult ) {
            this.logger.debug( this.getComponentCustomization, `Using default customization`, { customizationKey } );
            return defaultResult;
        }

        // Only guild-specific exists
        if ( !defaultResult ) {
            this.logger.debug( this.getComponentCustomization, `Using guild-specific customization`, { customizationKey, guildId } );
            return guildResult;
        }

        // Merge: default as base, guild-specific on top
        this.logger.debug( this.getComponentCustomization, `Merging default + guild customization`, { customizationKey, guildId } );

        return {
            embedOverrides: {
                ...defaultResult.embedOverrides,
                ...guildResult.embedOverrides
            },
            variables: {
                ...defaultResult.variables,
                ...guildResult.variables
            }
        };
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
        await this.getGuildCustomization( guildId );
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
