import { PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import type { ComponentCustomization, GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

export type { EmbedOverrides, ComponentCustomization, GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

const client = PrismaBotClient.$.getClient();

/**
 * Get all customizations for a guild.
 */
export async function getGuildCustomization( guildId: string ): Promise<GuildCustomizationData | null> {
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
 */
export async function updateComponentCustomization(
    guildId: string,
    componentName: string,
    customization: ComponentCustomization
): Promise<GuildCustomizationData> {
    // Get existing customizations
    const existing = await getGuildCustomization( guildId );
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
    const existing = await getGuildCustomization( guildId );

    if ( !existing ) {
        return null;
    }

    const components = { ...existing.components };
    delete components[ componentName ];

    return updateGuildCustomization( guildId, components );
}
