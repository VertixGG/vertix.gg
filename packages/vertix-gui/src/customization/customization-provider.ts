import type { ComponentCustomization } from "@vertix.gg/definitions/src/ui-customization-definitions";

export type { EmbedOverrides, ComponentCustomization, GuildCustomizationData } from "@vertix.gg/definitions/src/ui-customization-definitions";

/**
 * Interface for customization provider.
 * Implement this interface in vertix-bot to provide guild-specific customizations.
 */
export interface ICustomizationProvider {
    /**
     * Get customization for a specific component/state in a guild.
     * @param guildId - The guild ID
     * @param customizationKey - The component/state key (e.g., "ComponentName/StateKey")
     * @returns Component customization or null if none exists
     */
    getComponentCustomization(
        guildId: string,
        customizationKey: string,
        languageCode?: string
    ): Promise<ComponentCustomization | null>;

    /**
     * Get all customizations for a guild (for preloading/caching).
     * @param guildId - The guild ID
     * @returns Map of customizationKey to ComponentCustomization
     */
    getGuildCustomizations(
        guildId: string
    ): Promise<Record<string, ComponentCustomization> | null>;
}

/**
 * Default no-op customization provider.
 * Used when no provider is registered.
 */
export class NoOpCustomizationProvider implements ICustomizationProvider {
    public async getComponentCustomization(): Promise<ComponentCustomization | null> {
        return null;
    }

    public async getGuildCustomizations(): Promise<Record<string, ComponentCustomization> | null> {
        return null;
    }
}
