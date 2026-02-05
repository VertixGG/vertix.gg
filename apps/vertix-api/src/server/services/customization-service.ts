import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import type { ComponentCustomization, GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

export type { EmbedOverrides, ComponentCustomization, GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

export const DEFAULT_GUILD_ID = "__default__";

const client = PrismaBotClient.$.getClient();

/**
 * Fetch raw customization record from DB (no merging).
 */
async function fetchRawCustomization( guildId: string ): Promise<GuildCustomizationData | null> {
    const customization = await client.guildCustomization.findUnique( {
        where: { guildId }
    } );

    if ( !customization ) {
        return null;
    }

    return {
        guildId: customization.guildId,
        components: customization.components as Record<string, ComponentCustomization>,
        createdAt: customization.createdAt,
        updatedAt: customization.updatedAt
    };
}

/**
 * Get all customizations for a guild.
 * For regular guilds, merges __default__ customizations as base with guild-specific on top.
 * For __default__ guildId, returns only the default record.
 */
export async function getGuildCustomization( guildId: string ): Promise<GuildCustomizationData | null> {
    if ( guildId === DEFAULT_GUILD_ID ) {
        return fetchRawCustomization( DEFAULT_GUILD_ID );
    }

    // Merge: defaults as base, guild-specific on top
    const [ defaultData, guildData ] = await Promise.all( [
        fetchRawCustomization( DEFAULT_GUILD_ID ),
        fetchRawCustomization( guildId )
    ] );

    if ( !defaultData && !guildData ) {
        return null;
    }

    return {
        guildId,
        components: {
            ...( defaultData?.components ?? {} ),
            ...( guildData?.components ?? {} )
        },
        createdAt: guildData?.createdAt ?? defaultData?.createdAt,
        updatedAt: guildData?.updatedAt ?? defaultData?.updatedAt
    };
}

/**
 * Update customizations for a guild.
 * Uses upsert to create if doesn't exist.
 */
export async function updateGuildCustomization(
    guildId: string,
    components: Record<string, ComponentCustomization>
): Promise<GuildCustomizationData> {
    const customization = await client.guildCustomization.upsert( {
        where: { guildId },
        update: { components },
        create: { guildId, components }
    } );

    return {
        guildId: customization.guildId,
        components: customization.components as Record<string, ComponentCustomization>,
        createdAt: customization.createdAt,
        updatedAt: customization.updatedAt
    };
}

/**
 * Update a single component's customization.
 * Merges with existing customizations.
 * Uses raw fetch to avoid merge with defaults when updating a specific guild.
 */
export async function updateComponentCustomization(
    guildId: string,
    componentName: string,
    customization: ComponentCustomization
): Promise<GuildCustomizationData> {
    // Get existing raw customizations (not merged) so we don't persist defaults into guild record
    const existing = await fetchRawCustomization( guildId );
    const components = existing?.components ?? {};

    // Merge the new customization
    components[ componentName ] = {
        ...components[ componentName ],
        ...customization
    };

    return updateGuildCustomization( guildId, components );
}

/**
 * Delete a component's customization.
 */
export async function deleteComponentCustomization(
    guildId: string,
    componentName: string
): Promise<GuildCustomizationData | null> {
    const existing = await fetchRawCustomization( guildId );

    if ( !existing ) {
        return null;
    }

    const components = { ...existing.components };
    delete components[ componentName ];

    return updateGuildCustomization( guildId, components );
}
